import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';

interface StudentTransactionHistoryViewProps {
  studentId: string;
  studentName: string;
  onBack?: () => void;
}

const StudentTransactionHistoryView: React.FC<StudentTransactionHistoryViewProps> = ({
  studentId,
  studentName,
  onBack,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'deposit'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  useEffect(() => {
    loadTransactions();
  }, [studentId]);

  const loadTransactions = () => {
    setLoading(true);
    // Mock data - in production, fetch from supabasePos or transaction service
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        date: new Date(Date.now() - 86400000).toISOString(),
        item: 'Lunch Combo',
        location: 'Cafeteria',
        amount: 125.50,
        type: 'purchase',
        category: 'Hot Meals',
        studentId,
      },
      {
        id: '2',
        date: new Date(Date.now() - 172800000).toISOString(),
        item: 'Deposit from Parent',
        location: 'Online',
        amount: 500.00,
        type: 'deposit',
        studentId,
      },
      {
        id: '3',
        date: new Date(Date.now() - 259200000).toISOString(),
        item: 'Pencil Set',
        location: 'Stationery',
        amount: 75.00,
        type: 'purchase',
        category: 'School Supplies',
        studentId,
      },
      {
        id: '4',
        date: new Date(Date.now() - 345600000).toISOString(),
        item: 'Breakfast',
        location: 'Cafeteria',
        amount: 45.50,
        type: 'purchase',
        category: 'Snacks',
        studentId,
      },
      {
        id: '5',
        date: new Date(Date.now() - 432000000).toISOString(),
        item: 'Deposit from Parent',
        location: 'Online',
        amount: 1000.00,
        type: 'deposit',
        studentId,
      },
    ];

    let filtered = mockTransactions;

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    // Apply sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    }

    setTransactions(filtered);
    setLoading(false);
  };

  const handleFilterChange = (newFilter: 'all' | 'purchase' | 'deposit') => {
    setFilter(newFilter);
    // Re-filter with current data
    let filtered = transactions;
    if (newFilter !== 'all') {
      // Need to access original data - for now reload
      loadTransactions();
    } else {
      loadTransactions();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const totalSpent = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDeposited = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Historial de Transacciones
          </h1>
          <p className="text-gray-600">
            Estudiante: <span className="font-semibold">{studentName}</span>
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Transacciones Totales</p>
            <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Gastado</p>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalSpent)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Depositado</p>
            <p className="text-2xl font-bold text-green-600">{formatAmount(totalDeposited)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por tipo:
              </label>
              <div className="flex gap-2">
                {(['all', 'purchase', 'deposit'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : f === 'purchase' ? 'Compras' : 'Depósitos'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="newest">Más reciente</option>
                <option value="oldest">Más antiguo</option>
                <option value="amount">Mayor cantidad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando transacciones...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No hay transacciones {filter === 'all' ? '' : `de ${filter}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{transaction.item}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{transaction.location}</span>
                    <span>{transaction.category && `${transaction.category}`}</span>
                    <span className="text-gray-500">{formatDate(transaction.date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'purchase'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {transaction.type === 'purchase' ? '-' : '+'}
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.type === 'purchase' ? 'Compra' : 'Depósito'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTransactionHistoryView;
