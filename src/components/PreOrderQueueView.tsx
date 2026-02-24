/**
 * POS PRE-ORDER QUEUE VIEW
 * Kitchen/POS-side view to manage incoming pre-orders
 * Status transitions: Confirmed → Preparing → Ready → Picked Up
 * Premium/Bento design language
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, ChefHat, CheckCircle2, Package, XCircle,
  RefreshCw, Loader2, Timer, User, AlertCircle, Flame
} from 'lucide-react';
import { PreOrder, PreOrderStatus } from '../types';
import { getPendingOrders, updatePreOrderStatus, cancelPreOrder, getTodayStats } from '../services/PreOrderService';

const STATUS_FLOW: { from: PreOrderStatus; to: PreOrderStatus; label: string; color: string }[] = [
  { from: PreOrderStatus.CONFIRMED, to: PreOrderStatus.PREPARING, label: 'Iniciar Preparación', color: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' },
  { from: PreOrderStatus.PREPARING, to: PreOrderStatus.READY, label: 'Marcar Listo', color: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' },
  { from: PreOrderStatus.READY, to: PreOrderStatus.PICKED_UP, label: 'Entregado', color: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' },
];

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; bg: string }> = {
  [PreOrderStatus.PENDING]: { label: 'Pendiente', dotColor: 'bg-amber-500', bg: 'bg-amber-50' },
  [PreOrderStatus.CONFIRMED]: { label: 'Confirmado', dotColor: 'bg-indigo-500', bg: 'bg-indigo-50' },
  [PreOrderStatus.PREPARING]: { label: 'Preparando', dotColor: 'bg-orange-500 animate-pulse', bg: 'bg-orange-50' },
  [PreOrderStatus.READY]: { label: '¡Listo!', dotColor: 'bg-emerald-500 animate-pulse', bg: 'bg-emerald-50' },
  [PreOrderStatus.PICKED_UP]: { label: 'Entregado', dotColor: 'bg-slate-400', bg: 'bg-slate-50' },
  [PreOrderStatus.CANCELLED]: { label: 'Cancelado', dotColor: 'bg-rose-500', bg: 'bg-rose-50' },
};

export const PreOrderQueueView: React.FC = () => {
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const refresh = () => {
    setLoading(true);
    // Simulate small delay
    setTimeout(() => {
      setOrders(getPendingOrders());
      setLoading(false);
    }, 300);
  };

  useEffect(() => { refresh(); }, []);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => getTodayStats(), [orders]);

  const displayed = useMemo(() => {
    if (filter === 'active') {
      return orders.filter(o => [PreOrderStatus.CONFIRMED, PreOrderStatus.PREPARING, PreOrderStatus.READY].includes(o.status));
    }
    return orders;
  }, [orders, filter]);

  const handleStatusChange = (orderId: string, newStatus: PreOrderStatus) => {
    updatePreOrderStatus(orderId, newStatus, { preparedBy: 'Operador POS' });
    refresh();
  };

  const handleCancel = (orderId: string) => {
    cancelPreOrder(orderId, 'Cancelado por POS');
    refresh();
  };

  const getNextAction = (order: PreOrder) => {
    return STATUS_FLOW.find(f => f.from === order.status);
  };

  const getTimeSince = (isoDate: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
              <ChefHat className="text-indigo-600" size={28} />
              Cola de Pre-Órdenes
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              Gestión de pedidos anticipados
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Actualizar
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiPill label="Total hoy" value={stats.total} color="text-slate-800" />
          <KpiPill label="Por preparar" value={stats.pending} color="text-indigo-600" highlight />
          <KpiPill label="Preparando" value={stats.preparing} color="text-orange-600" />
          <KpiPill label="Listos" value={stats.ready} color="text-emerald-600" />
          <KpiPill label="Entregados" value={stats.pickedUp} color="text-slate-400" />
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-8 py-3 bg-white border-b border-slate-50 flex gap-2 shrink-0">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            filter === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          Activos ({stats.pending + stats.preparing + stats.ready})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          Todos ({stats.total})
        </button>
      </div>

      {/* Orders grid */}
      <main className="flex-1 overflow-y-auto p-8">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <Package size={80} strokeWidth={1} className="mb-4" />
            <p className="font-black text-[10px] uppercase tracking-widest">Sin pedidos pendientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
            {displayed.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG[PreOrderStatus.PENDING];
              const nextAction = getNextAction(order);
              const isUrgent = order.status === PreOrderStatus.CONFIRMED &&
                getTimeSince(order.createdAt).includes('m') &&
                parseInt(getTimeSince(order.createdAt)) > 10;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-[40px] border shadow-sm p-6 transition-all hover:shadow-md ${
                    isUrgent ? 'border-orange-200 ring-2 ring-orange-100' : 'border-slate-100'
                  }`}
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${statusCfg.dotColor}`} />
                      <span className="font-black text-slate-800">{statusCfg.label}</span>
                      {isUrgent && <Flame size={14} className="text-orange-500" />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      <Clock size={10} className="inline mr-1" />
                      {getTimeSince(order.createdAt)}
                    </span>
                  </div>

                  {/* Student info */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{order.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Recoge: {order.pickupTime}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-xl object-cover" />
                        <span className="flex-1 text-sm font-bold text-slate-700 truncate">{item.productName}</span>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-black text-slate-500">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl mb-4">
                      <p className="text-[10px] font-bold text-amber-700">📝 {order.notes}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-slate-800 tracking-tighter">${order.total.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {nextAction && (
                      <button
                        onClick={() => handleStatusChange(order.id, nextAction.to)}
                        className={`flex-1 py-3.5 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${nextAction.color}`}
                      >
                        {nextAction.label}
                      </button>
                    )}
                    {[PreOrderStatus.CONFIRMED, PreOrderStatus.PREPARING].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="px-4 py-3.5 rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        title="Cancelar"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

// ── Sub-component ──
const KpiPill: React.FC<{ label: string; value: number; color: string; highlight?: boolean }> = ({ label, value, color, highlight }) => (
  <div className={`px-4 py-3 rounded-2xl text-center ${highlight ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-50'}`}>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-xl font-black tracking-tighter mt-0.5 ${color}`}>{value}</p>
  </div>
);

export default PreOrderQueueView;
