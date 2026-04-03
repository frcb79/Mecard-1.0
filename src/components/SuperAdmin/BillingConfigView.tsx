/**
 * SUPERADMIN BILLING CONFIG VIEW
 * Interfaz para configurar variables de precios y fees por escuela
 * Premium/Bento design language
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react'
import { DollarSign, CreditCard, Store, ShieldCheck, Eye, Settings2, Loader2, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SchoolBillingConfig } from '../../types'
import { MOCK_SCHOOLS } from '../../constants'
import { getBillingConfig, updateBillingConfig, formatCurrency, formatPercentage } from '../../services/BillingService'

interface BillingConfigViewProps {
  schoolId?: string
  onSaved?: (config: SchoolBillingConfig) => void
}

/* ── Shared sub-components ─────────────────────────────── */
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</label>
)

const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[10px] text-slate-400 font-medium mt-1.5">{children}</p>
)

const NumInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string; suffix?: string }> = ({ prefix, suffix, className, ...props }) => (
  <div className="flex items-center gap-3">
    {prefix && <span className="text-slate-400 font-black text-sm">{prefix}</span>}
    <input
      type="number"
      className={`w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-slate-700 text-lg outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${className ?? ''}`}
      {...props}
    />
    {suffix && <span className="text-slate-400 font-black text-sm">{suffix}</span>}
  </div>
)

const SectionCard: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
  <div className="bg-white rounded-[32px] border border-slate-200 ring-1 ring-inset ring-slate-100 p-10 space-y-8 animate-in fade-in duration-300">
    <div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{title}</h2>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
)

/* ── Tabs data ─────────────────────────────────────────── */
const TABS = [
  { id: 'infrastructure', label: 'Infraestructura', icon: Settings2 },
  { id: 'deposits', label: 'Depósitos', icon: CreditCard },
  { id: 'pos', label: 'POS / Comisiones', icon: Store },
  { id: 'concessionaire', label: 'Concesionario', icon: DollarSign },
  { id: 'limits', label: 'Límites', icon: ShieldCheck },
  { id: 'preview', label: 'Vista Previa', icon: Eye },
] as const

