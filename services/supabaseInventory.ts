
import { supabase } from '../lib/supabaseClient';
import { Database } from '../lib/supabaseClient';

type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];

export const inventoryService = {
  /**
   * Sube una imagen al bucket 'products' y retorna la URL pública
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
   * Crea un producto vinculando su imagen si existe
   */
  async createProduct(item: Omit<InventoryItemInsert, 'id' | 'created_at' | 'updated_at'>, imageFile?: File) {
    let imageUrl = (item as any).image_url;

    if (imageFile) {
      // Si hay nueva imagen, subirla primero
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
