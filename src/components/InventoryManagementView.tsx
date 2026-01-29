
import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, Package, AlertCircle, Save, X, Eye, 
  EyeOff, Upload, FileText, Download, CheckCircle2, Info, ChevronRight,
  Flame, Scale, ChefHat, Tag, Image as ImageIcon, DollarSign
} from 'lucide-react';
import { Product, Category, EntityOwner } from '../types';
import { Button } from './Button';

interface InventoryManagementViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  allowedCategories: Category[];
  entityName: string;
}

export const InventoryManagementView: React.FC<InventoryManagementViewProps> = ({ 
  products, 
  onUpdateProducts, 
  allowedCategories,
  entityName 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<{show: boolean, product?: Product, mode: 'create' | 'edit'}>({ show: false, mode: 'create' });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStep, setBulkStep] = useState<'upload' | 'mapping' | 'processing'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    allowedCategories.includes(p.category)
  );

  const handleDownloadTemplate = () => {
      const headers = "Nombre,Categoria,Precio,Calorias,Ingredientes(Separados por |),URL_Imagen,Disponible(SI/NO)\n";
      const example = "Wrap de Pollo,Hot Meals,45.00,450,Tortilla|Pollo|Lechuga,https://image.com/wrap.jpg,SI";
      const blob = new Blob([headers + example], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Plantilla_Inventario_MeCard.csv`;
      a.click();
  };

  const handleBulkUpload = () => {
    setBulkStep('processing');
    setIsProcessing(true);
    setTimeout(() => {
        const newItems: Product[] = Array.from({ length: 3 }).map((_, i) => ({
            id: `bulk_${Date.now()}_${i}`,
            name: `Producto Masivo ${i + 1}`,
            category: allowedCategories[0],
            price: 50.00,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            isAvailable: true,
            ownerType: entityName.toLowerCase().includes('cafeteria') ? EntityOwner.CONCESSIONAIRE : EntityOwner.SCHOOL
        }));
        onUpdateProducts([...newItems, ...products]);
        setIsProcessing(false);
        setShowBulkModal(false);
        setBulkStep('upload');
        alert("✅ Inventario actualizado masivamente.");
    }, 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const ingredientsString = formData.get('ingredients') as string;
    
    const productData = {
      name: formData.get('name') as string,
      category: formData.get('category') as Category,
      price: Number(formData.get('price')),
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      calories: Number(formData.get('calories')) || undefined,
      ingredients: ingredientsString ? ingredientsString.split(',').map(i => i.trim()) : [],
      isAvailable: true,
      ownerType: entityName.toLowerCase().includes('cafeteria') ? EntityOwner.CONCESSIONAIRE : EntityOwner.SCHOOL
    };

    if (showModal.mode === 'create') {
      const newProduct: Product = { ...productData, id: Date.now().toString() };
      onUpdateProducts([newProduct, ...products]);
    } else if (showModal.mode === 'edit' && showModal.product) {
      onUpdateProducts(products.map(p => p.id === showModal.product?.id ? { ...p, ...productData } : p));
    }
    setShowModal({ show: false, mode: 'create' });
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-0 h-full rounded-[64px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/30">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Gestión de Inventario</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[4px] mt-2">Personal del POS: {entityName}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowBulkModal(true)} className="bg-white border border-slate-200 text-slate-500 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all"><Upload size={18}/> Carga Masiva</button>
          <button onClick={() => setShowModal({ show: true, mode: 'create' })} className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-3"><Plus size={18}/> Alta Manual</button>
        </div>
      </div>

      <div className="p-10 flex-1 overflow-y-auto pb-40">
        <div className="mb-10 relative max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input placeholder="Busca por nombre o categoría..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-8 py-5 rounded-[28px] bg-slate-50 border-none outline-none font-bold text-slate-600 shadow-inner focus:ring-4 focus:ring-indigo-100 transition-all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map(product => (
            <div key={product.id} className="p-6 bg-white border border-slate-100 rounded-[48px] shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                 <div className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${product.isAvailable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                    {product.isAvailable ? 'En Stock' : 'Agotado'}
                 </div>
              </div>
              <div className="w-full aspect-[4/3] rounded-[32px] overflow-hidden mb-6 bg-slate-50 border border-slate-100">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{product.name}</h4>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{product.category}</p>
                <div className="flex items-center justify-between pt-4">
                    <p className="text-3xl font-black text-slate-700 tracking-tighter">${product.price.toFixed(2)}</p>
                    <div className="flex gap-1">
                        <button onClick={() => setShowModal({ show: true, mode: 'edit', product })} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => onUpdateProducts(products.filter(p => p.id !== product.id))} className="p-3 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-40 text-center flex flex-col items-center justify-center grayscale opacity-20">
            <Package size={120} strokeWidth={1} className="mb-6" />
            <p className="font-black uppercase tracking-[5px]">Sin registros en inventario</p>
          </div>
        )}
      </div>

      {/* MODAL ALTA MANUAL DETALLADA */}
      {showModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-3xl p-16 relative animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal({show: false, mode: 'create'})} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800 transition-colors"><X size={32}/></button>
            <div className="mb-10">
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{showModal.mode === 'create' ? 'Nuevo Artículo' : 'Editar Artículo'}</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[4px] mt-2">Detalles técnicos del producto</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Tag size={14}/> Nombre del Producto</label>
                    <input name="name" defaultValue={showModal.product?.name} required placeholder="Ej. Hamburguesa con Queso" className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-lg shadow-inner focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><ImageIcon size={14}/> URL Imagen</label>
                    <input name="image" defaultValue={showModal.product?.image} placeholder="https://..." className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-sm shadow-inner" />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Filter size={14}/> Categoría</label>
                    <select name="category" defaultValue={showModal.product?.category} className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-sm shadow-inner appearance-none">
                        {allowedCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><DollarSign size={14}/> Precio Público ($)</label>
                    <input name="price" type="number" step="0.5" defaultValue={showModal.product?.price} required className="w-full p-6 rounded-[28px] bg-slate-50 border-none outline-none font-black text-slate-700 text-3xl shadow-inner" />
                </div>
              </div>

              <div className="p-10 bg-indigo-50/50 rounded-[48px] border border-indigo-100 space-y-8">
                  <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-3"><ChefHat size={18}/> Información Nutricional (Opcional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2"><Flame size={14}/> Calorías (kcal)</label>
                        <input name="calories" type="number" defaultValue={showModal.product?.calories} placeholder="0" className="w-full p-5 rounded-[22px] bg-white border border-indigo-100 outline-none font-black text-indigo-700 text-xl" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2"><Scale size={14}/> Ingredientes (Separa con comas)</label>
                        <textarea name="ingredients" defaultValue={showModal.product?.ingredients?.join(', ')} placeholder="Ej. Pollo, Arroz, Tortilla" className="w-full p-5 rounded-[22px] bg-white border border-indigo-100 outline-none font-black text-indigo-700 text-sm h-24 resize-none" />
                      </div>
                  </div>
              </div>
              
              <div className="pt-6 flex gap-6">
                <button type="button" onClick={() => setShowModal({show: false, mode: 'create'})} className="flex-1 py-7 rounded-[32px] bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">Descartar</button>
                <Button type="submit" className="flex-[2] py-7 rounded-[32px] bg-indigo-600 text-white font-black uppercase text-[12px] tracking-[4px] shadow-2xl shadow-indigo-100">Guardar en Catálogo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARGA MASIVA */}
      {showBulkModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
            <div className="bg-white rounded-[64px] shadow-2xl w-full max-w-2xl p-16 text-center relative animate-in zoom-in duration-300">
                <button onClick={() => setShowBulkModal(false)} className="absolute top-12 right-12 text-slate-300 hover:text-slate-800 transition-colors"><X size={32}/></button>
                <div className="bg-indigo-50 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-indigo-600"><Upload size={48}/></div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">Carga Masiva de Productos</h3>
                <p className="text-slate-400 font-medium mb-12 px-10 leading-relaxed">Sube tu inventario completo usando nuestro formato estándar para evitar errores de sincronización.</p>
                
                {bulkStep === 'upload' && (
                    <div className="space-y-6">
                        <button onClick={handleBulkUpload} className="w-full py-12 border-4 border-dashed border-indigo-100 rounded-[48px] text-indigo-400 font-black text-[14px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex flex-col items-center gap-4">
                            <FileText size={48}/> Seleccionar archivo .CSV o .XLSX
                        </button>
                        <button onClick={handleDownloadTemplate} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:underline">
                            <Download size={16}/> Descargar Plantilla Oficial
                        </button>
                    </div>
                )}

                {bulkStep === 'processing' && (
                    <div className="space-y-8 py-10">
                        <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] animate-pulse">Sincronizando inventario con la nube...</p>
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  );
};
