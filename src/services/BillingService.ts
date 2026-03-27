/**
 * MECARD BILLING SERVICE
 * Maneja toda la lógica de cálculos, facturas y configuración de precios
 * @version 1.0.0
 */

import {
  SchoolBillingConfig,
  DepositMethod,
  DepositWithFeeCalculation,
  Invoice,
  InvoiceStatus,
  BillingLineItem,
  RevenueCategoryType,
  SchoolBlockingRule,
  BlockingReason,
  RevenueTrackingRecord
} from '../types'
import { logger } from '../lib/logger'

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_BILLING_CONFIGS: Record<string, SchoolBillingConfig> = {
  'school-001': {
    id: 'config-001',
    schoolId: 'school-001',
    setupFee: 25000,
    setupFeePaidBy: 'SCHOOL',
    monthlyRent: 3500,
    annualLicense: 42000,
    yearlyCardCost: 140,
    cardDesignFee: 0,
    depositFeeCard: 0.035,
    depositFeeSPEI: 8,
    depositFeeCash: 0,
    posMarkupPercentage: 0.03,
    posCommissionPercentage: 0.03,
    concessMonthlySystemFee: 0,
    concessTechSupportFee: 0,
    concessCardProcessingFee: 0,
    earlyWithdrawalFeePercentage: 0.02,
    maxDepositPerTx: 50000,
    studentDailyLimit: 500,
    studentWeeklyLimit: 2000,
    invoiceDueDate: 10,
    overdueDaysBeforeSuspension: 30,
    billingCycle: 'MONTHLY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Mock invoice storage
const MOCK_INVOICES: Record<string, Invoice[]> = {}

// ============================================
// 1. DEPOSIT FEE CALCULATION
// ============================================

/**
 * Calcula el fee automático de un depósito
 * Retorna objeto con desglose transparente
 */
export function calculateDepositFee(
  amount: number,
  method: DepositMethod,
  billingConfig: SchoolBillingConfig
): DepositWithFeeCalculation {
  let totalFee = 0
  let feePercentage: number | undefined
  let feeFlatAmount: number | undefined
  let description = ''

  switch (method) {
    case DepositMethod.CARD:
      feePercentage = billingConfig.depositFeeCard
      totalFee = amount * feePercentage
      description = `Plataforma MeCard - Comisión ${(feePercentage * 100).toFixed(1)}% por pago con tarjeta`
      break

    case DepositMethod.SPEI:
      feeFlatAmount = billingConfig.depositFeeSPEI
      totalFee = feeFlatAmount
      description = `Plataforma MeCard - Comisión $${feeFlatAmount.toFixed(2)} por transferencia SPEI`
      break

    case DepositMethod.CASH:
      totalFee = 0
      description = 'Depósito en efectivo - Sin comisión'
      break

    case DepositMethod.OXXO:
      feeFlatAmount = billingConfig.depositFeeSPEI + 2.5 // OXXO tiene extra
      totalFee = feeFlatAmount
      description = `Comisión por pago en OXXO`
      break

    default:
      totalFee = 0
      description = 'Depósito - Sin comisión'
  }

  return {
    amountRequested: amount,
    depositMethod: method,
    feePercentage,
    feeFlatAmount,
    totalFee: Math.round(totalFee * 100) / 100, // 2 decimales
    netAmount: Math.round((amount - totalFee) * 100) / 100,
    description
  }
}

// ============================================
// 2. INVOICE GENERATION
// ============================================

/**
 * Genera una factura mensual para una escuela
 * Calcula todos los line items automáticamente
 */
export interface InvoiceGenerationParams {
  schoolId: string
  period: string // YYYY-MM-01
  depositsTotal: number
  speiTransactionCount: number
  cardPrintingCount: number
  billingConfig: SchoolBillingConfig
}

export function generateMonthlyInvoice(params: InvoiceGenerationParams): Invoice {
  const {
    schoolId,
    period,
    depositsTotal,
    speiTransactionCount,
    cardPrintingCount,
    billingConfig
  } = params

  const lineItems: BillingLineItem[] = []

  // 1. Monthly Rent
  lineItems.push({
    description: `Renta Mensual - Acceso a Plataforma MeCard`,
    quantity: 1,
    unitPrice: billingConfig.monthlyRent,
    amount: billingConfig.monthlyRent,
    category: 'INFRASTRUCTURE'
  })

  // 2. Card Printing (if any)
  if (cardPrintingCount > 0) {
    lineItems.push({
      description: `Impresión de Credenciales - ${cardPrintingCount} tarjetas`,
      quantity: cardPrintingCount,
      unitPrice: billingConfig.yearlyCardCost,
      amount: cardPrintingCount * billingConfig.yearlyCardCost,
      category: 'CARD'
    })
  }

  // 3. Deposit Commission (Card deposits)
  const cardDepositFee = depositsTotal * billingConfig.depositFeeCard
  if (cardDepositFee > 0) {
    lineItems.push({
      description: `Comisión por Depósitos (Tarjeta) - ${(billingConfig.depositFeeCard * 100).toFixed(1)}%`,
      quantity: 1,
      unitPrice: cardDepositFee,
      amount: cardDepositFee,
      category: 'COMMISSION'
    })
  }

  // 4. SPEI Commission
  const speiDepositFee = speiTransactionCount * billingConfig.depositFeeSPEI
  if (speiDepositFee > 0) {
    lineItems.push({
      description: `Comisión por Transferencias SPEI - ${speiTransactionCount} transacciones`,
      quantity: speiTransactionCount,
      unitPrice: billingConfig.depositFeeSPEI,
      amount: speiDepositFee,
      category: 'COMMISSION'
    })
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxes = Math.round(subtotal * 0.16 * 100) / 100 // IVA 16%
  const total = Math.round((subtotal + taxes) * 100) / 100

  // Generate invoice number
  const [year, month] = period.split('-')
  const invoiceNumber = `INV-${year}-${month}-${Math.random().toString(36).substring(7).toUpperCase()}`

  // Calculate due date
  const issueDate = new Date(period)
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + billingConfig.invoiceDueDate)

  return {
    id: `inv-${Date.now()}`,
    schoolId,
    invoiceNumber,
    issueDate: issueDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    subtotal: Math.round(subtotal * 100) / 100,
    taxes,
    total,
    status: InvoiceStatus.ISSUED,
    lineItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ============================================
// 3. BLOCKING RULES
// ============================================

/**
 * Determina si una escuela debe ser bloqueada por falta de pago
 */
export interface BlockingCheckParams {
  invoiceDueDate: Date
  overdueDaysBeforeSuspension: number
}

export function shouldBlockSchool(params: BlockingCheckParams): boolean {
  const { invoiceDueDate, overdueDaysBeforeSuspension } = params
  const now = new Date()
  const daysOverdue = Math.floor((now.getTime() - invoiceDueDate.getTime()) / (1000 * 60 * 60 * 24))

  return daysOverdue >= overdueDaysBeforeSuspension
}

/**
 * Crea una regla de bloqueo para una escuela
 */
export function createBlockingRule(
  schoolId: string,
  daysOverdue: number
): SchoolBlockingRule {
  const legalEscalationEligible = daysOverdue >= 60

  return {
    id: `block-${schoolId}-${Date.now()}`,
    schoolId,
    blockedReason: BlockingReason.OVERDUE_INVOICE,
    blockedAt: new Date().toISOString(),
    blockedUntilPayment: true,
    overdueDays: daysOverdue,
    notificationSent: false,
    legalEscalationEligible,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ============================================
// 4. REVENUE TRACKING
// ============================================

/**
 * Registra un evento de ingresos en el sistema de analytics
 */
export function recordRevenueEvent(
  schoolId: string,
  category: RevenueCategoryType,
  amount: number
): RevenueTrackingRecord {
  const now = new Date()
  const period = now.toISOString().split('T')[0].substring(0, 7) + '-01'

  return {
    id: `rev-${schoolId}-${Date.now()}`,
    schoolId,
    period,
    revenueCategory: category,
    amount: Math.round(amount * 100) / 100,
    transactionCount: 1,
    createdAt: new Date().toISOString()
  }
}

// ============================================
// 5. BILLING CONFIG MANAGEMENT
// ============================================

/**
 * Obtiene la configuración de billing de una escuela
 * Retorna valores por defecto si no existe
 */
export async function getBillingConfig(schoolId: string): Promise<SchoolBillingConfig> {
  // TODO: Conectar a Supabase
  // Por ahora retorna mock data

  return MOCK_BILLING_CONFIGS[schoolId] || MOCK_BILLING_CONFIGS['school-001']!
}

/**
 * Actualiza la configuración de billing de una escuela
 */
export async function updateBillingConfig(
  schoolId: string,
  updates: Partial<SchoolBillingConfig>
): Promise<SchoolBillingConfig> {
  // TODO: Conectar a Supabase
  // Por ahora actualiza mock data

  const config = MOCK_BILLING_CONFIGS[schoolId] || MOCK_BILLING_CONFIGS['school-001']!
  const updated = {
    ...config,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  MOCK_BILLING_CONFIGS[schoolId] = updated
  return updated
}

/**
 * Obtiene todos los valores por defecto para una escuela
 */
export function getDefaultBillingConfig(schoolId: string): SchoolBillingConfig {
  return {
    id: `config-${schoolId}`,
    schoolId,
    setupFee: 25000,
    setupFeePaidBy: 'SCHOOL',
    monthlyRent: 3500,
    annualLicense: 42000,
    yearlyCardCost: 140,
    cardDesignFee: 0,
    depositFeeCard: 0.035,
    depositFeeSPEI: 8,
    depositFeeCash: 0,
    posMarkupPercentage: 0.03,
    posCommissionPercentage: 0.03,
    concessMonthlySystemFee: 0,
    concessTechSupportFee: 0,
    concessCardProcessingFee: 0,
    earlyWithdrawalFeePercentage: 0.02,
    maxDepositPerTx: 50000,
    studentDailyLimit: 500,
    studentWeeklyLimit: 2000,
    invoiceDueDate: 10,
    overdueDaysBeforeSuspension: 30,
    billingCycle: 'MONTHLY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// ============================================
// 6. FORMATTING UTILITIES
// ============================================

/**
 * Formatea un número como currency MXN
 */
export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

// ============================================
// 6. INVOICE MANAGEMENT & PERSISTENCE
// ============================================

/**
 * Guarda una factura generada en mock storage
 */
export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
  const schoolId = invoice.schoolId
  if (!MOCK_INVOICES[schoolId]) {
    MOCK_INVOICES[schoolId] = []
  }
  MOCK_INVOICES[schoolId].push(invoice)
  return invoice
}

/**
 * Obtiene todas las invoices de una escuela
 */
export async function getSchoolInvoices(schoolId: string): Promise<Invoice[]> {
  return MOCK_INVOICES[schoolId] || []
}

/**
 * Obtiene una invoice específica
 */
export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  for (const invoices of Object.values(MOCK_INVOICES)) {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) return invoice
  }
  return null
}

/**
 * Actualiza el estado de una invoice (PAID, OVERDUE, etc)
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  paymentMethod?: string
): Promise<Invoice | null> {
  for (const invoices of Object.values(MOCK_INVOICES)) {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      invoice.status = status
      if (status === InvoiceStatus.PAID) {
        invoice.paymentMethod = paymentMethod
        invoice.paidAt = new Date().toISOString()
      }
      invoice.updatedAt = new Date().toISOString()
      return invoice
    }
  }
  return null
}

/**
 * Parámetros para un resumen de transacciones de un mes
 * En producción, vendrría de una query a Supabase
 */
export interface MonthlyTransactionsSummary {
  schoolId: string
  period: string  // YYYY-MM-01
  totalDepositsCard: number  // Total dinero depositado por tarjeta
  totalDepositsSPEI: number  // Total dinero depositado por SPEI
  speiTransactionCount: number  // Número de SPEI transacciones
  cardPrintingCount: number  // Número de tarjetas impresas
}

/**
 * Mock para simular un resumen de transacciones del mes
 * En real life: SELECT SUM(...), COUNT(...) FROM transactions WHERE schoolId = ? AND month = ?
 */
export function getMockMonthlyTransactionsSummary(
  schoolId: string,
  period: string
): MonthlyTransactionsSummary {
  // Mock data para demostración
  // En real: vendrá de una query real a Supabase
  return {
    schoolId,
    period,
    totalDepositsCard: 95000,  // Dinero depositado por tarjeta
    totalDepositsSPEI: 40000,  // Dinero depositado por SPEI
    speiTransactionCount: 50,  // 50 transacciones SPEI
    cardPrintingCount: 125  // 125 tarjetas nuevas impresas
  }
}

/**
 * Workflow: Al final del mes, generar invoice para una escuela
 * Esto sería un Cloud Function / Cron Job en producción
 */
export async function generateAndSaveMonthlyInvoice(
  schoolId: string,
  period: string,  // YYYY-MM-01
  billingConfig: SchoolBillingConfig
): Promise<Invoice> {
  // 1. Obtener resumen de transacciones
  const transactions = getMockMonthlyTransactionsSummary(schoolId, period)

  // 2. Generar invoice con línea items
  const invoice = generateMonthlyInvoice({
    schoolId,
    period,
    depositsTotal: transactions.totalDepositsCard,
    speiTransactionCount: transactions.speiTransactionCount,
    cardPrintingCount: transactions.cardPrintingCount,
    billingConfig
  })

  // 3. Guardar en mock storage
  await saveInvoice(invoice)

  return invoice
}

/**
 * Simula el cron job que se ejecuta al final del mes
 * En producción: Cloud Scheduler o AWS EventBridge
 */
export async function executeMonthlyBillingCycle(): Promise<Invoice[]> {
  const generatedInvoices: Invoice[] = []
  const today = new Date()
  const period = today.toISOString().split('T')[0].substring(0, 7) + '-01'

  // Itera cada escuela con config de billing
  for (const [schoolId, config] of Object.entries(MOCK_BILLING_CONFIGS)) {
    try {
      const invoice = await generateAndSaveMonthlyInvoice(schoolId, period, config)
      generatedInvoices.push(invoice)
    } catch (error) {
      logger.error('services.billing', 'Error generando invoice mensual', error, {
        schoolId,
        period,
      })
    }
  }

  return generatedInvoices
}

// ============================================
// 6B. SCHOOL BLOCKING RULES MANAGEMENT
// ============================================

// Mock storage for blocking rules
const MOCK_BLOCKING_RULES: Record<string, SchoolBlockingRule> = {}

/**
 * Verifica qué escuelas deben ser bloqueadas (30+ días vencidas)
 * En real: ejecutar como Cloud Function diaria a las 23:59
 */
export async function checkAndApplyBlockingRules(): Promise<SchoolBlockingRule[]> {
  const allInvoices = Object.values(MOCK_INVOICES).flat()
  const blockedRules: SchoolBlockingRule[] = []
  const today = new Date()

  // Itera cada escuela
  for (const schoolId of Object.keys(MOCK_BILLING_CONFIGS)) {
    // Obtener invoices vencidas no pagadas
    const overduInvoices = allInvoices.filter(inv => {
      if (inv.schoolId !== schoolId) return false
      if (inv.status !== InvoiceStatus.ISSUED && inv.status !== InvoiceStatus.OVERDUE) return false

      const dueDate = new Date(inv.dueDate)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysOverdue > 0
    })

    if (overduInvoices.length === 0) {
      // No hay invoices vencidas, desbloquear si estaba bloqueada
      if (MOCK_BLOCKING_RULES[schoolId]) {
        delete MOCK_BLOCKING_RULES[schoolId]
      }
      continue
    }

    // Calcular días de atraso
    const maxOverdue = Math.max(
      ...overduInvoices.map(inv => {
        const dueDate = new Date(inv.dueDate)
        return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      })
    )

    // 30 días de gracia = 30 días después del vencimiento
    const config = MOCK_BILLING_CONFIGS[schoolId]
    const daysBeforeSuspension = config.overdueDaysBeforeSuspension ||30

    if (maxOverdue >= daysBeforeSuspension) {
      // DEBE SER BLOQUEADA
      const existingRule = MOCK_BLOCKING_RULES[schoolId]

      if (!existingRule) {
        // Crear nueva regla
        const newRule = createBlockingRule(schoolId, maxOverdue)
        MOCK_BLOCKING_RULES[schoolId] = newRule
        blockedRules.push(newRule)
      } else {
        // Actualizar días de atraso
        existingRule.overdueDays = maxOverdue
        existingRule.updatedAt = new Date().toISOString()
        blockedRules.push(existingRule)
      }
    }
  }

  return blockedRules
}

/**
 * Obtiene todas las escuelas bloqueadas actualmente
 */
export async function getBlockedSchools(): Promise<SchoolBlockingRule[]> {
  return Object.values(MOCK_BLOCKING_RULES)
}

/**
 * Obtiene regla de bloqueo para una escuela específica
 */
export async function getBlockingRule(schoolId: string): Promise<SchoolBlockingRule | null> {
  return MOCK_BLOCKING_RULES[schoolId] || null
}

/**
 * Desbloquea una escuela manualmente (después de pago recibido)
 */
export async function unblockSchool(schoolId: string): Promise<boolean> {
  if (MOCK_BLOCKING_RULES[schoolId]) {
    delete MOCK_BLOCKING_RULES[schoolId]
    return true
  }
  return false
}

/**
 * Verifica si una escuela está bloqueada
 */
export async function isSchoolBlocked(schoolId: string): Promise<boolean> {
  return !!MOCK_BLOCKING_RULES[schoolId]
}

/**
 * Obtiene información de bloqueo con detalles de invoices vencidas
 */
export interface BlockingDetails {
  rule: SchoolBlockingRule | null
  isBlocked: boolean
  overdueInvoices: Invoice[]
  totalOwed: number
  daysUntilLegalAction: number
}

export async function getBlockingDetails(schoolId: string): Promise<BlockingDetails> {
  const allInvoices = Object.values(MOCK_INVOICES).flat()
  const overdueInvoices = allInvoices.filter(inv => {
    if (inv.schoolId !== schoolId) return false
    return inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.OVERDUE
  })

  const rule = MOCK_BLOCKING_RULES[schoolId] || null
  const totalOwed = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)

  // Legal action después de 60 días
  const daysUntilLegalAction = Math.max(0, 60 - (rule?.overdueDays || 0))

  return {
    rule,
    isBlocked: !!rule,
    overdueInvoices,
    totalOwed,
    daysUntilLegalAction,
  }
}

// ============================================
// 7. ANALYTICS & RECONCILIATION
// ============================================

export interface RevenueAnalytics {
  period: string
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  overallPaymentRate: number
  revenueByCategory: Record<RevenueCategoryType, number>
  schoolMetrics: SchoolMetrics[]
  paymentHealthScore: number
}

export interface SchoolMetrics {
  schoolId: string
  totalInvoiced: number
  totalPaid: number
  paymentRate: number
  avgPaymentDays: number
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL'
}

export interface ReconciliationReport {
  period: string
  generatedDate: string

  // MONEY IN
  moneyIn: {
    parentDeposits: number
    schoolPayments: number
    totalIncome: number
  }

  // MONEY OUT
  moneyOut: {
    schoolLiquidations: number
    concessLiquidations: number
    platformFees: number
    otherExpenses: number
    totalExpenses: number
  }

  // NET
  netCashFlow: number

  // METRICS
  metrics: {
    avgPaymentCycle: number
    delayedPayments: number
    paymentRiskScore: number
  }
}

/**
 * Genera reporte de analytics de revenue
 * En real: consulta a Supabase revenue_tracking table
 */
export function generateRevenueAnalytics(period: string): RevenueAnalytics {
  const allInvoices = Object.values(MOCK_INVOICES).flat()
  const periodInvoices = allInvoices.filter(inv => inv.issueDate.startsWith(period.substring(0, 7)))

  const paidInvoices = periodInvoices.filter(inv => inv.status === InvoiceStatus.PAID)
  const unpaidInvoices = periodInvoices.filter(inv => inv.status === InvoiceStatus.ISSUED || inv.status === InvoiceStatus.OVERDUE)

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const paymentRate = periodInvoices.length > 0 ? (paidInvoices.length / periodInvoices.length) * 100 : 0

  // Mock: Simulation of revenue by category
  const revenueByCategory: Record<RevenueCategoryType, number> = {
    DEPOSIT_FEE: totalRevenue * 0.35,         // 35% from deposit fees
    CARD_EMISSION: totalRevenue * 0.15,       // 15% from card printing
    MONTHLY_RENT: totalRevenue * 0.40,        // 40% from monthly rent
    POS_COMMISSION: totalRevenue * 0.10,      // 10% from POS commissions
    SETUP_FEE: 0,
    CONCESSIONAIRE_FEE: 0,
  }

  // School metrics
  const schoolMetrics: SchoolMetrics[] = Object.entries(MOCK_BILLING_CONFIGS).map(([schoolId, config]) => {
    const schoolInvoices = periodInvoices.filter(inv => inv.schoolId === schoolId)
    const schoolPaid = schoolInvoices.filter(inv => inv.status === InvoiceStatus.PAID)
    const totalInvoiced = schoolInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = schoolPaid.reduce((sum, inv) => sum + inv.total, 0)
    const paymentRate = schoolInvoices.length > 0 ? (schoolPaid.length / schoolInvoices.length) * 100 : 0

    // Determine status based on payment rate
    let status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY'
    if (paymentRate < 50) status = 'CRITICAL'
    else if (paymentRate < 80) status = 'AT_RISK'

    return {
      schoolId,
      totalInvoiced,
      totalPaid,
      paymentRate,
      avgPaymentDays: 8, // Mock
      status,
    }
  })

  // Payment health score (0-100)
  const healthScore = Math.round(
    paymentRate * 0.6 + // 60% weight on payment rate
    (Math.min(schoolMetrics.filter(s => s.status === 'HEALTHY').length / schoolMetrics.length, 1) * 100) * 0.4 // 40% on healthy schools
  )

  return {
    period,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalInvoices: periodInvoices.length,
    paidInvoices: paidInvoices.length,
    unpaidInvoices: unpaidInvoices.length,
    overallPaymentRate: Math.round(paymentRate * 100) / 100,
    revenueByCategory,
    schoolMetrics,
    paymentHealthScore: healthScore,
  }
}

/**
 * Genera reporte de reconciliación (match de dinero)
 * En real: queries a múltiples tablas de transacciones
 */
export function generateReconciliationReport(period: string): ReconciliationReport {
  const allInvoices = Object.values(MOCK_INVOICES).flat()
  const periodInvoices = allInvoices.filter(inv => inv.issueDate.startsWith(period.substring(0, 7)))

  // Mock: Simulate cash flows
  const parentDeposits = 135000  // Total from parent deposits
  const schoolPayments = periodInvoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.total, 0)

  const schoolLiquidations = parentDeposits * 0.85  // 85% to students/schools
  const concessLiquidations = 0  // No concessionaires in this mock
  const platformFees = parentDeposits * 0.15  // 15% goes to MeCard

  return {
    period,
    generatedDate: new Date().toISOString(),

    moneyIn: {
      parentDeposits,
      schoolPayments,
      totalIncome: parentDeposits + schoolPayments,
    },

    moneyOut: {
      schoolLiquidations,
      concessLiquidations,
      platformFees,
      otherExpenses: platformFees * 0.3,  // 30% of platform fees go to ops
      totalExpenses: schoolLiquidations + concessLiquidations + platformFees + (platformFees * 0.3),
    },

    netCashFlow: (parentDeposits + schoolPayments) - (schoolLiquidations + concessLiquidations + platformFees + (platformFees * 0.3)),

    metrics: {
      avgPaymentCycle: 8,  // Average days to payment
      delayedPayments: periodInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      paymentRiskScore: Math.round(
        (periodInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length / Math.max(periodInvoices.length, 1)) * 100
      ),
    },
  }
}

export default {
  calculateDepositFee,
  generateMonthlyInvoice,
  shouldBlockSchool,
  createBlockingRule,
  recordRevenueEvent,
  getBillingConfig,
  updateBillingConfig,
  getDefaultBillingConfig,
  formatCurrency,
  formatPercentage,
  saveInvoice,
  getSchoolInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  generateAndSaveMonthlyInvoice,
  executeMonthlyBillingCycle,
  getMockMonthlyTransactionsSummary,
  generateRevenueAnalytics,
  generateReconciliationReport,
  checkAndApplyBlockingRules,
  getBlockedSchools,
  getBlockingRule,
  unblockSchool,
  isSchoolBlocked,
  getBlockingDetails
}
