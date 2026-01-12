import { supabase } from '../lib/supabaseClient';
import { Supplier } from '../types';

export const getSuppliers = async (schoolId: string): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('school_id', schoolId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found'
    console.error('Error fetching supplier:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createSupplier = async (
  supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplierData])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateSupplier = async (
  id: string,
  supplierData: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>
): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplierData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting supplier:', error);
    throw new Error(error.message);
  }
};
