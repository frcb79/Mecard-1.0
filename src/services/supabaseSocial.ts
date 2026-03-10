
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
        .from('students')
        .select('id, full_name, student_id, school_id, grade, balance, status')
        .eq('school_id', schoolId)
        .eq('status', 'ACTIVE')
        .or(`student_id.eq.${searchTerm},id.eq.${searchTerm},full_name.ilike.%${searchTerm}%`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data ? mapFriendFromStudentRow(data) : null, error: null };
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
          id, full_name, student_id, school_id, favorites, favorites_public, status, grade, allergies
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) throw error;
    return (data || [])
      .map((f: any) => mapFriendFromProfileRow(f.friend))
      .filter((f: Friend | null) => f !== null) as Friend[];
  },

  /**
   * Obtiene regalos recibidos
   */
  async getReceivedGifts(userId: string): Promise<{ data: Gift[] | null; error: any }> {
    const receiver = await resolveStudentRecord(userId);
    if (!receiver) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('gifts')
      .select(`
        *,
        item:products!gifts_inventory_item_id_fkey(name, price, image_url),
        sender:students!gifts_sender_id_fkey(full_name, student_id)
      `)
      .eq('receiver_id', receiver.id)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    return { data: (data || []).map(mapGiftRow), error };
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
    const sender = await resolveStudentRecord(senderId, schoolId);
    const receiver = await resolveStudentRecord(receiverId, schoolId);

    if (!sender) throw new Error('No se pudo resolver el estudiante remitente');
    if (!receiver) throw new Error('No se pudo resolver el estudiante destinatario');

    const product = await loadProductSnapshot(item.id);

    // Generate unique redemption code
    const redemptionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create gift record WITHOUT charging sender
    const { data, error } = await supabase
      .from('gifts')
      .insert({
        sender_id: sender.id,
        sender_name: sender.full_name,
        sender_student_id: sender.student_id,
        receiver_id: receiver.id,
        receiver_name: receiver.full_name,
        receiver_student_id: receiver.student_id,
        inventory_item_id: product.id,
        product_name: product.name,
        product_image: product.image_url || null,
        amount: item.price > 0 ? item.price : product.price,
        school_id: sender.school_id || schoolId,
        status: 'PENDING',
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
      .eq('status', 'PENDING')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') throw new Error('Código no encontrado o ya canjeado.');
      throw fetchError;
    }

    if (!giftData) throw new Error('Código no encontrado o ya canjeado.');

    // Create wallet transactions: sender charged, receiver credited
    const now = new Date().toISOString();

    // Insert two transactions: GIFT_SENT (sender debit) and GIFT_RECEIVED (receiver credit)
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          id: crypto.randomUUID(),
          student_id: giftData.sender_id,
          type: 'GIFT_SENT',
          amount: -giftData.amount,
          unit_id: unitId,
          description: `Regalaste ${giftData.product_name} a un compañero`,
          metadata: { giftId: giftData.id, redemptionCode: code.toUpperCase() },
          status: 'COMPLETED',
          created_at: now,
        },
        {
          id: crypto.randomUUID(),
          student_id: giftData.receiver_id,
          type: 'GIFT_RECEIVED',
          amount: 0, // Receiver doesn't pay, gets product
          unit_id: unitId,
          description: `Recibiste ${giftData.product_name} como regalo`,
          metadata: { giftId: giftData.id, redemptionCode: code.toUpperCase() },
          status: 'COMPLETED',
          created_at: now,
        }
      ]);

    if (transactionError) throw transactionError;

    // Update gift to redeemed status
    const { data: redeemedGift, error: updateError } = await supabase
      .from('gifts')
      .update({
        status: 'REDEEMED',
        redeeming_student_id: giftData.receiver_id,
        location_id: unitId,
        redeemed_at: now
      })
      .eq('redemption_code', code.toUpperCase())
      .select(`
        *,
        item:products!gifts_inventory_item_id_fkey(name, price, image_url),
        receiver:students!gifts_receiver_id_fkey(full_name, student_id)
      `)
      .single();

    if (updateError) throw updateError;

    return mapGiftRow(redeemedGift);
  },

  /**
   * Rechaza un regalo pendiente sin generar cargos.
   */
  async declineGift(giftId: string, receiverId: string): Promise<void> {
    const receiver = await resolveStudentRecord(receiverId);
    if (!receiver) {
      throw new Error('No se pudo resolver el estudiante destinatario');
    }

    const { error } = await supabase
      .from('gifts')
      .update({ status: 'CANCELLED' })
      .eq('id', giftId)
      .eq('receiver_id', receiver.id)
      .eq('status', 'PENDING');

    if (error) throw error;
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

type StudentRow = {
  id: string;
  full_name: string;
  student_id: string;
  school_id: string;
  grade?: string | null;
  balance?: number | null;
  status?: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string;
  student_id?: string | null;
  school_id?: string | null;
  grade?: string | null;
  balance?: number | null;
  favorites?: string[] | null;
  favorites_public?: boolean | null;
  allergies?: string[] | null;
  status?: string | null;
};

function mapFriendFromStudentRow(row: StudentRow): Friend {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    grade: row.grade || undefined,
    balance: Number(row.balance || 0),
    favorites: null,
    favoritesPublic: true,
    allergies: null,
    status: (row.status as any) || 'ACTIVE',
    schoolId: row.school_id,
  };
}

