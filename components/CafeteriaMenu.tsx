// components/CafeteriaMenu.tsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChefHat,
  Search,
  Filter,
  X,
  RefreshCw,
  Heart,
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ============================================
// TIPOS
// ============================================

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  stock: number;
  allergens?: string[];
  nutritional_blocked_for?: string[];
  status: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface OnlineOrder {
  id: string;
  student_id: string;
  unit_id: string;
  school_id: string;
  items: any[];
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  created_at: string;
  ready_at?: string;
}

interface CafeteriaMenuProps {
  studentId: string;
  studentName: string;
  schoolId: string;
  unitId: string;
  balance: number;
  allergies?: string[];
  onClose?: () => void;
  onOrderPlaced?: () => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const CafeteriaMenu: React.FC<CafeteriaMenuProps> = ({
  studentId,
  studentName,
  schoolId,
  unitId,
  balance,
  allergies = [],
  onClose,
  onOrderPlaced
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderStatus, setOrderStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    orderId?: string;
  }>({ type: null, message: '' });
  const [myOrders, setMyOrders] = useState<OnlineOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadMenu();
    loadMyOrders();
    
    // Suscribirse a cambios en pedidos
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'online_orders',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          console.log('Order updated:', payload);
          loadMyOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [studentId, unitId]);

  // ============================================
  // CARGAR DATOS
  // ============================================

  const loadMenu = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('unit_id', unitId)
        .eq('status', 'active')
        .gt('stock', 0)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('online_orders')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // ============================================
  // CARRITO
  // ============================================

