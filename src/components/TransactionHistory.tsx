// ============================================
// ARCHIVO 3: components/TransactionHistory.tsx
// ============================================

import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { TransactionType } from '../types';

interface TransactionHistoryProps {
  studentId: string;
  studentName: string;
}

// TIPOS DE TRANSACCIÓN SEGÚN TU SISTEMA
const TRANSACTION_CONFIG = {
  DEPOSIT: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Depósito'
  },
  SALE: {
    icon: ArrowUpRight,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    label: 'Compra'
  },
  PURCHASE: {
    icon: ArrowUpRight,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    label: 'Compra'
  },
  GIFT_RECEIVED: {
    icon: Gift,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    label: 'Regalo Recibido'
  },
  GIFT_SENT: {
    icon: Gift,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    label: 'Regalo Enviado'
  },
  REFUND: {
    icon: ArrowDownLeft,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Devolución'
  },
  WITHDRAWAL: {
    icon: ArrowUpRight,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Retiro'
  }
} as const;

export function TransactionHistory({ studentId, studentName }: TransactionHistoryProps) {
  const {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    stats,
    refresh
  } = useTransactions({ studentId });

  const [showFilters, setShowFilters] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 rounded-3xl border border-rose-200 text-center">
        <p className="text-rose-600 font-bold">Error cargando transacciones</p>
        <p className="text-sm text-rose-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-800 italic tracking-tighter">
            Historial
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {transactions.length} transacciones encontradas
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              showFilters
                ? 'bg-indigo-600 text-white'
                : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-indigo-200'
            }`}
          >
            <Filter size={16} />
            Filtros
          </button>

          <button
            onClick={() => {/* TODO: Exportar CSV */}}
            className="px-4 py-2 bg-white border-2 border-slate-100 rounded-xl font-bold text-sm text-slate-600 hover:border-emerald-200 transition-all flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <TrendingUp size={20} className="text-indigo-600" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Total
            </p>
          </div>
          <p className="text-3xl font-black text-slate-800">
            {stats.totalTransactions}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <ArrowUpRight size={20} className="text-rose-600" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Gastado
            </p>
          </div>
          <p className="text-3xl font-black text-rose-600">
            ${stats.totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <ArrowDownLeft size={20} className="text-emerald-600" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Recibido
            </p>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            ${stats.totalDeposited.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <DollarSign size={20} className="text-slate-600" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Promedio
            </p>
          </div>
          <p className="text-3xl font-black text-slate-800">
            ${stats.avgTransaction.toFixed(2)}
          </p>
        </div>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <p className="font-black text-sm text-slate-800 uppercase tracking-widest">
            Filtrar Transacciones
          </p>

          <div className="flex gap-3">
            {(['today', 'week', 'month', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setFilters({ ...filters, dateRange: range })}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  filters.dateRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range === 'today' && 'Hoy'}
                {range === 'week' && 'Esta Semana'}
                {range === 'month' && 'Este Mes'}
                {range === 'all' && 'Todo'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LISTA DE TRANSACCIONES */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Calendar size={64} className="mx-auto mb-4 text-slate-300" />
            <p className="font-bold text-slate-800">Sin transacciones</p>
            <p className="text-sm text-slate-500 mt-2">
              No hay transacciones en este periodo
            </p>
          </div>
        ) : (
          transactions.map(tx => {
            const config = TRANSACTION_CONFIG[tx.type as keyof typeof TRANSACTION_CONFIG] || TRANSACTION_CONFIG.PURCHASE;
            const Icon = config.icon;
            const isNegative = tx.type === 'PURCHASE' || tx.type === 'SALE' || tx.type === 'GIFT_SENT';

            // Parsear items si existen
            let itemsText = '';
            if (tx.metadata?.items && Array.isArray(tx.metadata.items)) {
              itemsText = tx.metadata.items
                .map((item: any) => `${item.quantity}x ${item.name}`)
                .join(', ');
            }

            return (
              <div
                key={tx.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-4 rounded-2xl ${config.bg} shrink-0`}>
                    <Icon size={24} className={config.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-lg truncate">
                      {tx.description || config.label}
                    </p>
                    
                    {/* Mostrar items comprados */}
                    {itemsText && (
                      <p className="text-sm text-slate-600 mt-1 truncate">
                        {itemsText}
                      </p>
                    )}
                    
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {tx.metadata?.payment_method && (
                        <span className="text-xs text-slate-400">
                          • {tx.metadata.payment_method}
                        </span>
                      )}
                      {tx.metadata?.mecard_fee && (
                        <span className="text-xs text-amber-600 font-bold">
                          • Fee: ${Number(tx.metadata.mecard_fee).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <p className={`text-2xl font-black ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isNegative ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    Saldo: ${tx.balanceAfter.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
