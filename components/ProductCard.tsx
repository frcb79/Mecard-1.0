import React from 'react';
import { Plus, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onInfo?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, onInfo }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative h-40 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">{product.name}</h3>
          <span className="font-bold text-indigo-600">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 flex-1">{product.category}</p>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onAdd(product)}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
          {onInfo && (
            <button 
              onClick={() => onInfo(product)}
              className="px-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Nutritional Info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};