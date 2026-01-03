import React, { useState, useMemo } from 'react';
import { X, Bot, Heart, Coffee, Pizza, Utensils, LayoutGrid } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { ProductCard } from './ProductCard';
import { Product, Category } from '../types';
import { getNutritionalInsights } from '../services/geminiService';

export const MenuView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInfoClick = async (product: Product) => {
    setSelectedProduct(product);
    setAiAnalysis(null);
    setLoading(true);
    const analysis = await getNutritionalInsights(product);
    setAiAnalysis(analysis);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setAiAnalysis(null);
  };

  // Filter products based on active tab
  const displayedProducts = useMemo(() => {
    if (activeCategory === 'All') return PRODUCTS.filter(p => !p.category.includes('Supplies')); // Exclude stationery from food menu
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const categories = [
    { id: 'All', label: 'All Items', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: Category.COMBO_MEALS, label: 'Combos', icon: <Utensils className="w-4 h-4" /> },
    { id: Category.HOT_MEALS, label: 'Hot Meals', icon: <Pizza className="w-4 h-4" /> },
    { id: Category.SNACKS, label: 'Snacks', icon: <Heart className="w-4 h-4" /> },
    { id: Category.DRINKS, label: 'Drinks', icon: <Coffee className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
        
        {/* Header & Tabs */}
        <div className="bg-white px-8 pt-8 pb-4 shadow-sm z-10">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cafeteria Menu</h1>
                <p className="text-gray-500">Explore today's delicious choices.</p>
            </header>
            
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as Category | 'All')}
                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${activeCategory === cat.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <span className="mr-2 opacity-70">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
                {displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                        {displayedProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAdd={() => alert("Added to pre-order list!")} 
                                onInfo={handleInfoClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Coffee className="w-12 h-12 mb-3 opacity-20" />
                        <p>No items found in this category.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Product Detail Modal with AI */}
        {selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-all">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                    <button 
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full z-10 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="relative h-56">
                        <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                             <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-medium text-white border border-white/20 mb-2 inline-block">
                                {selectedProduct.category}
                             </span>
                             <h3 className="text-2xl font-bold text-white leading-tight">{selectedProduct.name}</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                             <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price</h4>
                                <span className="text-3xl font-bold text-gray-900">${selectedProduct.price.toFixed(2)}</span>
                             </div>
                             <div className="text-right">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Calories</h4>
                                <span className="text-lg font-medium text-gray-700">{selectedProduct.calories} kcal</span>
                             </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredients</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedProduct.ingredients?.map((ing, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 relative overflow-hidden">
                             <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                                <Bot className="w-4 h-4" />
                                <span className="text-sm">Gemini Nutrition Facts</span>
                             </div>
                             
                             <div className="text-indigo-900 text-sm leading-relaxed min-h-[60px]">
                                {loading ? (
                                    <div className="flex items-center space-x-1 py-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                ) : (
                                    aiAnalysis
                                )}
                             </div>
                        </div>

                        <div className="mt-6">
                             <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Add to Pre-Order
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};