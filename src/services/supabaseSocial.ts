
import { supabase } from '../lib/supabaseClient';
import { Friend, Gift } from '../types';
import { NotificationService } from './notificationService';
import { NotificationType } from '../types';

export const socialService = {
  /**
   * Busca un potencial amigo por ID de estudiante o nombre
   */
  async findPotentialFriend(schoolId: string, searchTerm: string): Promise<{ data: Friend | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, balance, favorites, favorites_public, status, grade')
        .eq('school_id', schoolId)
        .eq('status', 'Active')
        .or(`student_id.eq.${searchTerm},id.eq.${searchTerm},full_name.ilike.%${searchTerm}%`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data as Friend, error: null };
    } catch (error) {
      console.error('Error finding potential friend:', error);
      return { data: null, error };
    }
  },

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(userId: string, updates: Partial<Friend>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  },

  /**
   * Agrega o quita un producto de favoritos
   */
  async toggleFavorite(userId: string, productId: string): Promise<string[]> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('favorites')
      .eq('id', userId)
      .single();
    
    let favorites = profile?.favorites || [];
    if (favorites.includes(productId)) {
      favorites = favorites.filter((id: string) => id !== productId);
    } else {
      favorites = [...favorites, productId];
    }

    await this.updateProfile(userId, { favorites });
    return favorites;
  },

  /**
   * Envía una notificación de agradecimiento al remitente de un regalo
   */
  async sendThankYouMessage(giftId: string, senderId: string, text: string): Promise<void> {
    // Actualizar el regalo con el mensaje
    const { error } = await supabase
      .from('gifts')
      .update({ thank_you_message: text })
      .eq('id', giftId);
    
    if (error) throw error;

    // Enviar notificación al remitente
    NotificationService.send(
      senderId,
      NotificationType.PURCHASE_ALERT,
      "¡Te enviaron un agradecimiento! 🎁",
      `Un amigo dice: "${text}"`
    );
  },

  /**
   * Agrega a un amigo (crea la relación bidireccional)
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) throw new Error('No puedes agregarte a ti mismo');
    
    const { error } = await supabase
      .from('friendships')
      .insert([
        { user_id: userId, friend_id: friendId, status: 'accepted' },
        { user_id: friendId, friend_id: userId, status: 'accepted' }
      ]);

    if (error) throw error;
  },

  /**
   * Obtiene la lista de amigos
   */
  async getFriends(userId: string): Promise<Friend[]> {
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
  },

  /**
   * Obtiene regalos recibidos
   */
  async getReceivedGifts(userId: string): Promise<{ data: Gift[] | null; error: any }> {
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

    return { data: data as Gift[], error };
  },

  /**
   * ENVIAR REGALO
   */
  async sendGift(
    senderId: string,
    receiverId: string,
    item: { id: string; name: string; price: number },
    schoolId: string,
    message?: string
  ): Promise<{ giftId: string; code: string }> {
    const { data, error } = await supabase.rpc('process_gift_purchase', {
      p_sender_id: senderId,
      p_receiver_id: receiverId,
      p_item_id: item.id,
      p_amount: item.price,
      p_school_id: schoolId,
      p_message: message || null,
    });

    if (error) throw error;
    return {
      giftId: data[0].gift_id,
      code: data[0].redemption_code,
    };
  },

  /**
   * CANJEAR REGALO EN POS
   */
  async redeemGift(code: string, unitId: string): Promise<Gift> {
    const { data, error } = await supabase
      .from('gifts')
      .update({ 
        status: 'redeemed', 
        redeemed_at: new Date().toISOString()
      })
      .eq('redemption_code', code.toUpperCase())
      .eq('status', 'pending')
      .select(`
        *,
        item:inventory_items(name, price, image_url),
        receiver:profiles!gifts_receiver_id_fkey(full_name, student_id)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new Error('Código no encontrado o ya canjeado.');
      throw error;
    }
    return data as Gift;
  }
};
