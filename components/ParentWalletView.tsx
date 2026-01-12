import React, { useState, useEffect } from 'react';
import { Deposit, PaymentMethod, ParentProfile } from '../types';

interface ParentWalletViewProps {
  parentId: string;
  schoolId: string;
  onBack?: () => void;
}

const ParentWalletView: React.FC<ParentWalletViewProps> = ({
  parentId,
  schoolId,
  onBack,
}) => {
  const [parentData, setParentData] = useState<ParentProfile | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  useEffect(() => {
    loadWalletData();
  }, [parentId]);

  const loadWalletData = () => {
    setLoading(true);

    // Mock parent data
    const mockParent: ParentProfile = {
      id: parentId,
      email: 'maria.gonzalez@email.com',
      phoneNumber: '+52 55 1234 5678',
      fullName: 'María González López',
      schoolId,
      children: ['student_1', 'student_2'],
      totalWalletBalance: 4301.0,
      paymentMethods: [
        {
          id: 'pm_1',
          parentId,
          type: 'DEBIT_CARD',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pm_2',
          parentId,
          type: 'CREDIT_CARD',
          last4: '5555',
          expiryMonth: 6,
          expiryYear: 2026,
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
      ],
      spendingLimits: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockDeposits: Deposit[] = [
      {
        id: 'dep_1',
        parentId,
        amount: 1000,
        paymentMethodId: 'pm_1',
        status: 'COMPLETED',
        depositDate: new Date(Date.now() - 86400000).toISOString(),
        completedDate: new Date(Date.now() - 86400000).toISOString(),
        speiReference: 'SPEI001234',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'dep_2',
        parentId,
        amount: 500,
        paymentMethodId: 'pm_2',
        status: 'COMPLETED',
        depositDate: new Date(Date.now() - 172800000).toISOString(),
        completedDate: new Date(Date.now() - 172800000).toISOString(),
        speiReference: 'SPEI001235',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'dep_3',
        parentId,
        amount: 2000,
        paymentMethodId: 'pm_1',
        status: 'PENDING',
        depositDate: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    setParentData(mockParent);
    setPaymentMethods(mockParent.paymentMethods);
    setDeposits(mockDeposits);
    setSelectedPaymentMethod(mockParent.paymentMethods[0]?.id || '');
    setLoading(false);
  };

  const handleCreateDeposit = async () => {
    // TODO: Call parentDepositService.createDeposit
    const newDeposit: Deposit = {
      id: `dep_${Date.now()}`,
      parentId,
      amount: depositAmount,
      paymentMethodId: selectedPaymentMethod,
      status: 'PENDING',
      depositDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeposits([newDeposit, ...deposits]);
    if (parentData) {
      setParentData({
        ...parentData,
        totalWalletBalance: parentData.totalWalletBalance + depositAmount,
      });
    }
    setShowDepositModal(false);
    setDepositAmount(500);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      case 'FAILED':
        return 'Fallido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading || !parentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando información de billetera...</p>
      </div>
    );
  }

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
            Mi Billetera
          </h1>
          <p className="text-gray-600">Gestiona depósitos y saldo para tus hijos</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <p className="text-indigo-100 mb-2">Saldo Total de Billetera</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {formatAmount(parentData.totalWalletBalance)}
          </h2>
          <p className="text-indigo-100 mb-4">
            Distribuido entre {parentData.children.length} estudiante(s)
          </p>
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            + Hacer Depósito
          </button>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <DepositModal
            amount={depositAmount}
            onAmountChange={setDepositAmount}
            paymentMethods={paymentMethods}
            selectedMethodId={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
            onDeposit={handleCreateDeposit}
            onClose={() => setShowDepositModal(false)}
          />
        )}

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Métodos de Pago</h3>
          <div className="space-y-3">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">
                      {method.type === 'DEBIT_CARD' ? '💳' : '💰'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {method.type === 'DEBIT_CARD'
                        ? 'Tarjeta de Débito'
                        : method.type === 'CREDIT_CARD'
                          ? 'Tarjeta de Crédito'
                          : 'Cuenta Bancaria'}
                    </p>
                    <p className="text-sm text-gray-600">••••{method.last4}</p>
                  </div>
                </div>
                <div className="text-right">
                  {method.isDefault && (
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Predeterminado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deposits History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Depósitos</h3>

          {deposits.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay depósitos registrados
            </p>
          ) : (
            <div className="space-y-4">
              {deposits.map(deposit => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-800">
                        {formatAmount(deposit.amount)}
                      </p>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                          deposit.status
                        )}`}
                      >
                        {getStatusText(deposit.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(deposit.depositDate)}
                    </p>
                    {deposit.speiReference && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {deposit.speiReference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {deposit.status === 'COMPLETED' && (
                      <span className="text-green-600">✓</span>
                    )}
                    {deposit.status === 'PENDING' && (
                      <span className="text-yellow-600">⏳</span>
                    )}
                    {deposit.status === 'FAILED' && (
                      <span className="text-red-600">✕</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DepositModalProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  paymentMethods: PaymentMethod[];
  selectedMethodId: string;
  onMethodChange: (methodId: string) => void;
  onDeposit: () => void;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  amount,
  onAmountChange,
  paymentMethods,
  selectedMethodId,
  onMethodChange,
  onDeposit,
  onClose,
}) => {
  const quickAmounts = [250, 500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hacer un Depósito</h2>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cantidad ($MXN)
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => onAmountChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-lg"
            min="10"
            max="50000"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Montos Rápidos</p>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map(quickAmount => (
              <button
                key={quickAmount}
                onClick={() => onAmountChange(quickAmount)}
                className={`py-2 rounded-lg font-semibold transition-colors ${
                  amount === quickAmount
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Método de Pago
          </label>
          <select
            value={selectedMethodId}
            onChange={e => onMethodChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {paymentMethods.map(method => (
              <option key={method.id} value={method.id}>
                {method.type === 'DEBIT_CARD'
                  ? 'Débito'
                  : method.type === 'CREDIT_CARD'
                    ? 'Crédito'
                    : 'Bancario'}{' '}
                •••• {method.last4}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Cantidad</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-gray-600">Comisión (2%)</span>
            <span className="font-semibold">${(amount * 0.02).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="font-bold text-gray-800">Total a Pagar</span>
            <span className="font-bold text-indigo-600">
              ${(amount + amount * 0.02).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onDeposit}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Confirmar Depósito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentWalletView;
