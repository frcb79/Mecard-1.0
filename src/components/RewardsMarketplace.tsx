/**
 * RewardsMarketplace Component
 * Marketplace de productos canjeables con puntos
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  X,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Zap,
  Package,
  ChevronRight
} from 'lucide-react';
import { useRewards } from '../hooks/useRewards';
import { rewardsService } from '../services/rewardsService';
import { MarketplaceCategory } from '../types';

interface RewardsMarketplaceProps {
  studentId: string;
  schoolId: string;
  onRedemptionSuccess?: () => void;
}

export const RewardsMarketplace: React.FC<RewardsMarketplaceProps> = ({
  studentId,
  schoolId,
  onRedemptionSuccess
}) => {
  const { studentPoints, products, loading, error, processRedemption } = useRewards({
    studentId,
    schoolId,
    autoLoad: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [redemptionMessage, setRedemptionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    { id: 'ALL', name: 'Todos', icon: '📋' },
    { id: 'TECH', name: 'Tecnología', icon: '💻' },
    { id: 'SCHOOL_SUPPLIES', name: 'Útiles', icon: '📚' },
    { id: 'SPORTS', name: 'Deportes', icon: '⚽' },
    { id: 'ENTERTAINMENT', name: 'Entretenimiento', icon: '🎮' },
    { id: 'GIFT_CARDS', name: 'Gift Cards', icon: '🎁' },
    { id: 'EXPERIENCES', name: 'Experiencias', icon: '🎫' }
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && p.available;
    }).sort((a, b) => b.popularityScore - a.popularityScore);
  }, [products, selectedCategory, searchTerm]);

  // Calculate cart totals
  const cartItems = cart
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as any[];

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.pointsCost * item.quantity), 0);
  const canAfford = !studentPoints || cartTotal <= studentPoints.totalPoints;

  // Cart management
  const addToCart = (productId: string) => {
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  // Process redemption
  const handleRedemption = async (productId: string) => {
    if (!studentPoints) return;

    setProcessingId(productId);
    try {
      const result = await processRedemption(productId);
      if (result) {
        setRedemptionMessage({
          type: 'success',
          text: '¡Canje exitoso! Tu orden está siendo procesada.'
        });
        removeFromCart(productId);
        onRedemptionSuccess?.();
        setTimeout(() => setRedemptionMessage(null), 4000);
      }
    } catch (err) {
      setRedemptionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al procesar el canje'
      });
      setTimeout(() => setRedemptionMessage(null), 4000);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Cargando marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Notification */}
      {redemptionMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          redemptionMessage.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {redemptionMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-semibold">{redemptionMessage.text}</p>
        </div>
      )}

      {/* Points Display */}
      {studentPoints && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-semibold">Puntos Disponibles</p>
            <p className="text-3xl font-black">{rewardsService.formatPoints(studentPoints.totalPoints)}</p>
          </div>
          <Zap className="text-yellow-300 opacity-50" size={48} />
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-bold mb-2">No hay productos disponibles</p>
          <p className="text-slate-400 text-sm">Intenta cambiar los filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const validation = studentPoints ? rewardsService.validateRedemption(studentPoints, product) : null;
            const canRedeem = validation?.valid;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group"
              >
                {/* Product Image */}
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 p-6 text-6xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {product.imageUrl}
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-black text-slate-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${product.currentStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.currentStock > 0 ? `${product.currentStock} disponibles` : 'Agotado'}
                    </span>
                    <span className="text-slate-500">Popularidad: {product.popularityScore}%</span>
                  </div>

                  {/* Price */}
                  <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-slate-600 font-bold text-sm">Costo:</span>
                    <div className="flex items-center gap-1 text-indigo-600 font-black">
                      <Zap size={16} />
                      {rewardsService.formatPoints(product.pointsCost)}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!canRedeem && (
                    <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                      <p className="font-bold">{validation?.reason}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRedemption(product.id)}
                    disabled={!canRedeem || processingId === product.id}
                    className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      canRedeem
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {processingId === product.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Gift size={16} />
                        Canjear
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
