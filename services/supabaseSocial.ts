
import { supabase } from '../lib/supabaseClient';
import { Friend, Gift } from '../types';

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
        .eq('status', 'Active')
        .or(`student_id.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as Friend;
    } catch (error) {
      console.error('Error finding potential friend:', error);
      return null;
    }
  },

  /**
   * Agrega a un amigo (crea la relación bidireccional)
   */
  async addFriend(userId: string, friendId: string): Promise<void> {
    if (userId === friendId) throw new Error('No puedes agregarte a ti mismo');
    
    // Crear relación bidireccional
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
   * Elimina una amistad
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    await supabase.from('friendships').delete().eq('user_id', userId).eq('friend_id', friendId);
    await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', userId);
  },

  /**
   * ENVIAR REGALO - Usa función RPC atómica
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
    const { data, error } = await supabase.rpc('redeem_gift_at_pos', {
      p_code: code.toUpperCase(),
      p_unit_id: unitId,
    });

    if (error) throw error;

    // Obtener el regalo completo
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select(`
        *,
        item:inventory_items(name, price, image_url),
        sender:profiles!gifts_sender_id_fkey(full_name, student_id),
        receiver:profiles!gifts_receiver_id_fkey(full_name, student_id)
      `)
      .eq('id', data[0].gift_id)
      .single();

    if (giftError) throw giftError;
    return gift as Gift;
  }
};