export const BillingConfigView: React.FC<BillingConfigViewProps> = ({ schoolId, onSaved }) => {
  const effectiveSchoolId = schoolId ?? MOCK_SCHOOLS[0]?.id ?? ''
  const [config, setConfig] = useState<SchoolBillingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<string>('infrastructure')

  useEffect(() => {
    loadConfig()
  }, [effectiveSchoolId])

  const loadConfig = async () => {
    if (!effectiveSchoolId) {
      setLoading(false)
      setMessage({ type: 'error', text: 'No hay escuela disponible para cargar billing.' })
      return
    }

    setLoading(true)
    try {
      const billingConfig = await getBillingConfig(effectiveSchoolId)
      setConfig(billingConfig)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando configuración de billing' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    if (!effectiveSchoolId) return

    setSaving(true)
    try {
      await updateBillingConfig(effectiveSchoolId, config)
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
      onSaved?.(config)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error guardando configuración' })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof SchoolBillingConfig, value: string | number | boolean) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  const handleNumberChange = (field: keyof SchoolBillingConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateField(field, parseFloat(e.target.value) || 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        <span className="font-black text-[10px] uppercase tracking-widest">Cargando configuración…</span>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64 text-rose-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="font-bold">No se pudo cargar la configuración</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-5 md:p-8 space-y-8 pb-32">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Configuración de Billing</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Escuela: {effectiveSchoolId || 'No seleccionada'}</p>
      </header>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-3xl p-5 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* Tabs — pill style */}
      <div className="bg-slate-100/60 p-1.5 rounded-2xl inline-flex gap-1 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Infrastructure */}
      {activeTab === 'infrastructure' && (
        <SectionCard title="Infraestructura y Ventas" subtitle="Costos fijos de setup y renta mensual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>Setup Fee (One-time)</Label>
              <NumInput prefix="$" value={config.setupFee} onChange={handleNumberChange('setupFee')} placeholder="25000.00" step="100" />
              <Hint>Pagado por: {config.setupFeePaidBy}</Hint>
            </div>

            <div>
              <Label>Monthly Rent</Label>
              <NumInput prefix="$" value={config.monthlyRent} onChange={handleNumberChange('monthlyRent')} placeholder="3500.00" step="100" />
              <Hint>{formatCurrency(config.monthlyRent * 12)}/año</Hint>
            </div>

            <div>
              <Label>Yearly Card Cost (per student)</Label>
              <NumInput prefix="$" value={config.yearlyCardCost} onChange={handleNumberChange('yearlyCardCost')} placeholder="140.00" step="10" />
              <Hint>Costo real de tarjeta</Hint>
            </div>

            <div>
              <Label>Card Design Fee (One-time)</Label>
              <NumInput prefix="$" value={config.cardDesignFee} onChange={handleNumberChange('cardDesignFee')} placeholder="0.00" step="10" />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Tab: Deposits */}
      {activeTab === 'deposits' && (
        <SectionCard title="Fees de Depósitos" subtitle="Comisiones cobradas al padre al recargar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>Fee Tarjeta Crédito/Débito</Label>
              <NumInput
                suffix="%"
                value={(config.depositFeeCard * 100).toFixed(1)}
                onChange={(e) => updateField('depositFeeCard', parseFloat(e.currentTarget.value) / 100)}
                placeholder="3.5" step="0.1" max="10"
              />
              <Hint>Ej: Si padre deposita $1,000 paga ${(1000 * config.depositFeeCard).toFixed(2)}</Hint>
            </div>

            <div>
              <Label>Fee SPEI Fijo</Label>
              <NumInput prefix="$" value={config.depositFeeSPEI} onChange={handleNumberChange('depositFeeSPEI')} placeholder="8.00" step="1" />
              <Hint>Cantidad fija por cada SPEI</Hint>
            </div>

            <div className="md:col-span-2">
              <Label>Fee Depósito en Efectivo</Label>
              <NumInput prefix="$" value={config.depositFeeCash} onChange={handleNumberChange('depositFeeCash')} placeholder="0.00" disabled className="opacity-50 cursor-not-allowed" />
              <Hint>Siempre $0 — sin comisión</Hint>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Tab: POS */}
      {activeTab === 'pos' && (
        <SectionCard title="Comisiones POS / Cafetería" subtitle="Markup y comisión por venta en punto de venta">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>POS Markup % (en precio)</Label>
              <NumInput
                suffix="%"
                value={(config.posMarkupPercentage * 100).toFixed(1)}
                onChange={(e) => updateField('posMarkupPercentage', parseFloat(e.currentTarget.value) / 100)}
                placeholder="3.0" step="0.1"
              />
              <Hint>Ej: Producto $100 → Vende por $103</Hint>
            </div>

            <div>
              <Label>POS Comisión % (por venta)</Label>
              <NumInput
                suffix="%"
                value={(config.posCommissionPercentage * 100).toFixed(1)}
                onChange={(e) => updateField('posCommissionPercentage', parseFloat(e.currentTarget.value) / 100)}
                placeholder="3.0" step="0.1"
              />
              <Hint>Para Cashback &amp; Rewards</Hint>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-indigo-50/60 border border-indigo-100">
            <p className="text-xs text-indigo-700 font-bold leading-relaxed">
              💡 <strong>Nota:</strong> Las escuelas NO reciben % de ventas POS. Solo reciben si ELLOS manejan la cafetería.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Tab: Concessionaire */}
      {activeTab === 'concessionaire' && (
        <SectionCard title="Fees Concesionario" subtitle="Solo aplica si hay concesionario separado (no escuela)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>Monthly System Fee</Label>
              <NumInput prefix="$" value={config.concessMonthlySystemFee} onChange={handleNumberChange('concessMonthlySystemFee')} placeholder="0.00" step="100" />
            </div>

            <div>
              <Label>Monthly Tech Support Fee</Label>
              <NumInput prefix="$" value={config.concessTechSupportFee} onChange={handleNumberChange('concessTechSupportFee')} placeholder="0.00" step="100" />
            </div>

            <div className="md:col-span-2">
              <Label>Early Withdrawal Fee %</Label>
              <NumInput
                suffix="%"
                value={(config.earlyWithdrawalFeePercentage * 100).toFixed(1)}
                onChange={(e) => updateField('earlyWithdrawalFeePercentage', parseFloat(e.currentTarget.value) / 100)}
                placeholder="2.0" step="0.1"
              />
              <Hint>Cargo extra para retiro antes de 7 días</Hint>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Tab: Limits */}
      {activeTab === 'limits' && (
        <SectionCard title="Límites de Seguridad" subtitle="Topes de depósito y gasto diario/semanal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>Max Depósito por Transacción</Label>
              <NumInput prefix="$" value={config.maxDepositPerTx} onChange={handleNumberChange('maxDepositPerTx')} placeholder="50000" step="1000" />
            </div>

            <div>
              <Label>Límite Diario Estudiante</Label>
              <NumInput prefix="$" value={config.studentDailyLimit} onChange={handleNumberChange('studentDailyLimit')} placeholder="500" step="50" />
            </div>

            <div>
              <Label>Límite Semanal Estudiante</Label>
              <NumInput prefix="$" value={config.studentWeeklyLimit} onChange={handleNumberChange('studentWeeklyLimit')} placeholder="2000" step="100" />
            </div>

            <div>
              <Label>Invoice Due Date</Label>
              <NumInput suffix="días" value={config.invoiceDueDate} onChange={(e) => updateField('invoiceDueDate', parseInt(e.currentTarget.value))} placeholder="10" step="1" max="30" />
            </div>

            <div>
              <Label>Días Antes de Suspensión</Label>
              <NumInput suffix="días" value={config.overdueDaysBeforeSuspension} onChange={(e) => updateField('overdueDaysBeforeSuspension', parseInt(e.currentTarget.value))} placeholder="30" step="5" />
              <Hint>Después de vencimiento</Hint>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Tab: Preview */}
      {activeTab === 'preview' && (
        <SectionCard title="Vista Previa de Cálculos" subtitle="Simulaciones con los parámetros actuales">
          <div className="space-y-6">
            {/* Deposit Simulation */}
            <div className="p-8 rounded-3xl bg-slate-50 space-y-3">
              <h3 className="font-black text-slate-700 tracking-tight">Simulación: Padre deposita $1,000 por Tarjeta</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Monto: <strong className="text-slate-800">$1,000.00</strong></p>
                <p>Comisión ({formatPercentage(config.depositFeeCard)}): <strong className="text-rose-600">-${(1000 * config.depositFeeCard).toFixed(2)}</strong></p>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <p>Saldo para estudiante: <strong className="text-emerald-600 text-lg">${(1000 - 1000 * config.depositFeeCard).toFixed(2)}</strong></p>
                </div>
              </div>
            </div>

            {/* Monthly Invoice Simulation */}
            <div className="p-8 rounded-3xl bg-slate-50 space-y-3">
              <h3 className="font-black text-slate-700 tracking-tight">Simulación: Factura Mensual para Escuela</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Monthly Rent: <strong className="text-slate-800">{formatCurrency(config.monthlyRent)}</strong></p>
                <p>Depósitos procesados (ej. $100,000 × {formatPercentage(config.depositFeeCard)}): <strong className="text-slate-800">{formatCurrency(100000 * config.depositFeeCard)}</strong></p>
                <p>SPEI (ej. 50 × ${config.depositFeeSPEI}): <strong className="text-slate-800">{formatCurrency(50 * config.depositFeeSPEI)}</strong></p>
                <div className="border-t border-slate-200 pt-3 mt-3 space-y-1">
                  <p>Subtotal: <strong className="text-slate-800">{formatCurrency(config.monthlyRent + 100000 * config.depositFeeCard + 50 * config.depositFeeSPEI)}</strong></p>
                  <p>Total con IVA (16%): <strong className="text-emerald-600 text-lg">{formatCurrency((config.monthlyRent + 100000 * config.depositFeeCard + 50 * config.depositFeeSPEI) * 1.16)}</strong></p>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div className="p-8 rounded-3xl bg-slate-50 space-y-3">
              <h3 className="font-black text-slate-700 tracking-tight">Calendario de Pagos</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Invoice creada: <strong className="text-slate-800">Último día del mes</strong></p>
                <p>Vencimiento: <strong className="text-slate-800">+{config.invoiceDueDate} días</strong></p>
                <p>Período de gracia: <strong className="text-slate-800">{config.overdueDaysBeforeSuspension} días más</strong></p>
                <p>Bloqueo automático: <strong className="text-rose-600">Día {config.invoiceDueDate + config.overdueDaysBeforeSuspension}</strong></p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex gap-4 justify-end">
          <button
            onClick={loadConfig}
            disabled={loading}
            className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando…' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BillingConfigView