function mapFriendFromProfileRow(row: ProfileRow | null | undefined): Friend | null {
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id || '',
    grade: row.grade || undefined,
    balance: Number(row.balance || 0),
    favorites: row.favorites || null,
    favoritesPublic: row.favorites_public ?? true,
    allergies: row.allergies || null,
    status: (row.status as any) || 'ACTIVE',
    schoolId: row.school_id || '',
  };
}

function mapGiftRow(row: any): Gift {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name || row.sender?.full_name || '',
    senderStudentId: row.sender_student_id || row.sender?.student_id || '',
    receiverId: row.receiver_id,
    receiverName: row.receiver_name || row.receiver?.full_name || '',
    receiverStudentId: row.receiver_student_id || row.receiver?.student_id || '',
    inventoryItemId: row.inventory_item_id,
    productName: row.product_name,
    productImage: row.product_image || row.item?.image_url || undefined,
    amount: Number(row.amount || row.item?.price || 0),
    redemptionCode: row.redemption_code,
    status: row.status,
    message: row.message || undefined,
    thankYouMessage: row.thank_you_message || undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    redeemableAt: row.redeemable_at || undefined,
    redeemedAt: row.redeemed_at || undefined,
    redeemingStudentId: row.redeeming_student_id || undefined,
    locationId: row.location_id || undefined,
    metadata: row.metadata || undefined,
  };
}

async function resolveStudentRecord(identifier: string, schoolId?: string): Promise<StudentRow | null> {
  const directStudent = await supabase
    .from('students')
    .select('id, full_name, student_id, school_id, grade, balance, status')
    .eq('id', identifier)
    .maybeSingle();

  if (directStudent.data) {
    return directStudent.data;
  }

  const byStudentCodeDirect = await supabase
    .from('students')
    .select('id, full_name, student_id, school_id, grade, balance, status')
    .eq('student_id', identifier)
    .maybeSingle();

  if (byStudentCodeDirect.data) {
    if (!schoolId || byStudentCodeDirect.data.school_id === schoolId) {
      return byStudentCodeDirect.data;
    }
  }

  const profileLookup = await supabase
    .from('profiles')
    .select('student_id, school_id')
    .eq('id', identifier)
    .maybeSingle();

  const studentCode = profileLookup.data?.student_id;
  const profileSchoolId = profileLookup.data?.school_id || schoolId;

  if (!studentCode || !profileSchoolId) {
    return null;
  }

  const byStudentCode = await supabase
    .from('students')
    .select('id, full_name, student_id, school_id, grade, balance, status')
    .eq('student_id', studentCode)
    .eq('school_id', profileSchoolId)
    .maybeSingle();

  return byStudentCode.data || null;
}

async function loadProductSnapshot(productId: string): Promise<{ id: string; name: string; price: number; image_url?: string | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image_url')
    .eq('id', productId)
    .single();

  if (error || !data) {
    throw new Error('No se pudo cargar el producto del regalo');
  }

  return data;
}
