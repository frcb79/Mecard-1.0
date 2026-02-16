/**
 * ParentWalletView Component (Refactored)
 * Gestión de billetera para padres: depósitos, asignación a hijos
 * Usa MockPaymentService para procesamiento
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Send, CreditCard, Building2, Check, AlertCircle, Loader2, Sparkles, TrendingDown, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePaymentService } from '../contexts/ServiceContext';
import { Button } from './Button';
import { MOCK_STUDENTS_LIST } from '../constants';
import { getSpendingAnalysis, getSmartAlerts } from '../services/geminiService';
import { calculateDepositFee, getBillingConfig, formatCurrency } from '../services/BillingService';
import { DepositMethod, DepositWithFeeCalculation, SchoolBillingConfig } from '../types';

export default function ParentWalletView() {
  const { user } = useAuth();
  const paymentService = usePaymentService();
  
  const [activeTab, setActiveTab] = useState<'deposit' | 'manage' | 'insights'>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'spei' | 'card'>('spei');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [assignAmount, setAssignAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Billing Feature State
  const [billingConfig, setBillingConfig] = useState<SchoolBillingConfig | null>(null);
  const [feeCalculation, setFeeCalculation] = useState<DepositWithFeeCalculation | null>(null);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  // AI Features State
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiAlerts, setAiAlerts] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Mock parent's children (in real scenario: get from API with parent ID)
  const children = MOCK_STUDENTS_LIST.slice(0, 2).map(student => ({
    id: student.id,
    name: student.fullName,
    balance: 0, // Will be fetched dynamically
  }));

  useEffect(() => {
    // Simulate fetching current balances
    children.forEach(async (child) => {
      try {
        const balance = await paymentService.getBalance(child.id);
        // Update child balance (in real app, use setState for each child)
      } catch (error) {
        console.error(`Failed to load balance for ${child.id}:`, error);
      }
    });

    // Load Billing Configuration
    loadBillingConfig();

    // Load AI Insights on mount
    loadAIInsights();
  }, []);

  // ========================================
  // BILLING FEATURES
  // ========================================

  const loadBillingConfig = async () => {
    try {
      // TODO: Pass actual schoolId from context/props
      const config = await getBillingConfig('school-001');
      setBillingConfig(config);
    } catch (error) {
      console.error('Failed to load billing config:', error);
    }
  };

  const handleDepositAmountChange = (value: string) => {
    setDepositAmount(value);

    // Calculate fee in real-time
    if (value && billingConfig) {
      const amount = parseFloat(value);
      if (amount > 0) {
        const method = paymentMethod === 'spei' ? DepositMethod.SPEI : DepositMethod.CARD;
        const calculation = calculateDepositFee(amount, method, billingConfig);
        setFeeCalculation(calculation);
        setShowFeeBreakdown(true);
      } else {
        setFeeCalculation(null);
        setShowFeeBreakdown(false);
      }
    }
  };

  const loadAIInsights = async () => {
    setAiLoading(true);
    try {
      // Get spending analysis
      const insight = await getSpendingAnalysis(
        transactionHistory.slice(0, 10),
        [],
        5000
      );
      setAiInsight(insight);

      // Get smart alerts
      const alerts = await getSmartAlerts(2450.50, 100, 35.50, transactionHistory.slice(0, 5));
      setAiAlerts(alerts);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) {
      setErrorMessage('Ingresa un monto');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      setErrorMessage('El monto debe ser mayor a 0');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Get a random child to deposit to (in real app, let parent choose)
      const targetChild = children[Math.floor(Math.random() * children.length)];
      
      const result = await paymentService.createDeposit({
        parentId: user?.id || 'parent-001',
        studentId: targetChild.id,
        amount,
        paymentMethod: paymentMethod as any,
      });

      if (result.status === 'completed') {
        setSuccessMessage(
          `¡Depósito de $${amount.toFixed(2)} completado! Transferido a ${targetChild.name}`
        );
        setDepositAmount('');
        setTransactionHistory((prev) => [result, ...prev]);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.message || 'Error al procesar depósito');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al procesar depósito'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedChild || !assignAmount) {
      setErrorMessage('Selecciona hijo y monta');
      return;
    }

    const amount = parseFloat(assignAmount);
    if (amount <= 0) {
      setErrorMessage('El monto debe ser mayor a 0');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await paymentService.createDeposit({
        parentId: user?.id || 'parent-001',
        studentId: selectedChild,
        amount,
        paymentMethod: 'wallet',
      });

      if (result.status === 'completed') {
        const childName = children.find((c) => c.id === selectedChild)?.name || selectedChild;
        setSuccessMessage(`¡Dinero asignado exitosamente a ${childName}!`);
        setAssignAmount('');
        setSelectedChild('');
        setTransactionHistory((prev) => [result, ...prev]);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.message || 'Error al asignar dinero');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al asignar dinero'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const currentBalance = 2450.50; // In real app, sum of all children's balances

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-600" />
            Mi Billetera
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona depósitos y asignaciones de dinero para tus hijos
          </p>
        </div>

        {/* SUCCESS/ERROR MESSAGES */}
        {successMessage && (
          <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-[24px] p-4 flex items-center gap-3 animate-in slide-in-from-top">
            <Check className="w-6 h-6 text-emerald-600 shrink-0" />
            <p className="text-emerald-900 font-bold">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 bg-rose-50 border-2 border-rose-200 rounded-[24px] p-4 flex items-center gap-3 animate-in slide-in-from-top">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <p className="text-rose-900 font-bold">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: SALDO TOTAL */}
          <div className="lg:col-span-1">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">
                  Saldo en Billetera
                </p>
                <h2 className="text-5xl font-black text-emerald-600 mb-2">
                  ${currentBalance.toFixed(2).split('.')[0]}<span className="text-2xl">.{currentBalance.toFixed(2).split('.')[1]}</span>
                </h2>
                <p className="text-slate-500 text-sm mb-8">
                  Saldo disponible para asignar
                </p>

                {/* HIJOS */}
                <div className="space-y-3 mt-8 pt-8 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-4">
                    Mis Hijos
                  </p>
                  {children.map(child => (
                    <div key={child.id} className="bg-slate-50 rounded-[16px] p-4 text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                        {child.name}
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        ${(child.balance || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          {/* COLUMNA DERECHA: TABS */}
          <div className="lg:col-span-2">
            {/* TABS */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-[2px] transition-all ${
                  activeTab === 'deposit'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" /> Hacer Depósito
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-[2px] transition-all ${
                  activeTab === 'manage'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" /> Asignar Dinero
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 px-6 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-[2px] transition-all ${
                  activeTab === 'insights'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" /> IA Insights
              </button>
            </div>

            {/* TAB: DEPOSIT */}
            {activeTab === 'deposit' && (
              <div className="bg-white rounded-[32px] shadow-xl p-8 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Hacer Depósito</h3>

                {/* MONTO */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">
                    Monto a Depositar
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-900">
                      $
                    </span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => handleDepositAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 pl-10 bg-slate-50 border-2 border-slate-200 rounded-[20px] font-black text-2xl text-right outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* FEE BREAKDOWN - NUEVA SECCIÓN */}
                {showFeeBreakdown && feeCalculation && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-[20px] p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-amber-600" />
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-[2px]">
                        Desglose de Depósito
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Monto solicitado */}
                      <div className="flex justify-between items-center p-3 bg-white rounded-[12px]">
                        <span className="text-sm text-amber-900 font-medium">Monto a depositar:</span>
                        <span className="font-bold text-amber-900">{formatCurrency(feeCalculation.amountRequested)}</span>
                      </div>

                      {/* Fee */}
                      <div className="flex justify-between items-center p-3 bg-white rounded-[12px]">
                        <span className="text-sm text-amber-900 font-medium">
                          Comisión plataforma:
                        </span>
                        <span className="font-bold text-red-600">
                          -{formatCurrency(feeCalculation.totalFee)}
                          {feeCalculation.feePercentage && ` (${(feeCalculation.feePercentage * 100).toFixed(1)}%)`}
                        </span>
                      </div>

                      {/* Net Amount */}
                      <div className="border-t-2 border-amber-200 pt-2">
                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-[12px]">
                          <span className="text-sm font-black text-emerald-900">Saldo para tu hijo:</span>
                          <span className="text-lg font-black text-emerald-600">
                            {formatCurrency(feeCalculation.netAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-amber-700 font-medium">
                      💡 {feeCalculation.description}
                    </p>
                  </div>
                )}

                {/* MÉTODOS DE PAGO */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPaymentMethod('spei');
                        // Recalculate fees with new method
                        if (depositAmount && billingConfig) {
                          const amount = parseFloat(depositAmount);
                          if (amount > 0) {
                            const calculation = calculateDepositFee(amount, DepositMethod.SPEI, billingConfig);
                            setFeeCalculation(calculation);
                          }
                        }
                      }}
                      className={`p-4 rounded-[20px] border-2 transition-all text-center font-black text-[10px] uppercase tracking-[1px] flex items-center justify-center gap-2 ${
                        paymentMethod === 'spei'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> SPEI
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('card');
                        // Recalculate fees with new method
                        if (depositAmount && billingConfig) {
                          const amount = parseFloat(depositAmount);
                          if (amount > 0) {
                            const calculation = calculateDepositFee(amount, DepositMethod.CARD, billingConfig);
                            setFeeCalculation(calculation);
                          }
                        }
                      }}
                      className={`p-4 rounded-[20px] border-2 transition-all text-center font-black text-[10px] uppercase tracking-[1px] flex items-center justify-center gap-2 ${
                        paymentMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" /> Tarjeta
                    </button>
                  </div>
                </div>

                {/* DETALLES DEL MÉTODO */}
                {paymentMethod === 'spei' && billingConfig && (
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] mb-2">
                      Información SPEI
                    </p>
                    <p className="text-sm text-blue-900 font-medium">
                      Comisión SPEI: {formatCurrency(billingConfig.depositFeeSPEI)} por transferencia. El depósito se procesará en máximo 2 horas hábiles.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && billingConfig && (
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-[20px] p-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[2px] mb-2">
                      Pago con Tarjeta
                    </p>
                    <p className="text-sm text-blue-900 font-medium">
                      Comisión: {(billingConfig.depositFeeCard * 100).toFixed(1)}% del monto. Serás redirigido a nuestro procesador seguro de pagos.
                    </p>
                  </div>
                )}

                {/* BOTÓN PROCESAR */}
                <Button
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositAmount}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black px-6 py-4 rounded-[24px] transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Procesando...
                    </>
                  ) : (
                    'Continuar Depósito'
                  )}
                </Button>
              </div>
            )}

            {/* TAB: MANAGE */}
            {activeTab === 'manage' && (
              <div className="bg-white rounded-[32px] shadow-xl p-8 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Asignar Dinero</h3>

                {/* SELECCIONAR HIJO */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">
                    Selecciona a Quién
                  </label>
                  <div className="space-y-2">
                    {children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedChild(child.id)}
                        className={`w-full p-4 rounded-[20px] border-2 transition-all text-left font-black text-[10px] uppercase tracking-[1px] ${
                          selectedChild === child.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{child.name}</span>
                          <span className="text-sm font-bold">Saldo: ${child.balance.toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MONTO */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">
                    Monto a Asignar
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-900">
                      $
                    </span>
                    <input
                      type="number"
                      value={assignAmount}
                      onChange={(e) => setAssignAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 pl-10 bg-slate-50 border-2 border-slate-200 rounded-[20px] font-black text-2xl text-right outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>

                {/* RESUMEN */}
                {selectedChild && assignAmount && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[20px] p-4">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[2px] mb-2">
                      Resumen
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between font-bold">
                        <span>Estudiante:</span>
                        <span>{children.find(c => c.id === selectedChild)?.name}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-600">
                        <span>Monto:</span>
                        <span>${assignAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* BOTÓN ASIGNAR */}
                <Button
                  onClick={handleAssign}
                  disabled={isProcessing || !selectedChild || !assignAmount}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black px-6 py-4 rounded-[24px] transition-all shadow-lg uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar Dinero'
                  )}
                </Button>
              </div>
            )}

            {/* TAB: AI INSIGHTS */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* SPENDING ANALYSIS */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[32px] shadow-xl p-8 border-2 border-indigo-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-2xl font-black text-slate-900">Análisis de Gasto</h3>
                  </div>
                  
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Loader2 className="animate-spin w-5 h-5" />
                      <p className="font-black">Analizando patrones...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {aiInsight || "💡 Gemini está analizando los patrones de gasto..."}
                      </p>
                      <button
                        onClick={loadAIInsights}
                        className="text-indigo-600 font-black text-[10px] uppercase tracking-[2px] hover:text-indigo-700 transition-colors"
                      >
                        ↻ Actualizar Análisis
                      </button>
                    </div>
                  )}
                </div>

                {/* SMART ALERTS */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[32px] shadow-xl p-8 border-2 border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-6 h-6 text-amber-600" />
                    <h3 className="text-2xl font-black text-slate-900">Alertas Inteligentes</h3>
                  </div>
                  
                  {aiAlerts.length > 0 ? (
                    <div className="space-y-3">
                      {aiAlerts.map((alert, idx) => (
                        <div key={idx} className="bg-white rounded-[16px] p-4 border-l-4 border-amber-600">
                          <p className="text-slate-800 font-medium">{alert}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-700 font-medium">✅ No hay alertas importantes en este momento.</p>
                  )}
                </div>

                {/* INFO */}
                <div className="bg-blue-50 rounded-[24px] p-6 border-2 border-blue-100">
                  <p className="text-blue-900 font-bold text-sm">
                    💡 <strong>Inteligencia Artificial:</strong> Estos análisis se actualizan diariamente con los últimos patrones de gasto de tu hijo. Basados en Gemini AI.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFO BOX */}
        <div className="mt-8 bg-amber-50 border-2 border-amber-100 rounded-[24px] p-6">
          <p className="text-sm text-amber-900 font-bold">
            ⚠️ <strong>Seguridad:</strong> Los depósitos se protegen con encriptación de 256 bits. Tu información de pago nunca se almacena en nuestros servidores.
          </p>
        </div>
      </div>
    </div>
  );
}
