import { supabase } from '../lib/supabaseClient';
import type { BirthdayPool, BirthdayStudent, PoolContribution, WishlistItem } from '../types';

/**
 * Birthday & Colecta Service
 * Manages birthday pools (vaquitas/colectas), contributions, and student birthday wishlists.
 */
export const birthdayService = {

  /**
   * Get upcoming birthdays from students in the same school/campus.
   * Looks at date_of_birth and calculates which are within `daysAhead`.
   * Also fetches public favorites as wishlist items.
   */
  async getUpcomingBirthdays(
    schoolId: string,
    campusId?: string,
    daysAhead = 30
  ): Promise<{ data: BirthdayStudent[]; error: any }> {
    try {
      let query = supabase
        .from('students')
        .select('id, full_name, grade, photo_url, date_of_birth')
        .eq('school_id', schoolId)
        .eq('status', 'ACTIVE')
        .not('date_of_birth', 'is', null);

      if (campusId) {
        query = query.eq('campus_id', campusId);
      }

      const { data: students, error } = await query;
      if (error) throw error;
      if (!students || students.length === 0) return { data: [], error: null };

      const today = new Date();
      const currentYear = today.getFullYear();

      const upcoming: BirthdayStudent[] = [];

      for (const s of students) {
        const dob = new Date(s.date_of_birth + 'T12:00:00');
        // Calculate this year's birthday
        const bday = new Date(currentYear, dob.getMonth(), dob.getDate());
        // If already passed this year, check next year
        if (bday < today) {
          bday.setFullYear(currentYear + 1);
        }
        const diffMs = bday.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysUntil <= daysAhead) {
          // Fetch public favorites as wishlist
          const { data: favs } = await supabase
            .from('student_favorites')
            .select('product_id, product_name, product_image')
            .eq('student_id', s.id)
            .eq('is_public', true);

          const wishlist: WishlistItem[] = (favs || []).map(f => ({
            id: f.product_id,
            name: f.product_name || 'Producto',
            emoji: '🎁',
            price: 0,
            category: 'Favorito',
          }));

          upcoming.push({
            id: s.id,
            fullName: s.full_name,
            grade: s.grade || '',
            photo: s.photo_url || undefined,
            birthday: bday.toISOString().slice(0, 10),
            wishlist,
            daysUntil,
          });
        }
      }

      upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
      return { data: upcoming, error: null };
    } catch (error) {
      console.error('Error fetching upcoming birthdays:', error);
      return { data: [], error };
    }
  },

  /**
   * Create a new birthday pool (colecta).
   */
  async createPool(params: {
    birthdayStudentId: string;
    creatorId: string;
    creatorType: 'STUDENT' | 'PARENT';
    targetProductName: string;
    targetProductImage?: string;
    targetProductId?: string;
    targetAmount: number;
    birthdayDate: string;
    message?: string;
    expiresAt: string;
  }): Promise<{ data: BirthdayPool | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('birthday_pools')
        .insert({
          birthday_student_id: params.birthdayStudentId,
          creator_id: params.creatorId,
          creator_type: params.creatorType,
          target_product_id: params.targetProductId || null,
          target_product_name: params.targetProductName,
          target_product_image: params.targetProductImage || null,
          target_amount: params.targetAmount,
          birthday_date: params.birthdayDate,
          message: params.message || null,
          expires_at: params.expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: mapPoolRow(data), error: null };
    } catch (error) {
      console.error('Error creating birthday pool:', error);
      return { data: null, error };
    }
  },

  /**
   * Contribute to an existing pool. Auto-marks as FUNDED when target reached.
   */
  async contribute(params: {
    poolId: string;
    contributorId: string;
    contributorType: 'STUDENT' | 'PARENT';
    contributorName: string;
    amount: number;
  }): Promise<{ success: boolean; pool?: BirthdayPool; error?: any }> {
    try {
      // Insert contribution
      const { error: cErr } = await supabase
        .from('pool_contributions')
        .insert({
          pool_id: params.poolId,
          contributor_id: params.contributorId,
          contributor_type: params.contributorType,
          contributor_name: params.contributorName,
          amount: params.amount,
        });

      if (cErr) throw cErr;

      // Update pool collected amount
      const { data: pool, error: pErr } = await supabase
        .from('birthday_pools')
        .select('*')
        .eq('id', params.poolId)
        .single();

      if (pErr) throw pErr;

      const newCollected = parseFloat(pool.collected_amount) + params.amount;
      const isFunded = newCollected >= parseFloat(pool.target_amount);

      const { error: uErr } = await supabase
        .from('birthday_pools')
        .update({
          collected_amount: newCollected,
          ...(isFunded ? { status: 'FUNDED', funded_at: new Date().toISOString() } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.poolId);

      if (uErr) throw uErr;

      // Return updated pool
      const updated = await this.getPoolById(params.poolId);
      return { success: true, pool: updated.data || undefined };
    } catch (error) {
      console.error('Error contributing to pool:', error);
      return { success: false, error };
    }
  },

  /**
   * Get all active pools, optionally filtered by school.
   */
  async getActivePools(schoolId?: string): Promise<{ data: BirthdayPool[]; error: any }> {
    try {
      let query = supabase
        .from('birthday_pools')
        .select(`
          *,
          pool_contributions (*)
        `)
        .eq('status', 'OPEN')
        .order('birthday_date', { ascending: true });

      // If schoolId provided, filter through birthday_student_id's school
      const { data, error } = await query;
      if (error) throw error;

      const pools = (data || []).map((row: any) => mapPoolRow(row, row.pool_contributions));
      return { data: pools, error: null };
    } catch (error) {
      console.error('Error fetching active pools:', error);
      return { data: [], error };
    }
  },

  /**
   * Get a single pool with its contributions.
   */
  async getPoolById(poolId: string): Promise<{ data: BirthdayPool | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('birthday_pools')
        .select(`
          *,
          pool_contributions (*)
        `)
        .eq('id', poolId)
        .single();

      if (error) throw error;
      return { data: mapPoolRow(data, data.pool_contributions), error: null };
    } catch (error) {
      console.error('Error fetching pool:', error);
      return { data: null, error };
    }
  },

  /**
   * Refund all contributions and mark pool as REFUNDED.
   */
  async refundPool(poolId: string): Promise<{ success: boolean; error?: any }> {
    try {
      await supabase
        .from('pool_contributions')
        .update({ refunded: true })
        .eq('pool_id', poolId);

      await supabase
        .from('birthday_pools')
        .update({ status: 'REFUNDED', updated_at: new Date().toISOString() })
        .eq('id', poolId);

      return { success: true };
    } catch (error) {
      console.error('Error refunding pool:', error);
      return { success: false, error };
    }
  },

  /**
   * Mark pool as delivered.
   */
  async deliverPool(poolId: string): Promise<{ success: boolean; error?: any }> {
    try {
      await supabase
        .from('birthday_pools')
        .update({
          status: 'DELIVERED',
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', poolId);

      return { success: true };
    } catch (error) {
      console.error('Error delivering pool:', error);
      return { success: false, error };
    }
  },
};

// ─── Row Mapper ─────────────────────────────────────

function mapPoolRow(row: any, contributions?: any[]): BirthdayPool {
  const contribs: PoolContribution[] = (contributions || []).map((c: any) => ({
    id: c.id,
    poolId: c.pool_id,
    contributorId: c.contributor_id,
    contributorType: c.contributor_type,
    contributorName: c.contributor_name,
    amount: parseFloat(c.amount),
    refunded: c.refunded,
    createdAt: c.created_at,
  }));

  return {
    id: row.id,
    birthdayStudentId: row.birthday_student_id,
    birthdayStudentName: '', // Caller can enrich
    birthdayDate: row.birthday_date,
    targetItem: {
      id: row.target_product_id || row.id,
      name: row.target_product_name,
      emoji: '🎁',
      price: parseFloat(row.target_amount),
      image: row.target_product_image || undefined,
      category: '',
    },
    targetAmount: parseFloat(row.target_amount),
    collectedAmount: parseFloat(row.collected_amount),
    contributors: contribs,
    status: row.status,
    message: row.message || undefined,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}
