// src/services/supabase/socialService.ts
import { supabase } from '../../lib/supabaseClient';

// ============================================
// TIPOS
// ============================================

export interface Friend {
  id: string;
  full_name: string;
  student_id: string;
  balance: number;
  favorites: string[] | null;
  favorites_public: boolean;
  status: string;
  grade?: string;
  allergies?: string[] | null;
}

export interface Gift {
  id: string;
  sender_id: string;
  receiver_id: string;
  inventory_item_id: string;
  redemption_code: string;
  amount: number;
  status: 'pending' | 'redeemed' | 'expired' | 'cancelled';
  message?: string;
  created_at: string;
  expires_at: string;
  redeemed_at?: string;
  item?: {
    name: string;
    price: number;
    image_url?: string;
  };
  sender?: {
    full_name: string;
    student_id: string;
  };
  receiver?: {
    full_name: string;
    student_id: string;
  };
}

// ============================================
// SERVICIO SOCIAL
// ============================================

export const socialService = {
  /**
   * Busca un potencial amigo por ID de estudiante o nombre
   */
  async findPotentialFriend(schoolId: string, searchTerm: string): Promise<Friend | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, balance, favorites, favorites_public, status, grade')
        .eq('school_id', schoolId)
        .eq('status', 'active')
        .or(`student_id.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding potential friend:', error);
      throw new Error('Error al buscar estudiante');
    }
  },

  /**
   * Agrega a un amigo (crea la relación bidireccional)
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Validar que no se agregue a sí mismo
      if (userId === friendId) {
        throw new Error('No puedes agregarte a ti mismo como amigo');
      }

      // Verificar si ya son amigos
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .single();

      if (existing) {
        throw new Error('Ya son amigos');
      }

      // Crear relación bidireccional
      const { error: error1 } = await supabase
        .from('friendships')
        .insert({ user_id: userId, friend_id: friendId, status: 'accepted' });

      const { error: error2 } = await supabase
        .from('friendships')
        .insert({ user_id: friendId, friend_id: userId, status: 'accepted' });

      if (error1 || error2) {
        throw error1 || error2;
      }
    } catch (error: any) {
      console.error('Error adding friend:', error);
      throw new Error(error.message || 'Error al agregar amigo');
    }
  },

  /**
   * Obtiene la lista de amigos con sus datos
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend:profiles!friendships_friend_id_fkey (
            id, 
            full_name, 
            student_id, 
            balance, 
            favorites, 
            favorites_public,
            status,
            grade,
            allergies
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;

      return (data || []).map((f: any) => f.friend).filter((f: any) => f !== null);
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw new Error('Error al obtener amigos');
    }
  },

  /**
   * Elimina una amistad (bidireccional)
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const { error: error1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      const { error: error2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (error1 || error2) {
        throw error1 || error2;
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      throw new Error('Error al eliminar amigo');
    }
  },

  /**
   * ENVIAR REGALO - Usa función RPC atómica para seguridad
   */
  async sendGift(
    senderId: string,
    receiverId: string,
    item: { id: string; name: string; price: number },
    schoolId: string,
    message?: string
  ): Promise<{ giftId: string; code: string }> {
    try {
      // Llamar a la función RPC que maneja todo de forma atómica
      const { data, error } = await supabase.rpc('process_gift_purchase', {
        p_sender_id: senderId,
        p_receiver_id: receiverId,
        p_item_id: item.id,
        p_amount: item.price,
        p_school_id: schoolId,
        p_message: message || null,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No se pudo procesar el regalo');
      }

      const result = data[0];

      return {
        giftId: result.gift_id,
        code: result.redemption_code,
      };
    } catch (error: any) {
      console.error('Error sending gift:', error);
      throw new Error(error.message || 'Error al enviar regalo');
    }
  },

  /**
   * CANJEAR REGALO EN POS - Usa función RPC atómica
   */
  async redeemGift(code: string, unitId: string): Promise<Gift> {
    try {
      // Llamar a la función RPC que maneja el canje de forma atómica
      const { data, error } = await supabase.rpc('redeem_gift_at_pos', {
        p_code: code.toUpperCase(),
        p_unit_id: unitId,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No se pudo canjear el regalo');
      }

      const result = data[0];

      // Obtener el regalo completo con todos sus datos
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select(`
          *,
          item:inventory_items(name, price, image_url),
          sender:profiles!gifts_sender_id_fkey(full_name, student_id),
          receiver:profiles!gifts_receiver_id_fkey(full_name, student_id)
        `)
        .eq('id', result.gift_id)
        .single();

      if (giftError) throw giftError;

      return gift as Gift;
    } catch (error: any) {
      console.error('Error redeeming gift:', error);
      throw new Error(error.message || 'Código inválido o ya canjeado');
    }
  },

  /**
   * Obtiene regalos recibidos pendientes
   */
  async getReceivedGifts(userId: string): Promise<Gift[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          item:inventory_items(name, price, image_url),
          sender:profiles!gifts_sender_id_fkey(full_name, student_id)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Gift[];
    } catch (error) {
      console.error('Error fetching received gifts:', error);
      throw new Error('Error al obtener regalos recibidos');
    }
  },

  /**
   * Obtiene regalos enviados
   */
  async getSentGifts(userId: string): Promise<Gift[]> {
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          item:inventory_items(name, price, image_url),
          receiver:profiles!gifts_receiver_id_fkey(full_name, student_id)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data as Gift[];
    } catch (error) {
      console.error('Error fetching sent gifts:', error);
      throw new Error('Error al obtener regalos enviados');
    }
  },

  /**
   * Obtiene historial completo de regalos (enviados y recibidos)
   */
  async getGiftHistory(userId: string): Promise<{
    sent: Gift[];
    received: Gift[];
  }> {
    try {
      const [sent, received] = await Promise.all([
        this.getSentGifts(userId),
        this.getReceivedGifts(userId),
      ]);

      return { sent, received };
    } catch (error) {
      console.error('Error fetching gift history:', error);
      throw new Error('Error al obtener historial de regalos');
    }
  },

  /**
   * Cancela un regalo pendiente (solo si aún no ha sido canjeado)
   */
  async cancelGift(giftId: string, senderId: string): Promise<void> {
    try {
      // Verificar que el regalo existe y es del sender
      const { data: gift, error: fetchError } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', giftId)
        .eq('sender_id', senderId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !gift) {
        throw new Error('Regalo no encontrado o ya canjeado');
      }

      // Marcar como cancelado
      const { error: updateError } = await supabase
        .from('gifts')
        .update({ status: 'cancelled' })
        .eq('id', giftId);

      if (updateError) throw updateError;

      // Devolver el saldo al sender
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: supabase.sql`balance + ${gift.amount}` })
        .eq('id', senderId);

      if (balanceError) throw balanceError;

      // Registrar transacción de cancelación
      await supabase.from('transactions').insert({
        school_id: gift.school_id,
        student_id: senderId,
        type: 'gift_cancelled',
        amount: gift.amount,
        status: 'completed',
        metadata: { gift_id: giftId },
      });
    } catch (error: any) {
      console.error('Error cancelling gift:', error);
      throw new Error(error.message || 'Error al cancelar regalo');
    }
  },

  /**
   * Actualiza favoritos del usuario
   */
  async updateFavorites(
    userId: string,
    favorites: string[],
    isPublic: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          favorites: favorites,
          favorites_public: isPublic,
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating favorites:', error);
      throw new Error('Error al actualizar favoritos');
    }
  },

  /**
   * Obtiene estadísticas sociales del usuario
   */
  async getUserSocialStats(userId: string) {
    try {
      const [friendsCount, sentGifts, receivedGifts] = await Promise.all([
        supabase
          .from('friendships')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'accepted'),
        
        supabase
          .from('gifts')
          .select('amount')
          .eq('sender_id', userId),
        
        supabase
          .from('gifts')
          .select('amount')
          .eq('receiver_id', userId)
          .eq('status', 'redeemed'),
      ]);

      const totalSent = sentGifts.data?.reduce((sum, g) => sum + Number(g.amount), 0) || 0;
      const totalReceived = receivedGifts.data?.reduce((sum, g) => sum + Number(g.amount), 0) || 0;

      return {
        friendsCount: friendsCount.count || 0,
        giftsSent: sentGifts.data?.length || 0,
        giftsReceived: receivedGifts.data?.length || 0,
        totalSent,
        totalReceived,
      };
    } catch (error) {
      console.error('Error fetching social stats:', error);
      return {
        friendsCount: 0,
        giftsSent: 0,
        giftsReceived: 0,
        totalSent: 0,
        totalReceived: 0,
      };
    }
  },
};

export default socialService;
