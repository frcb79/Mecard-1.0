
import React from 'react';
import { Plus, Info, Zap, Flame } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onInfo?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onInfo }) => {
  return (
    <div className="bento-card bg-white rounded-[44px] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full group relative">
      {product.calories && (
        <div className="absolute top-4 left-4 z-10">
           <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-white/50 shadow-sm">
              <Flame size={12} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black text-slate-700">{product.calories} kcal</span>
           </div>
        </div>
      )}
      <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[32px]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="px-8 pb-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
             <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.category}</p>
             <h3 className="font-black text-slate-800 text-xl leading-tight truncate group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          </div>
        </div>
        
        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">${product.price.toFixed(2)}</div>
          <div className="flex gap-2">
            {onInfo && (
              <button 
                onClick={() => onInfo(product)}
                className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-inner"
                title="Información AI"
              >
                <BotIcon size={18} />
              </button>
            )}
            <button 
              onClick={() => onAdd(product)}
              className="p-5 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center hover:bg-slate-950 transition-all shadow-xl shadow-indigo-100 active:scale-90"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
