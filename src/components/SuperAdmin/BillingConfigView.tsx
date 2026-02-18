/**
 * SUPERADMIN BILLING CONFIG VIEW
 * Interfaz para configurar variables de precios y fees por escuela
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react'
import { SchoolBillingConfig } from '../../types'
import { getBillingConfig, updateBillingConfig, formatCurrency, formatPercentage } from '../../services/BillingService'
import { Card, Button, Input, Alert, Tabs, Badge } from 'lucide-react'

interface BillingConfigViewProps {
  schoolId: string
  onSaved?: (config: SchoolBillingConfig) => void
}

export const BillingConfigView: React.FC<BillingConfigViewProps> = ({ schoolId, onSaved }) => {
  const [config, setConfig] = useState<SchoolBillingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<string>('infrastructure')

  useEffect(() => {
    loadConfig()
  }, [schoolId])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const billingConfig = await getBillingConfig(schoolId)
      setConfig(billingConfig)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando configuración de billing' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      await updateBillingConfig(schoolId, config)
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
    return <div className="text-center">Cargando configuración...</div>
  }

  if (!config) {
    return <div className="text-red-500">No se pudo cargar la configuración</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Configuración de Billing</h1>
        <p className="text-gray-600">Escuela: {schoolId}</p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}>
          <span className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </span>
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {[
            { id: 'infrastructure', label: 'Infraestructura' },
            { id: 'deposits', label: 'Depósitos' },
            { id: 'pos', label: 'POS/Comisiones' },
            { id: 'concessionaire', label: 'Concesionario' },
            { id: 'limits', label: 'Límites' },
            { id: 'preview', label: 'Vista Previa' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Infrastructure */}
      {activeTab === 'infrastructure' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Infraestructura y Ventas</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Setup Fee (One-time)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.setupFee}
                  onChange={handleNumberChange('setupFee')}
                  placeholder="25000.00"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Pagado por: {config.setupFeePaidBy}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Rent</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.monthlyRent}
                  onChange={handleNumberChange('monthlyRent')}
                  placeholder="3500.00"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(config.monthlyRent * 12)}/año</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Yearly Card Cost (per student)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.yearlyCardCost}
                  onChange={handleNumberChange('yearlyCardCost')}
                  placeholder="140.00"
                  step="10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Costo real de tarjeta</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card Design Fee (One-time)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.cardDesignFee}
                  onChange={handleNumberChange('cardDesignFee')}
                  placeholder="0.00"
                  step="10"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Deposits */}
      {activeTab === 'deposits' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Fees de Depósitos (Padres)</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Fee Tarjeta Crédito/Débito</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={(config.depositFeeCard * 100).toFixed(1)}
                  onChange={(e) => updateField('depositFeeCard', parseFloat(e.target.value) / 100)}
                  placeholder="3.5"
                  step="0.1"
                  max="10"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ej: Si padre deposita $1,000 paga ${(1000 * config.depositFeeCard).toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fee SPEI Fijo</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.depositFeeSPEI}
                  onChange={handleNumberChange('depositFeeSPEI')}
                  placeholder="8.00"
                  step="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Cantidad fija por cada SPEI</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Fee Depósito en Efectivo</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.depositFeeCash}
                  onChange={handleNumberChange('depositFeeCash')}
                  placeholder="0.00"
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Siempre $0 - sin comisión</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: POS */}
      {activeTab === 'pos' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Comisiones POS / Cafetería</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">POS Markup % (en precio)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={(config.posMarkupPercentage * 100).toFixed(1)}
                  onChange={(e) => updateField('posMarkupPercentage', parseFloat(e.target.value) / 100)}
                  placeholder="3.0"
                  step="0.1"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ej: Producto $100 → Vende por $103</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">POS Comisión % (por venta)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={(config.posCommissionPercentage * 100).toFixed(1)}
                  onChange={(e) => updateField('posCommissionPercentage', parseFloat(e.target.value) / 100)}
                  placeholder="3.0"
                  step="0.1"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Para Cashback & Rewards</p>
            </div>
          </div>

          <Alert className="bg-blue-50">
            <p className="text-sm text-blue-700">
              💡 <strong>Nota:</strong> Las escuelas NO reciben % de ventas POS. Solo reciben si ELLOS manejan la cafetería.
            </p>
          </Alert>
        </Card>
      )}

      {/* Tab: Concessionaire */}
      {activeTab === 'concessionaire' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Fees Concesionario</h2>
          <p className="text-sm text-gray-600 mb-4">Solo aplica si hay concesionario separado (no escuela)</p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly System Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.concessMonthlySystemFee}
                  onChange={handleNumberChange('concessMonthlySystemFee')}
                  placeholder="0.00"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Tech Support Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.concessTechSupportFee}
                  onChange={handleNumberChange('concessTechSupportFee')}
                  placeholder="0.00"
                  step="100"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Early Withdrawal Fee %</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={(config.earlyWithdrawalFeePercentage * 100).toFixed(1)}
                  onChange={(e) => updateField('earlyWithdrawalFeePercentage', parseFloat(e.target.value) / 100)}
                  placeholder="2.0"
                  step="0.1"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Cargo extra para retiro antes de 7 días</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Limits */}
      {activeTab === 'limits' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Límites de Seguridad</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Max Depósito por Transacción</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.maxDepositPerTx}
                  onChange={handleNumberChange('maxDepositPerTx')}
                  placeholder="50000"
                  step="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Límite Diario Estudiante</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.studentDailyLimit}
                  onChange={handleNumberChange('studentDailyLimit')}
                  placeholder="500"
                  step="50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Límite Semanal Estudiante</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  type="number"
                  value={config.studentWeeklyLimit}
                  onChange={handleNumberChange('studentWeeklyLimit')}
                  placeholder="2000"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Invoice Due Date</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.invoiceDueDate}
                  onChange={(e) => updateField('invoiceDueDate', parseInt(e.target.value))}
                  placeholder="10"
                  step="1"
                  max="30"
                />
                <span className="text-gray-500">días</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Días Antes de Suspensión</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.overdueDaysBeforeSuspension}
                  onChange={(e) => updateField('overdueDaysBeforeSuspension', parseInt(e.target.value))}
                  placeholder="30"
                  step="5"
                />
                <span className="text-gray-500">días</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Después de vencimiento</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Preview */}
      {activeTab === 'preview' && (
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Vista Previa de Cálculos</h2>

          <div className="space-y-6">
            {/* Deposit Simulation */}
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-bold mb-3">Simulación: Padre deposita $1,000 por Tarjeta</h3>
              <div className="space-y-2 text-sm">
                <p>Monto: <strong>$1,000.00</strong></p>
                <p>Comisión ({formatPercentage(config.depositFeeCard)}): <strong>-${(1000 * config.depositFeeCard).toFixed(2)}</strong></p>
                <p className="border-t pt-2">
                  Saldo para estudiante: <strong className="text-green-600">${(1000 - 1000 * config.depositFeeCard).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Monthly Invoice Simulation */}
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-bold mb-3">Simulación: Factura Mensual para Escuela</h3>
              <div className="space-y-1 text-sm">
                <p>Monthly Rent: <strong>{formatCurrency(config.monthlyRent)}</strong></p>
                <p>Depósitos procesados (ej. $100,000 × {formatPercentage(config.depositFeeCard)}): <strong>{formatCurrency(100000 * config.depositFeeCard)}</strong></p>
                <p>SPEI (ej. 50 × ${config.depositFeeSPEI}): <strong>{formatCurrency(50 * config.depositFeeSPEI)}</strong></p>
                <p className="border-t pt-2">
                  Subtotal: <strong>{formatCurrency(config.monthlyRent + 100000 * config.depositFeeCard + 50 * config.depositFeeSPEI)}</strong>
                </p>
                <p>
                  Total con IVA (16%): <strong className="text-green-600">{formatCurrency((config.monthlyRent + 100000 * config.depositFeeCard + 50 * config.depositFeeSPEI) * 1.16)}</strong>
                </p>
              </div>
            </div>

            {/* Key Dates */}
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-bold mb-3">Calendario de Pagos</h3>
              <div className="space-y-1 text-sm">
                <p>Invoice creada: <strong>Último día del mes</strong></p>
                <p>Vencimiento: <strong>+{config.invoiceDueDate} días</strong></p>
                <p>Período de gracia: <strong>{config.overdueDaysBeforeSuspension} días más</strong></p>
                <p>Bloqueo automático: <strong>Día {config.invoiceDueDate + config.overdueDaysBeforeSuspension}</strong></p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex gap-4 sticky bottom-0 bg-white p-4 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
        <Button
          onClick={loadConfig}
          disabled={loading}
          className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
        >
          Descartar Cambios
        </Button>
      </div>
    </div>
  )
}

export default BillingConfigView
