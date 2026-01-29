
import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/supabaseClient';

type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];

export const inventoryService = {
  /**
   * Obtiene todos los productos (para exploración de alumnos)
   */
  async getInventory(scope: string = 'all') {
    let query = supabase.from('inventory_items').select('*').eq('status', 'active');
    
    // Si scope no es 'all', podríamos filtrar por school_id si existiera en la tabla
    const { data, error } = await query;
    if (error) throw error;
    
    // Mapping format to match UI expected properties
    return (data || []).map(item => ({
      ...item,
      image_url: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    }));
  },

  /**
   * Sube una imagen al bucket 'products'
   */
  async uploadProductImage(file: File, path: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Crea un producto
   */
  async createProduct(item: Omit<InventoryItemInsert, 'id' | 'created_at' | 'updated_at'>, imageFile?: File) {
    let imageUrl = (item as any).image_url;

    if (imageFile) {
      try {
        imageUrl = await this.uploadProductImage(imageFile, (item as any).unit_id);
      } catch (e) {
        console.error("Error subiendo imagen:", e);
        throw new Error("Falló la subida de la imagen del producto");
      }
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{ ...item, image_url: imageUrl }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene productos activos de una unidad específica
   */
  async getProductsByUnit(unitId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('unit_id', unitId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }
};