  const addToCart = (item: MenuItem) => {
    // Validar alergias
    if (item.allergens && allergies.length > 0) {
      const hasAllergy = item.allergens.some(allergen => allergies.includes(allergen));
      if (hasAllergy) {
        setOrderStatus({
          type: 'error',
          message: `⚠️ ${item.name} contiene alérgenos peligrosos para ti`
        });
        setTimeout(() => setOrderStatus({ type: null, message: '' }), 5000);
        return;
      }
    }

    // Validar stock
    const existingItem = cart.find(ci => ci.item.id === item.id);
    const currentQuantity = existingItem?.quantity || 0;
    
    if (currentQuantity >= item.stock) {
      setOrderStatus({
        type: 'error',
        message: 'Cantidad máxima en stock alcanzada'
      });
      setTimeout(() => setOrderStatus({ type: null, message: '' }), 3000);
      return;
    }

    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev.map(ci => {
        if (ci.item.id === itemId) {
          const newQuantity = ci.quantity + delta;
          if (newQuantity <= 0) return ci;
          if (newQuantity > ci.item.stock) {
            setOrderStatus({
              type: 'error',
              message: 'Stock insuficiente'
            });
            setTimeout(() => setOrderStatus({ type: null, message: '' }), 3000);
            return ci;
          }
          return { ...ci, quantity: newQuantity };
        }
        return ci;
      }).filter(ci => ci.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // ============================================
  // PROCESAR PEDIDO
  // ============================================

  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderStatus({
        type: 'error',
        message: 'Tu carrito está vacío'
      });
      setTimeout(() => setOrderStatus({ type: null, message: '' }), 3000);
      return;
    }

    const total = calculateTotal();

    if (balance < total) {
      setOrderStatus({
        type: 'error',
        message: `Saldo insuficiente. Balance: $${balance.toFixed(2)}, Total: $${total.toFixed(2)}`
      });
      setTimeout(() => setOrderStatus({ type: null, message: '' }), 5000);
      return;
    }

    try {
      setProcessing(true);

      // Crear pedido online
      const { data: order, error: orderError } = await supabase
        .from('online_orders')
        .insert({
          student_id: studentId,
          school_id: schoolId,
          unit_id: unitId,
          items: cart.map(ci => ({
            inventory_item_id: ci.item.id,
            name: ci.item.name,
            price: ci.item.price,
            quantity: ci.quantity
          })),
          total_amount: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Descontar balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - total })
        .eq('id', studentId);

      if (balanceError) throw balanceError;

      // Registrar transacción
      await supabase.from('transactions').insert({
        school_id: schoolId,
        unit_id: unitId,
        student_id: studentId,
        type: 'online_order',
        amount: total,
        mecard_fee: 0,
        card_fee: 0,
        net_amount: total,
        items: cart.map(ci => ({
          inventory_item_id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity
        })),
        payment_method: 'balance',
        status: 'completed',
        metadata: {
          order_id: order.id,
          order_type: 'online'
        }
      });

      // Limpiar carrito
      clearCart();

      // Mostrar éxito
      setOrderStatus({
        type: 'success',
        message: `✅ Pedido #${order.id.slice(0, 8)} enviado a cocina`,
        orderId: order.id
      });

      // Recargar pedidos
      loadMyOrders();

      // Notificar al padre
      if (onOrderPlaced) {
        onOrderPlaced();
      }

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setOrderStatus({ type: null, message: '' });
      }, 5000);

    } catch (error: any) {
      console.error('Error placing order:', error);
      setOrderStatus({
        type: 'error',
        message: error.message || 'Error al procesar el pedido'
      });
      setTimeout(() => setOrderStatus({ type: null, message: '' }), 5000);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // CÁLCULOS
  // ============================================

  const calculateTotal = (): number => {
    return cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  };

  const calculateItemCount = (): number => {
    return cart.reduce((sum, ci) => sum + ci.quantity, 0);
  };

  // ============================================
  // FILTROS
  // ============================================

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight italic">
                Menú de Cafetería
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Hola, {studentName} • Balance: ${balance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="relative p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
            >
              <Clock size={20} className="text-slate-600" />
              {myOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {myOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={loadMenu}
              className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
            >
              <RefreshCw size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Notificaciones */}
      {orderStatus.type && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 ${
              orderStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border-2 border-green-200'
                : 'bg-red-50 text-red-800 border-2 border-red-200'
            }`}
          >
            {orderStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-bold flex-1">{orderStatus.message}</p>
            <button onClick={() => setOrderStatus({ type: null, message: '' })}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mis Pedidos (Modal) */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">Mis Pedidos</h2>
              <button
                onClick={() => setShowOrders(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {myOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'preparing' ? 'bg-blue-500' :
                        order.status === 'ready' ? 'bg-green-500 animate-pulse' :
                        'bg-gray-500'
                      }`}></div>
                      <p className="font-black text-slate-800">
                        Pedido #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' && 'En espera'}
                      {order.status === 'preparing' && 'Preparando'}
                      {order.status === 'ready' && '¡Listo!'}
                      {order.status === 'completed' && 'Completado'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-bold text-slate-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-300">
                    <span className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString('es-MX')}
                    </span>
                    <span className="text-lg font-black text-indigo-600">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {myOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No tienes pedidos activos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden flex">
        {/* Menú de Productos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Búsqueda y Filtros */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMenu.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <ChefHat size={48} className="text-slate-300" />
                    )}
                  </div>

                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm mb-2 truncate">
                    {item.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-black text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500">
                      Stock: {item.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Agregar
                  </button>
                </div>
              ))}
            </div>

            {filteredMenu.length === 0 && (
              <div className="text-center py-20">
                <ShoppingBag size={64} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Carrito (Sidebar) */}
        <div className="w-96 bg-white border-l border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Mi Pedido</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 font-bold hover:text-red-700"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Items del Carrito */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              cart.map(ci => (
                <div
                  key={ci.item.id}
                  className="bg-slate-50 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">
                      {ci.item.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      ${ci.item.price.toFixed(2)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(ci.item.id, -1)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold">{ci.quantity}</span>
                    <button
                      onClick={() => updateQuantity(ci.item.id, 1)}
                      className="p-1 hover:bg-slate-200 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <p className="font-black text-slate-800">
                      ${(ci.item.price * ci.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(ci.item.id)}
                    className="p-1 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total y Botón */}
          {cart.length > 0 && (
            <>
              <div className="border-t border-slate-200 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Balance disponible</span>
                  <span className="font-bold">${balance.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={processing || balance < calculateTotal()}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Hacer Pedido ({calculateItemCount()} items)
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
