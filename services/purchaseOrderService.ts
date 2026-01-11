import { supabase } from '../lib/supabaseClient';
import { PurchaseOrder, PurchaseOrderItem } from '../types';

type PurchaseOrderPayload = Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'items'> & {
  items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id'>[];
};

// Get all purchase orders for a school, with optional filtering
export const getPurchaseOrders = async (schoolId: string, unitId?: string): Promise<PurchaseOrder[]> => {
  let query = supabase
    .from('purchase_orders')
    .select(`
      *,
      supplier:suppliers(*),
      unit:operating_units(*)
    `)
    .eq('school_id', schoolId);

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query.order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Get a single purchase order with its items
export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      items:purchase_order_items(*, product:products(*)),
      supplier:suppliers(*),
      unit:operating_units(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching purchase order details:', error);
    throw new Error(error.message);
  }

  return data;
};

// Create a new purchase order and its items
export const createPurchaseOrder = async (payload: PurchaseOrderPayload): Promise<PurchaseOrder> => {
  // Separate items from the main PO data
  const { items, ...orderData } = payload;

  // Insert the purchase order
  const { data: poData, error: poError } = await supabase
    .from('purchase_orders')
    .insert(orderData)
    .select()
    .single();

  if (poError) {
    console.error('Error creating purchase order:', poError);
    throw poError;
  }

  // Prepare and insert the items for the new purchase order
  const itemsToInsert = items.map(item => ({
    ...item,
    purchase_order_id: poData.id,
  }));

  const { error: itemsError } = await supabase
    .from('purchase_order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error creating purchase order items:', itemsError);
    // If items fail, should we delete the PO? For now, we'll leave it
    // but in a real app, a transaction would be better.
    throw itemsError;
  }

  // Return the full PO with items
  return getPurchaseOrderById(poData.id) as Promise<PurchaseOrder>;
};

// Update a purchase order (e.g., change status, notes)
export const updatePurchaseOrder = async (
  id: string,
  updates: Partial<PurchaseOrder>
): Promise<PurchaseOrder> => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }

  return data;
};

// Delete a purchase order (should only be allowed for drafts)
export const deletePurchaseOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting purchase order:', error);
    throw error;
  }
};
