
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
   * ENVIAR REGALO - DEFERRED CHARGING
   * NO COBRA al sender hasta que el receiver lo canjee en POS
   * Solo crea un record de regalo con status PENDING
   */
  async sendGift(
    senderId: string,
    receiverId: string,
    item: { id: string; name: string; price: number },
    schoolId: string,
    message?: string
  ): Promise<{ giftId: string; code: string }> {
    // Generate unique redemption code
    const redemptionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create gift record WITHOUT charging sender
    const { data, error } = await supabase
      .from('gifts')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        inventory_item_id: item.id,
        product_name: item.name,
        amount: item.price,
        school_id: schoolId,
        status: 'pending',
        message: message || null,
        redemption_code: redemptionCode,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Expires in 30 days
      })
      .select('id')
      .single();

    if (error) throw error;

    return {
      giftId: data.id,
      code: redemptionCode
    };
  },

  /**
   * CANJEAR REGALO EN POS
   * CRITICAL: Triggers deferred charging when gift is redeemed
   */
  async redeemGift(code: string, unitId: string): Promise<Gift> {
    // First, fetch the gift to get sender/receiver info
    const { data: giftData, error: fetchError } = await supabase
      .from('gifts')
      .select('*')
      .eq('redemption_code', code.toUpperCase())
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') throw new Error('Código no encontrado o ya canjeado.');
      throw fetchError;
    }

    if (!giftData) throw new Error('Código no encontrado o ya canjeado.');

    // Create wallet transactions: sender charged, receiver credited
    const transactionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert two transactions: GIFT_SENT (sender debit) and GIFT_RECEIVED (receiver credit)
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: giftData.sender_id,
          transaction_type: 'GIFT_SENT',
          amount: -giftData.amount,
          description: `Regalaste ${giftData.product_name} a un compañero`,
          gift_id: giftData.id,
          created_at: now,
          school_id: giftData.school_id
        },
        {
          id: crypto.randomUUID(),
          user_id: giftData.receiver_id,
          transaction_type: 'GIFT_RECEIVED',
          amount: 0, // Receiver doesn't pay, gets product
          description: `Recibiste ${giftData.product_name} como regalo`,
          gift_id: giftData.id,
          created_at: now,
          school_id: giftData.school_id
        }
      ]);

    if (transactionError) throw transactionError;

    // Update gift to redeemed status
    const { data: redeemedGift, error: updateError } = await supabase
      .from('gifts')
      .update({
        status: 'redeemed',
        redeemed_at: now
      })
      .eq('redemption_code', code.toUpperCase())
      .select(`
        *,
        item:inventory_items(name, price, image_url),
        receiver:profiles!gifts_receiver_id_fkey(full_name, student_id)
      `)
      .single();

    if (updateError) throw updateError;

    return redeemedGift as Gift;
  },

  // ============================================
  // STUDENT FAVORITES / WISHLIST
  // ============================================

  /**
   * Agrega un producto a favoritos
   */
  async addFavorite(
    studentId: string,
    schoolId: string,
    productId: string,
    productName: string,
    productImage?: string,
    isPublic: boolean = true
  ): Promise<void> {
    const { error } = await supabase
      .from('student_favorites')
      .insert({
        student_id: studentId,
        school_id: schoolId,
        product_id: productId,
        product_name: productName,
        product_image: productImage,
        is_public: isPublic,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  /**
   * Remueve un producto de favoritos
   */
  async removeFavorite(studentId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('student_favorites')
      .delete()
      .eq('student_id', studentId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  /**
   * Obtiene todos los favoritos de un estudiante
   */
  async getStudentFavorites(studentId: string) {
    const { data, error } = await supabase
      .from('student_favorites')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene favoritos públicos de un estudiante (para que otros vean qué regalarle)
   */
  async getPublicFavorites(studentId: string) {
    const { data, error } = await supabase
      .from('student_favorites')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Toggle favori status de un producto
   */
  async toggleProductFavorite(
    studentId: string,
    schoolId: string,
    productId: string,
    productName: string,
    productImage?: string
  ): Promise<boolean> {
    // Verificar si existe
    const { data: existing } = await supabase
      .from('student_favorites')
      .select('id')
      .eq('student_id', studentId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Remover
      await this.removeFavorite(studentId, productId);
      return false;
    } else {
      // Agregar
      await this.addFavorite(studentId, schoolId, productId, productName, productImage, true);
      return true;
    }
  }
};
