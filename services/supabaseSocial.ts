import { supabase } from '../../lib/supabaseClient';

// ============================================
// TYPES & INTERFACES
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
  thank_you_message?: string;
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
// SOCIAL SERVICE (Full Production Version)
// ============================================

export const socialService = {
  /**
   * Busca un potencial amigo por ID de estudiante o nombre.
   * Utiliza ilike para búsqueda parcial y sensible a mayúsculas.
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
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error finding potential friend:', error);
      throw new Error('Error al buscar estudiante en la base de datos');
    }
  },

  /**
   * Actualiza el perfil del usuario (Privacidad de favoritos, grado, etc.)
   */
  async updateProfile(userId: string, updates: Partial<Friend>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('No se pudo actualizar el perfil');
    }
  },

  /**
   * Crea una relación de amistad bidireccional entre dos usuarios.
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      if (userId === friendId) {
        throw new Error('No puedes agregarte a ti mismo como amigo');
      }

      // Verificar existencia de la relación previa
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (existing) {
        throw new Error('Ya existe una relación de amistad o solicitud pendiente');
      }

      // Inserción bidireccional para que aparezca en ambas listas
      const { error: error1 } = await supabase
        .from('friendships')
        .insert({ user_id: userId, friend_id: friendId, status: 'accepted' });

      const { error: error2 } = await supabase
        .from('friendships')
        .insert({ user_id: friendId, friend_id: userId, status: 'accepted' });

      if (error1 || error2) throw error1 || error2;
    } catch (error: any) {
      console.error('Error adding friend:', error);
      throw new Error(error.message || 'Error al procesar la solicitud de amistad');
    }
  },

  /**
   * Obtiene la lista completa de amigos aceptados con sus perfiles.
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend:profiles!friendships_friend_id_fkey (
            id, full_name, student_id, balance, favorites, favorites_public, status, grade, allergies
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;
      return (data || []).map((f: any) => f.friend).filter((f: any) => f !== null);
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw new Error('Error al cargar la lista de amigos');
    }
  },

  /**
   * Elimina la relación de amistad de forma bidireccional.
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

      if (error1 || error2) throw error1 || error2;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw new Error('No se pudo eliminar la amistad');
    }
  },

  /**
   * ENVIAR REGALO: Llama a una función RPC en Postgres que asegura
   * que el descuento de saldo y la creación del regalo sean atómicos.
   */
  async sendGift(
    senderId: string,
    receiverId: string,
    item: { id: string; name: string; price: number },
    schoolId: string,
    message?: string
  ): Promise<{ giftId: string; code: string }> {
    try {
      const { data, error } = await supabase.rpc('process_gift_purchase', {
        p_sender_id: senderId,
        p_receiver_id: receiverId,
        p_item_id: item.id,
        p_amount: item.price,
        p_school_id: schoolId,
        p_message: message || null,
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Error en la respuesta del servidor');

      const result = data[0];
      return {
        giftId: result.gift_id,
        code: result.redemption_code,
      };
    } catch (error: any) {
      console.error('Error sending gift:', error);
      throw new Error(error.message || 'Error al procesar el envío del regalo');
    }
  },

  /**
   * CANJEAR REGALO: El POS llama a esta función para validar código y entregar.
   */
  async redeemGift(code: string, unitId: string): Promise<Gift> {
    try {
      const { data, error } = await supabase.rpc('redeem_gift_at_pos', {
        p_code: code.toUpperCase(),
        p_unit_id: unitId,
      });

      if (error) throw error;
      const result = data[0];

      // Rehidratamos el objeto con los nombres de remitente y producto para el recibo
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
      throw new Error(error.message || 'Código de regalo inválido o ya utilizado');
    }
  },

  /**
   * Envía un mensaje de agradecimiento del receptor al emisor del regalo.
   */
  async sendThankYouMessage(giftId: string, message: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gifts')
        .update({ thank_you_message: message })
        .eq('id', giftId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending thank you message:', error);
      return false;
    }
  },

  /**
   * Cancela un regalo pendiente y REEMBOLSA el dinero al saldo del alumno emisor.
   */
  async cancelGift(giftId: string, senderId: string): Promise<void> {
    try {
      const { data: gift, error: fetchError } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', giftId)
        .eq('sender_id', senderId)
        .eq('status', 'pending')
        .single();

      if (fetchError || !gift) {
        throw new Error('El regalo no se puede cancelar porque ya fue canjeado o no existe');
      }

      // 1. Cambiar estado del regalo
      const { error: updateError } = await supabase
        .from('gifts')
        .update({ status: 'cancelled' })
        .eq('id', giftId);

      if (updateError) throw updateError;

      // 2. Reembolsar saldo al perfil
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: supabase.sql`balance + ${gift.amount}` })
        .eq('id', senderId);

      if (balanceError) throw balanceError;

      // 3. Registrar la transacción de reembolso para auditoría
      await supabase.from('transactions').insert({
        school_id: gift.school_id,
        student_id: senderId,
        type: 'gift_cancelled',
        amount: gift.amount,
        status: 'completed',
        metadata: { gift_id: giftId, original_type: 'PURCHASE_REFUND' }
      });

    } catch (error: any) {
      console.error('Error cancelling gift:', error);
      throw new Error(error.message || 'Error al procesar la cancelación del regalo');
    }
  },

  /**
   * Agrega o quita un producto de la lista de favoritos/wishlist.
   */
  async toggleFavorite(userId: string, productId: string): Promise<string[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorites')
        .eq('id', userId)
        .single();

      let favs = profile?.favorites || [];
      if (favs.includes(productId)) {
        favs = favs.filter((id: string) => id !== productId);
      } else {
        favs = [...favs, productId];
      }

      const { error } = await supabase
        .from('profiles')
        .update({ favorites: favs })
        .eq('id', userId);

      if (error) throw error;
      return favs;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new Error('No se pudo actualizar la lista de favoritos');
    }
  },

  /**
   * Obtiene todos los regalos recibidos que aún no han sido canjeados.
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
      throw new Error('Error al cargar regalos recibidos');
    }
  },

  /**
   * Obtiene el historial de regalos enviados por el usuario.
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
      throw new Error('Error al cargar historial de envíos');
    }
  },

  /**
   * Genera estadísticas sociales globales del usuario (Amigos, Total regalado, etc.)
   */
  async getUserSocialStats(userId: string) {
    try {
      const [friendsCount, sentGifts, receivedGifts] = await Promise.all([
        supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'accepted'),
        supabase.from('gifts').select('amount').eq('sender_id', userId).neq('status', 'cancelled'),
        supabase.from('gifts').select('amount').eq('receiver_id', userId).eq('status', 'redeemed'),
      ]);

      return {
        friendsCount: friendsCount.count || 0,
        giftsSent: sentGifts.data?.length || 0,
        giftsReceived: receivedGifts.data?.length || 0,
        totalSent: sentGifts.data?.reduce((sum, g) => sum + Number(g.amount), 0) || 0,
        totalReceived: receivedGifts.data?.reduce((sum, g) => sum + Number(g.amount), 0) || 0,
      };
    } catch (error) {
      console.error('Error fetching social stats:', error);
      return { friendsCount: 0, giftsSent: 0, giftsReceived: 0, totalSent: 0, totalReceived: 0 };
    }
  }
};

export default socialService;
