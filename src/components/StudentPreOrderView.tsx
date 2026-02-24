/**
 * STUDENT PRE-ORDER VIEW
 * Browse menu → add to cart → select pickup slot → confirm order
 * Shows active + past pre-orders
 * Premium/Bento design language
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ShoppingBag, Clock, Plus, Minus, Trash2, ChevronRight,
  UtensilsCrossed, CheckCircle2, XCircle, Package, ArrowLeft,
  Filter, Search, AlertCircle, Timer, Loader2
} from 'lucide-react';
import { PRODUCTS, MOCK_STUDENT } from '../constants';
import { Product, Category, PreOrderItem, PreOrderStatus } from '../types';
import { useToast } from './ui/Toast';
import {
  createPreOrder,
  getPreOrdersByStudent,
  cancelPreOrder,
  PICKUP_SLOTS,
} from '../services/PreOrderService';

type ViewMode = 'menu' | 'cart' | 'orders';

const STATUS_CONFIG: Record<PreOrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [PreOrderStatus.PENDING]: { label: 'Pendiente', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: <Clock size={12} /> },
  [PreOrderStatus.CONFIRMED]: { label: 'Confirmado', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <CheckCircle2 size={12} /> },
  [PreOrderStatus.PREPARING]: { label: 'Preparando', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Timer size={12} /> },
  [PreOrderStatus.READY]: { label: '¡Listo!', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={12} /> },
  [PreOrderStatus.PICKED_UP]: { label: 'Entregado', color: 'bg-slate-50 text-slate-400 border-slate-100', icon: <Package size={12} /> },
  [PreOrderStatus.CANCELLED]: { label: 'Cancelado', color: 'bg-rose-50 text-rose-500 border-rose-100', icon: <XCircle size={12} /> },
};

const FOOD_CATEGORIES = [Category.COMBO_MEALS, Category.HOT_MEALS, Category.SNACKS, Category.DRINKS];

export const StudentPreOrderView: React.FC = () => {
  const toast = useToast();
  const student = MOCK_STUDENT;

  const [view, setView] = useState<ViewMode>('menu');
  const [cart, setCart] = useState<Map<string, { product: Product; qty: number }>>(new Map());
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pickupTime, setPickupTime] = useState(PICKUP_SLOTS[3]); // 10:30
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // refresh orders each time we switch to orders tab
  const [ordersVersion, setOrdersVersion] = useState(0);
  const orders = useMemo(() => getPreOrdersByStudent(student.id), [ordersVersion, view]);

  // Filter products — only food, only available
  const menuProducts = useMemo(() => {
    let items = PRODUCTS.filter(p => FOOD_CATEGORIES.includes(p.category) && p.isAvailable);
    if (activeCategory !== 'all') items = items.filter(p => p.category === activeCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchTerm]);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
  const cartTotal = useMemo(() => cartItems.reduce((s, i) => s + i.product.price * i.qty, 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(product.id);
      next.set(product.id, { product, qty: (existing?.qty || 0) + 1 });
      return next;
    });
    toast.success('Agregado', `${product.name} añadido`);
  }, [toast]);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart(prev => {
      const next = new Map(prev);
      const item = next.get(productId);
      if (!item) return next;
      const newQty = item.qty + delta;
      if (newQty <= 0) next.delete(productId);
      else next.set(productId, { ...item, qty: newQty });
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (cartItems.length === 0) return;
    if (cartTotal > student.balance) {
      toast.error('Saldo insuficiente', `Necesitas $${(cartTotal - student.balance).toFixed(2)} más`);
      return;
    }

    setSubmitting(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    const items: PreOrderItem[] = cartItems.map(ci => ({
      productId: ci.product.id,
      productName: ci.product.name,
      productImage: ci.product.image || '',
      category: ci.product.category,
      quantity: ci.qty,
      unitPrice: ci.product.price,
      subtotal: ci.product.price * ci.qty,
    }));

    createPreOrder({
      studentId: student.id,
      studentName: student.name,
      schoolId: student.schoolId,
      unitId: 'unit_01',
      items,
      pickupTime,
      pickupDate: new Date().toISOString().slice(0, 10),
      notes: notes || undefined,
    });

    setCart(new Map());
    setNotes('');
    setSubmitting(false);
    setOrdersVersion(v => v + 1);
    setView('orders');
    toast.success('¡Pedido enviado!', `Recoge a las ${pickupTime} en la cafetería`);
  };

  const handleCancel = (orderId: string) => {
    cancelPreOrder(orderId);
    setOrdersVersion(v => v + 1);
    toast.info('Cancelado', 'Tu pedido fue cancelado');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Pre-Orden</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Ordena desde tu asiento</p>
          </div>
          <div className="flex gap-2">
            {/* Cart FAB */}
            <button
              onClick={() => setView(view === 'cart' ? 'menu' : 'cart')}
              className={`relative px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                view === 'cart'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag size={16} />
              Carrito
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setView('orders'); setOrdersVersion(v => v + 1); }}
              className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                view === 'orders'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Package size={16} />
              Mis Pedidos
            </button>
          </div>
        </div>

        {/* Category tabs — only in menu view */}
        {view === 'menu' && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}
            >
              Todo
            </button>
            {[
              { cat: Category.COMBO_MEALS, label: 'Combos' },
              { cat: Category.HOT_MEALS, label: 'Calientes' },
              { cat: Category.SNACKS, label: 'Snacks' },
              { cat: Category.DRINKS, label: 'Bebidas' },
            ].map(c => (
              <button
                key={c.cat}
                onClick={() => setActiveCategory(c.cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === c.cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        {/* ── MENU VIEW ── */}
        {view === 'menu' && (
          <div className="max-w-6xl mx-auto">
            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-100 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {menuProducts.map(product => {
                const inCart = cart.get(product.id);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="font-black text-slate-800 text-lg leading-tight truncate mb-1">{product.name}</h3>
                      {product.calories && (
                        <p className="text-[10px] text-slate-400 font-medium mb-3">{product.calories} kcal</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-700 tracking-tighter">${product.price.toFixed(2)}</span>
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all">
                              <Minus size={14} />
                            </button>
                            <span className="font-black text-slate-700 w-6 text-center">{inCart.qty}</span>
                            <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all">
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                          >
                            <Plus size={14} />
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {menuProducts.length === 0 && (
              <div className="py-32 text-center opacity-30">
                <UtensilsCrossed size={80} strokeWidth={1} className="mx-auto mb-4" />
                <p className="font-black text-[10px] uppercase tracking-widest">No se encontraron productos</p>
              </div>
            )}
          </div>
        )}

        {/* ── CART VIEW ── */}
        {view === 'cart' && (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6 hover:text-slate-600 transition-all">
              <ArrowLeft size={16} /> Volver al menú
            </button>

            {cartItems.length === 0 ? (
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-16 text-center">
                <ShoppingBag size={64} className="mx-auto mb-4 text-slate-200" />
                <p className="font-black text-slate-500 text-lg">Tu carrito está vacío</p>
                <p className="text-slate-400 text-xs mt-2 font-medium">Agrega productos del menú para hacer tu pre-orden</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart items */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-8 space-y-4">
                  <h2 className="text-xl font-black text-slate-800 tracking-tighter mb-4">Tu Pedido</h2>
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all">
                      <img src={product.image} alt={product.name} className="w-16 h-16 rounded-2xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 truncate">{product.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">${product.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><Minus size={14} /></button>
                        <span className="font-black w-6 text-center">{qty}</span>
                        <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Plus size={14} /></button>
                      </div>
                      <span className="font-black text-slate-700 w-20 text-right">${(product.price * qty).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pickup time */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-lg font-black text-slate-800 tracking-tighter mb-2">Hora de Recogida</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Selecciona cuándo pasas a recoger</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {PICKUP_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setPickupTime(slot)}
                        className={`py-3 rounded-xl font-black text-sm transition-all ${
                          pickupTime === slot
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Notas (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ej: Sin cebolla, extra salsa..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 resize-none h-24 transition-all"
                  />
                </div>

                {/* Balance check */}
                {cartTotal > student.balance && (
                  <div className="rounded-3xl p-5 bg-rose-50 border border-rose-100 flex items-center gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={20} />
                    <p className="text-sm font-bold text-rose-700">
                      Saldo insuficiente. Tienes ${student.balance.toFixed(2)} y el pedido cuesta ${cartTotal.toFixed(2)}.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || cartTotal > student.balance}
                  className="w-full py-6 rounded-3xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Enviando pedido…</>
                  ) : (
                    <>Confirmar Pre-Orden · ${cartTotal.toFixed(2)}</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MY ORDERS VIEW ── */}
        {view === 'orders' && (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-6 hover:text-slate-600 transition-all">
              <ArrowLeft size={16} /> Nuevo pedido
            </button>

            {orders.length === 0 ? (
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm p-16 text-center">
                <Package size={64} className="mx-auto mb-4 text-slate-200" />
                <p className="font-black text-slate-500 text-lg">Sin pedidos</p>
                <p className="text-slate-400 text-xs mt-2 font-medium">Haz tu primera pre-orden desde el menú</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const statusCfg = STATUS_CONFIG[order.status];
                  const canCancel = [PreOrderStatus.PENDING, PreOrderStatus.CONFIRMED].includes(order.status);
                  return (
                    <div key={order.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusCfg.color}`}>
                              {statusCfg.icon} {statusCfg.label}
                            </span>
                            {order.status === PreOrderStatus.READY && (
                              <span className="text-[10px] font-black text-emerald-600 animate-pulse">🔔 Pasa a recoger</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            Recogida: {order.pickupTime} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tighter">${order.total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-xl object-cover" />
                            <span className="text-sm font-bold text-slate-700 flex-1 truncate">{item.productName}</span>
                            <span className="text-xs text-slate-400 font-medium">x{item.quantity}</span>
                            <span className="text-sm font-black text-slate-600">${item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-xs text-slate-400 font-medium italic mb-3">"{order.notes}"</p>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          Cancelar pedido
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPreOrderView;
