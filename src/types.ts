/**
 * MECARD PLATFORM - COMPLETE TYPE DEFINITIONS
 * Versión Final: Consolidada, sin duplicados, con todos los modelos necesarios
 * Convención: camelCase para propiedades, PascalCase para tipos/interfaces
 * 
 * @version 2.0.0
 * @date 2026-01-05
 */

// ============================================
// 1. CORE ENUMS
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SCHOOL_FINANCE = 'SCHOOL_FINANCE',
  UNIT_MANAGER = 'UNIT_MANAGER',
  CAFETERIA_STAFF = 'CAFETERIA_STAFF',
  STATIONERY_STAFF = 'STATIONERY_STAFF',
  CASHIER = 'CASHIER',
  POS_OPERATOR = 'POS_OPERATOR',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum Category {
  HOT_MEALS = 'HOT_MEALS',
  COMBO_MEALS = 'COMBO_MEALS',
  SNACKS = 'SNACKS',
  DRINKS = 'DRINKS',
  SUPPLIES = 'SUPPLIES',
  UNIFORMS = 'UNIFORMS',
  BOOKS = 'BOOKS',
  TECH = 'TECH'
}

export enum EntityOwner {
  SCHOOL = 'SCHOOL',
  CONCESSIONAIRE = 'CONCESSIONAIRE'
}

export enum SchoolStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED'
}

export enum ContractType {
  TRIAL = 'TRIAL',
  STANDARD = 'STANDARD'
}

export type TrialDuration = 1 | 2 | 3;

// ============================================
// 2. PAYMENT & TRANSACTION ENUMS
// ============================================

export enum PaymentMethod {
  WALLET = 'WALLET',                    // Monedero digital
  CREDENTIAL_QR = 'CREDENTIAL_QR',      // Escaneo QR credencial
  CREDENTIAL_BARCODE = 'CREDENTIAL_BARCODE', // Escaneo código de barras
  CREDENTIAL_NFC = 'CREDENTIAL_NFC',    // Tap NFC (futuro)
  MATRICULA = 'MATRICULA',              // Ingreso manual matrícula
  CASH = 'CASH',                        // Efectivo
  ANONYMOUS = 'ANONYMOUS'               // Venta sin identificar alumno
}

export enum TransactionType {
  // Ingresos al wallet
  DEPOSIT = 'DEPOSIT',
  REFUND = 'REFUND',
  GIFT_RECEIVED = 'GIFT_RECEIVED',
  TRANSFER_IN = 'TRANSFER_IN',
  ADJUSTMENT_CREDIT = 'ADJUSTMENT_CREDIT',
  
  // Egresos del wallet
  PURCHASE = 'PURCHASE',
  GIFT_SENT = 'GIFT_SENT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  FEE = 'FEE',
  ADJUSTMENT_DEBIT = 'ADJUSTMENT_DEBIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

export enum DepositMethod {
  CASH = 'CASH',              // Efectivo en escuela
  CARD = 'CARD',              // Tarjeta débito/crédito
  SPEI = 'SPEI',              // Transferencia bancaria
  OXXO = 'OXXO',              // Pago en tienda OXXO
  PAYPAL = 'PAYPAL'           // PayPal
}

export enum DepositStatus {
  PENDING = 'PENDING',         // Esperando confirmación
  PROCESSING = 'PROCESSING',   // Procesando pago
  CONFIRMED = 'CONFIRMED',     // Acreditado exitosamente
  FAILED = 'FAILED',           // Pago falló
  CANCELLED = 'CANCELLED',     // Cancelado
  EXPIRED = 'EXPIRED'          // Expiró (OXXO)
}

// ============================================
// 3. INVENTORY & OPERATIONS ENUMS
// ============================================

export enum MovementType {
  SALE = 'SALE',
  RESTOCK = 'RESTOCK',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN'
}

export enum NotificationType {
  PURCHASE_ALERT = 'PURCHASE_ALERT',
  LOW_BALANCE = 'LOW_BALANCE',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED',
  SETTLEMENT_READY = 'SETTLEMENT_READY',
  TRIAL_EXPIRY = 'TRIAL_EXPIRY',
  GIFT_RECEIVED = 'GIFT_RECEIVED',
  DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED',
  RESTRICTED_PURCHASE = 'RESTRICTED_PURCHASE',
  // Permissions
  PERMISSION_REQUESTED = 'PERMISSION_REQUESTED',
  PERMISSION_APPROVED = 'PERMISSION_APPROVED',
  PERMISSION_REJECTED = 'PERMISSION_REJECTED',
  PERMISSION_CANCELLED = 'PERMISSION_CANCELLED',
  CHILD_NOT_ATTENDING = 'CHILD_NOT_ATTENDING',
  // Multi-parent
  COPARENT_ACTION = 'COPARENT_ACTION',
  // Trips
  TRIP_CREATED = 'TRIP_CREATED',
  TRIP_PAYMENT_DUE = 'TRIP_PAYMENT_DUE',
  TRIP_PAYMENT_CONFIRMED = 'TRIP_PAYMENT_CONFIRMED',
  TRIP_REMINDER = 'TRIP_REMINDER'
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum GiftStatus {
  PENDING = 'PENDING',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// ============================================
// 4. USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  
  // Multi-tenant
  schoolId?: string;
  campusId?: string;
  unitId?: string;
  
  // Profile
  fullName: string;
  phone?: string;
  photo?: string;
  
  // Security
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: string;
  loginAttempts: number;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  deviceId?: string;  // Para POS offline
}

export interface AuthSession {
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  role: UserRole;
  schoolId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId?: string;
  campusId?: string;
  unitId?: string;
  photo?: string;
}

// ============================================
// 5. STUDENT PROFILES & CREDENTIALS
// ============================================

export interface StudentProfile {
  id: string;
  userId?: string;
  
  // Identificación
  studentId: string;        // Matrícula única
  fullName: string;
  firstName: string;
  lastName: string;
  grade: string;
  group?: string;
  curp?: string;
  
  // Escuela/Campus
  schoolId: string;
  campusId?: string;
  
  // Credencial física
  credential: StudentCredential;
  
  // Wallet
  balance: number;
  dailyLimit: number;
  spentToday: number;
  totalSpent: number;
  
  // Restricciones
  restrictions: StudentRestrictions;
  
  // Familia
  parentId: string;
  parentIds?: string[];       // Multi-parent support
  parentName: string;
  parentEmail?: string;
  
  // Transporte
  busRoute?: string;          // Ruta de camión asignada (ej: "Ruta 3 - Satélite")
  
  // Metadata
  photo?: string;
  enrollmentDate: string;
  status: UserStatus;
  
  // Finanzas
  clabePersonal?: string;  // Para devoluciones
  
  // Rewards & Puntos
  rewardsPoints?: StudentRewardsPoints;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface StudentCredential {
  id: string;
  studentId: string;
  
  // Identificadores físicos
  qrCode: string;           // QR único en credencial
  barcode?: string;         // Código de barras opcional
  nfcUid?: string;          // UID chip NFC (futuro)
  
  // Validez
  issuedAt: string;
  expiresAt?: string;
  isActive: boolean;
  
  // Estadísticas de uso
  lastUsed?: string;
  usageCount: number;
  
  // Seguridad
  blockedAt?: string;
  blockedReason?: string;
}

export interface StudentRestrictions {
  // Categorías prohibidas
  restrictedCategories: Category[];
  
  // Productos específicos prohibidos
  restrictedProducts: string[];  // Product IDs
  
  // Alergias (bloqueo automático de productos con alérgenos)
  allergens: string[];
  
  // Límites económicos
  dailyLimit?: number;
  perPurchaseLimit?: number;
  weeklyLimit?: number;
  
  // Restricciones horarias
  timeRestrictions?: TimeRestriction[];
  
  // Días permitidos
  allowedDays?: DayOfWeek[];
}

export interface TimeRestriction {
  category: Category;
  allowedFrom: string;  // "11:00"
  allowedUntil: string; // "14:00"
  days?: DayOfWeek[];
}

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

// ============================================
// 6. PARENT PROFILE
// ============================================

export interface ParentProfile {
  id: string;
  userId: string;
  
  fullName: string;
  email: string;
  phone?: string;
  
  // Hijos asociados
  children: StudentProfile[];
  
  // Multi-parent
  linkedParentId?: string;       // Co-padre vinculado
  linkedParentName?: string;     // Nombre del co-padre
  invitationCode?: string;       // Código de 6 dígitos para vincular
  
  // Contactos autorizados (hasta 3 permanentes)
  authorizedContacts?: AuthorizedContact[];
  
  // Preferencias
  preferences: ParentPreferences;
  
  // Notificaciones
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface ParentPreferences {
  // Límites globales (aplica a todos los hijos si no tienen límite individual)
  globalDailyLimit?: number;
  
  // Alertas
  lowBalanceThreshold: number;
  purchaseAlertEnabled: boolean;
  dailyReportEnabled: boolean;
  
  // Idioma
  language: 'es' | 'en';
  
  // Moneda
  currency: 'MXN' | 'USD';
}

// ============================================
// 6.1 PARENT LIMITS & NOTIFICATIONS
// ============================================

export interface ParentLimitSettings {
  id: string;
  parentId: string;
  studentId: string;
  
  // Límites de presupuesto
  dailyLimit: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  
  // Alertas económicas
  alertWhenBalanceLow: boolean;
  lowBalanceThreshold: number;  // Ej: 50 (MXN)
  
  alertWhenDailySpendExceeds: boolean;
  dailySpendAlertThreshold: number;  // Ej: 200 (MXN) o 80% del límite diario
  
  // Alertas por categoría
  categoryLimits?: Record<Category, number>;  // Límite por categoría
  
  // Control parental
  restrictCategories: Category[];
  restrictProducts: string[];
  
  // Notificaciones
  notifyOnPurchase: boolean;
  notifyOnGift: boolean;
  notifyOnTransfer: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface ParentNotificationSettings {
  id: string;
  parentId: string;
  
  // Canales
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  
  // Frecuencia de alertas
  alertOnEachPurchase: boolean;
  alertOnLowBalance: boolean;
  alertOnSpendThreshold: boolean;
  
  // Configuración de horarios
  quietHoursEnabled: boolean;
  quietHoursStart?: string;  // "22:00"
  quietHoursEnd?: string;    // "08:00"
  
  // Resumen
  sendDailySummary: boolean;
  sendWeeklySummary: boolean;
  
  // Preferencias
  language: 'es' | 'en';
  timezone?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ConsumptionReport {
  id: string;
  parentId: string;
  studentId: string;
  
  // Período
  startDate: string;
  endDate: string;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  
  // Datos agregados
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  
  // Por categoría
  spentByCategory: Record<Category, number>;
  
  // Por merchant
  spentByMerchant: Record<string, number>;
  
  // Tendencias
  dailyBreakdown: Record<string, number>;  // "2026-02-17": 45.50
  
  // Generado
  generatedAt: string;
  generatedBy?: string;  // "PARENT" | "ADMIN" | "SYSTEM"
}

// ============================================
// 7. SCHOOL & CAMPUS
// ============================================

export interface School {
  id: string;
  
  // Información básica
  name: string;
  legalName?: string;
  rfc?: string;
  logo: string;
  
  // Estadísticas
  studentCount: number;
  balance: number;
  
  // Configuración de saldo
  unifiedBalance: boolean;  // Si true, todos los campus comparten balance
  
  // Status y contrato
  status: SchoolStatus;
  contractType: ContractType;
  trialDurationMonths?: TrialDuration;
  onboardingStatus: 'PENDING' | 'COMPLETED';
  
  // Finanzas
  stpCostCenter?: string;
  settlementCLABE?: string;
  platformFeePercent: number;
  
  // Dirección
  address?: SchoolAddress;
  
  // Contacto
  contact?: SchoolContact;
  
  // Branding
  branding?: SchoolBranding;
  
  // Modelo de negocio
  businessModel: BusinessModel;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface SchoolAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SchoolContact {
  email: string;
  phone: string;
  contactPerson: string;
  position?: string;
}

export interface SchoolBranding {
  primaryColor: string;    // #HEX
  secondaryColor: string;  // #HEX
  customDomain?: string;
}

export interface Campus {
  id: string;
  schoolId: string;
  
  name: string;
  stpCostCenter: string;
  
  address?: SchoolAddress;
  
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 8. BUSINESS MODEL
// ============================================

export interface BusinessModel {
  // Fees únicos
  setupFee: number;
  annualFee: number;
  
  // Fees recurrentes
  monthlyRentFee: number;
  parentAppFee: number;
  
  // SaaS per user
  saasPerStudent: number;
  saasPerStaff: number;
  chargeStaffUsage: boolean;
  
  // Fees de depósito
  cardDepositFeePercent: number;
  speiDepositFeeFixed: number;
  
  // Comisiones de cafetería
  cafeteriaFeePercent: number;
  cafeteriaFeeAutoMarkup: boolean;
  
  // Métodos permitidos en POS
  posMethods: {
    allowQrBarcode: boolean;
    allowMatricula: boolean;
    allowAnonymous: boolean;
  };
  
  // Márgenes
  margins: {
    concessionaireMargin: number;
    schoolMargin: number;
    mecardMargin: number;
  };
  
  // Liquidaciones
  settlement: {
    frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    method: 'BANK_TRANSFER' | 'CHECK';
  };
}

// ============================================
// 9. OPERATING UNITS
// ============================================

export interface OperatingUnit {
  id: string;
  schoolId: string;
  campusId?: string;
  
  name: string;
  type: 'CAFETERIA' | 'STATIONERY' | 'LIBRARY' | 'BOOKSTORE' | 'OTHER';
  ownerType: EntityOwner;
  
  // Manager
  managerId?: string;
  
  // Concesionario (si aplica)
  vendorName?: string;
  vendorCLABE?: string;
  commissionPercent?: number;
  
  // Status
  isActive: boolean;
  
  // Horarios
  openingHours?: {
    [key in DayOfWeek]?: {
      open: string;
      close: string;
    };
  };
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 10. PRODUCTS & INVENTORY
// ============================================

export interface Product {
  id: string;
  
  // Identificación
  sku?: string;
  name: string;
  description?: string;
  category: Category;
  
  // Pricing
  price: number;
  cost?: number;
  
  // Media
  image?: string;
  images?: string[];
  
  // Nutricional
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  nutritionFacts?: NutritionFacts;
  
  // Ownership
  ownerType: EntityOwner;
  unitId?: string;
  
  // Status
  isAvailable: boolean;
  isCombo?: boolean;
  isFeatured?: boolean;
  
  // Combo items (si isCombo = true)
  comboItems?: ComboItem[];
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface NutritionFacts {
  servingSize: string;
  calories: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrate?: number;
  dietaryFiber?: number;
  sugars?: number;
  protein?: number;
}

export interface ComboItem {
  productId: string;
  quantity: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  unitId: string;
  
  currentStock: number;
  minStock: number;
  maxStock?: number;
  
  unitCost: number;
  
  lastRestocked?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  productId: string;
  
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  
  reason?: string;
  notes?: string;
  
  createdBy: string;
  createdAt: string;
}

// ============================================
// 11. SALES & POS
// ============================================

export interface Sale {
  id: string;
  
  // Session
  sessionId?: string;
  
  // Cliente
  studentId?: string;
  studentName?: string;
  
  // Items
  items: SaleItem[];
  
  // Montos
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  
  // Pago
  paymentMethod: PaymentMethod;
  
  // Comisiones (calculadas automáticamente)
  schoolCommission?: number;
  vendorCommission?: number;
  platformFee?: number;
  
  // Ubicación
  unitId: string;
  unitName: string;
  
  // Operador
  createdBy: string;
  operatorName?: string;
  
  // Timestamps
  createdAt: string;
  
  // Offline sync
  isSynced: boolean;
  syncedAt?: string;
  deviceId?: string;
  
  // Metadata
  notes?: string;
  metadata?: Record<string, any>;
}

export interface SaleItem {
  id: string;
  saleId: string;
  
  productId: string;
  productName: string;
  productSku?: string;
  
  quantity: number;
  unitPrice: number;
  subtotal: number;
  
  // Snapshot del producto (por si cambia después)
  productSnapshot: {
    name: string;
    category: Category;
    image?: string;
  };
}

export interface POSSession {
  id: string;
  
  operatorId: string;
  operatorName: string;
  
  unitId: string;
  
  // Efectivo
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  discrepancy?: number;
  
  // Timestamps
  startedAt: string;
  endedAt?: string;
  
  // Estadísticas (calculadas)
  totalSales: number;
  totalTransactions: number;
  totalCash: number;
  totalDigital: number;
  
  // Ventas
  sales?: Sale[];
  
  // Notas
  notes?: string;
}

// ============================================
// 12. DEPOSITS & WALLET TRANSACTIONS
// ============================================

export interface Deposit {
  id: string;
  
  parentId: string;
  parentName: string;
  parentEmail: string;
  
  // Monto
  amount: number;
  platformFee: number;
  netAmount: number;
  
  // Método
  method: DepositMethod;
  status: DepositStatus;
  
  // Distribución a hijos
  allocations: DepositAllocation[];
  
  // Referencias de pago
  paymentReference?: string;    // ID Stripe/Conekta/etc
  receiptUrl?: string;
  oxxoReference?: string;
  
  // Confirmación
  confirmedBy?: string;
  confirmedAt?: string;
  
  // Timestamps
  createdAt: string;
  expiresAt?: string;  // Para OXXO
  
  // Metadata
  notes?: string;
  metadata?: Record<string, any>;
}

export interface DepositAllocation {
  studentId: string;
  studentName: string;
  amount: number;
  appliedAt?: string;
}

export interface WalletTransaction {
  id: string;
  
  studentId: string;
  studentName: string;
  
  // Tipo y monto
  type: TransactionType;
  amount: number;
  
  // Balance
  balanceBefore: number;
  balanceAfter: number;
  
  // Referencias
  referenceId?: string;     // Sale ID, Deposit ID, Gift ID
  referenceType?: 'sale' | 'deposit' | 'gift' | 'transfer' | 'adjustment';
  
  // Ubicación (si aplica)
  unitId?: string;
  unitName?: string;
  
  // Descripción
  description: string;
  category?: Category;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Audit
  createdBy?: string;
  createdAt: string;
}

// Alias para compatibilidad
export interface Transaction extends WalletTransaction {
  date: string;      // Alias de createdAt
  item: string;      // Alias de description
  location: string;  // Alias de unitName
  status: 'completed' | 'pending' | 'failed';
}

// ============================================
// 13. SETTLEMENTS & DISBURSEMENTS
// ============================================

export interface Settlement {
  id: string;
  
  schoolId: string;
  schoolName: string;
  
  // Periodo
  periodStart: string;
  periodEnd: string;
  
  // Montos
  grossRevenue: number;
  platformCommission: number;
  schoolShare: number;
  vendorShare: number;
  
  // Desembolsos
  disbursements: Disbursement[];
  
  // Status
  status: SettlementStatus;
  
  // Timestamps
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  
  // Metadata
  notes?: string;
}

export interface Disbursement {
  id: string;
  settlementId: string;
  
  recipientType: 'SCHOOL' | 'VENDOR';
  recipientName: string;
  recipientCLABE: string;
  
  amount: number;
  
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  // SPEI
  speiReference?: string;
  speiTrackingKey?: string;
  
  // Timestamps
  createdAt: string;
  processedAt?: string;
  
  // Error
  errorMessage?: string;
}

// ============================================
// 14. GIFTS & SOCIAL
// ============================================

export interface Gift {
  id: string;

  // Remitente
  senderId: string;
  senderName: string;
  senderStudentId: string;

  // Destinatario
  receiverId: string;
  receiverName: string;
  receiverStudentId: string;

  // Producto
  inventoryItemId: string;
  productName: string;
  productImage?: string;

  // Monto
  amount: number;

  // Código de canje
  redemptionCode: string;

  // Status
  status: GiftStatus;

  // Mensajes
  message?: string;
  thankYouMessage?: string;

  // Timestamps
  createdAt: string;
  expiresAt: string;

  // Redemption tracking (NEW)
  redeemableAt?: string;        // When gif can be redeemed (typically immediately)
  redeemedAt?: string;          // When gift was actually redeemed
  redeemingStudentId?: string;  // Which student redeemed it
  redeemingAt?: string;         // Timestamp of redemption
  locationId?: string;          // POS location where redeemed

  // Metadata
  metadata?: Record<string, any>;
}

export interface StudentFavorite {
  id: string;
  studentId: string;
  schoolId: string;
  productId: string;
  productName?: string;
  productImage?: string;

  isPublic: boolean;  // Others can see what you added to favorites

  createdAt: string;
  updatedAt?: string;
}

export interface Friend {
  id: string;
  
  fullName: string;
  studentId: string;
  grade?: string;
  
  balance: number;
  
  // Favoritos (productos)
  favorites: string[] | null;
  favoritesPublic: boolean;
  
  // Alergias
  allergies?: string[] | null;
  
  // Status
  status: UserStatus;
  
  // Escuela
  schoolId: string;
  campusId?: string;
}

// ============================================
// 15. NOTIFICATIONS & COMMUNICATION
// ============================================

export interface Notification {
  id: string;
  
  recipientId: string;
  recipientRole: UserRole;
  
  type: NotificationType;
  
  title: string;
  body: string;
  
  // Data adicional (para deep links, etc)
  data?: Record<string, any>;
  
  // Status
  readAt: string | null;
  
  createdAt: string;
  expiresAt?: string;
}

export interface SupportTicket {
  id: string;
  
  subject: string;
  description?: string;
  
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  
  // Creator
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  
  // Assigned to
  assignedTo?: string;
  
  // Messages
  messages: TicketMessage[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  
  // Metadata
  tags?: string[];
  attachments?: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  
  text: string;
  
  isAdmin: boolean;
  
  timestamp: string;
  
  attachments?: string[];
}

// ============================================
// 16. ANALYTICS & REPORTS
// ============================================

export interface DashboardMetrics {
  // Ventas
  totalSalesToday: number;
  totalSalesWeek: number;
  totalSalesMonth: number;
  
  // Transacciones
  transactionCountToday: number;
  transactionCountWeek: number;
  transactionCountMonth: number;
  
  // Ticket promedio
  avgTicketToday: number;
  avgTicketWeek: number;
  avgTicketMonth: number;
  
  // Estudiantes
  activeStudents: number;
  studentsWithBalance: number;
  totalBalanceInSystem: number;
  
  // Inventario
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  
  // Top performers
  topProducts: ProductSalesMetric[];
  topCategories: CategorySalesMetric[];
  topUnits: UnitSalesMetric[];
}

export interface ProductSalesMetric {
  productId: string;
  productName: string;
  category: Category;
  unitsSold: number;
  revenue: number;
  image?: string;
}

export interface CategorySalesMetric {
  category: Category;
  unitsSold: number;
  revenue: number;
  transactionCount: number;
}

export interface UnitSalesMetric {
  unitId: string;
  unitName: string;
  revenue: number;
  transactionCount: number;
}

export interface SalesData {
  name: string;
  revenue: number;
  orders: number;
}

export interface SalesReport {
  periodStart: string;
  periodEnd: string;
  
  totalRevenue: number;
  totalTransactions: number;
  avgTicket: number;
  
  byCategory: CategorySalesMetric[];
  byUnit: UnitSalesMetric[];
  byPaymentMethod: PaymentMethodMetric[];
  
  topProducts: ProductSalesMetric[];
  topStudents: StudentSpendingMetric[];
}

export interface PaymentMethodMetric {
  method: PaymentMethod;
  count: number;
  amount: number;
}

export interface StudentSpendingMetric {
  studentId: string;
  studentName: string;
  totalSpent: number;
  transactionCount: number;
  avgTicket: number;
}

// ============================================
// 17. APP VIEWS
// ============================================

export enum AppView {
  // Super Admin
  SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
  SUPER_ADMIN_SCHOOLS = 'SUPER_ADMIN_SCHOOLS',
  SUPER_ADMIN_SETTLEMENTS = 'SUPER_ADMIN_SETTLEMENTS',
  
  // School Admin
  SCHOOL_ADMIN_DASHBOARD = 'SCHOOL_ADMIN_DASHBOARD',
  SCHOOL_ADMIN_STAFF = 'SCHOOL_ADMIN_STAFF',
  SCHOOL_ADMIN_STUDENTS = 'SCHOOL_ADMIN_STUDENTS',
  SCHOOL_ADMIN_REPORTS = 'SCHOOL_ADMIN_REPORTS',
  SCHOOL_ONBOARDING = 'SCHOOL_ONBOARDING',
  BUSINESS_MODEL_CONFIG = 'BUSINESS_MODEL_CONFIG',
  
  // Unit Manager
  UNIT_MANAGER_DASHBOARD = 'UNIT_MANAGER_DASHBOARD',
  UNIT_MANAGER_STAFF = 'UNIT_MANAGER_STAFF',
  UNIT_MANAGER_INVENTORY = 'UNIT_MANAGER_INVENTORY',
  UNIT_MANAGER_REPORTS = 'UNIT_MANAGER_REPORTS',
  
  // POS
  POS_CAFETERIA = 'POS_CAFETERIA',
  POS_STATIONERY = 'POS_STATIONERY',
  POS_GIFT_REDEEM = 'POS_GIFT_REDEEM',
  
  // Cashier
  CASHIER_VIEW = 'CASHIER_VIEW',
  CASHIER_DEPOSITS = 'CASHIER_DEPOSITS',
  
  // Parent
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  PARENT_WALLET = 'PARENT_WALLET',
  PARENT_SETTINGS = 'PARENT_SETTINGS',
  PARENT_MENU = 'PARENT_MENU',
  PARENT_CHILDREN = 'PARENT_CHILDREN',
  PARENT_LIMITS = 'PARENT_LIMITS',
  PARENT_REPORTS = 'PARENT_REPORTS',
  PARENT_NOTIFICATIONS = 'PARENT_NOTIFICATIONS',
  
  // Student
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  STUDENT_ID = 'STUDENT_ID',
  STUDENT_HISTORY = 'STUDENT_HISTORY',
  STUDENT_MENU = 'STUDENT_MENU',
  STUDENT_FRIENDS = 'STUDENT_FRIENDS',
  STUDENT_GIFTS = 'STUDENT_GIFTS',
  
  // Help & Support
  HELP_DESK = 'HELP_DESK',
  SUPPORT_TICKETS = 'SUPPORT_TICKETS'
}

// ============================================
// 18. API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// 19. FORM & VALIDATION TYPES
// ============================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface StudentForm {
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  group?: string;
  parentId: string;
  dailyLimit?: number;
  photo?: File | string;
}

export interface ProductForm {
  name: string;
  category: Category;
  price: number;
  cost?: number;
  description?: string;
  image?: File | string;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
}

export interface DepositForm {
  amount: number;
  method: DepositMethod;
  allocations: {
    studentId: string;
    amount: number;
  }[];
}

// ============================================
// 20. UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Date range helper
export interface DateRange {
  start: string;
  end: string;
}

// Filter and sort
export interface ListFilters {
  search?: string;
  status?: string[];
  category?: Category[];
  dateRange?: DateRange;
  schoolId?: string;
  campusId?: string;
  unitId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  filters?: ListFilters;
  sort?: SortOptions;
}

// ============================================
// 21. CONSTANTS
// ============================================

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.WALLET]: 'Monedero Digital',
  [PaymentMethod.CREDENTIAL_QR]: 'Credencial QR',
  [PaymentMethod.CREDENTIAL_BARCODE]: 'Credencial Código de Barras',
  [PaymentMethod.CREDENTIAL_NFC]: 'Credencial NFC',
  [PaymentMethod.MATRICULA]: 'Matrícula Manual',
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.ANONYMOUS]: 'Venta Anónima'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.HOT_MEALS]: 'Comidas Calientes',
  [Category.COMBO_MEALS]: 'Comidas Completas',
  [Category.SNACKS]: 'Snacks',
  [Category.DRINKS]: 'Bebidas',
  [Category.SUPPLIES]: 'Útiles Escolares',
  [Category.UNIFORMS]: 'Uniformes',
  [Category.BOOKS]: 'Libros',
  [Category.TECH]: 'Tecnología'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrador',
  [UserRole.SCHOOL_ADMIN]: 'Administrador Escuela',
  [UserRole.SCHOOL_FINANCE]: 'Finanzas Escuela',
  [UserRole.UNIT_MANAGER]: 'Gerente de Unidad',
  [UserRole.CAFETERIA_STAFF]: 'Personal Cafetería',
  [UserRole.STATIONERY_STAFF]: 'Personal Papelería',
  [UserRole.CASHIER]: 'Cajero',
  [UserRole.POS_OPERATOR]: 'Operador POS',
  [UserRole.PARENT]: 'Padre/Tutor',
  [UserRole.STUDENT]: 'Estudiante'
};

// ============================================
// 21. MECARD REWARDS SYSTEM
// ============================================

export enum RewardsTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum PointsTransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  EXPIRE = 'EXPIRE',
  ADJUST = 'ADJUST'
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum MarketplaceCategory {
  TECH = 'TECH',
  SCHOOL_SUPPLIES = 'SCHOOL_SUPPLIES',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  GIFT_CARDS = 'GIFT_CARDS',
  EXPERIENCES = 'EXPERIENCES'
}

export interface StudentRewardsPoints {
  studentId: string;
  schoolId: string;
  totalPoints: number;
  earnedThisCycle: number;
  redeemedThisCycle: number;
  tier: RewardsTier;
  lastUpdated: string;
}

export interface SchoolRewardsConfig {
  id: string;
  schoolId: string;
  schoolName?: string;
  
  // Configuration
  markupPercentage: number;        // 5-15% sobre precio base
  pointsPerPeso: number;            // Default: 10 puntos por peso
  enabled: boolean;
  
  // Ciclo escolar
  cycleStartDate: string;
  cycleEndDate: string;
  
  // Tier thresholds
  tierThresholds: {
    silver: number;                 // Default: 1000
    gold: number;                   // Default: 3000
    platinum: number;               // Default: 7000
  };
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  pointsCost: number;
  stockQuantity: number;
  currentStock: number;
  imageUrl?: string;
  featured: boolean;
  available: boolean;
  schoolId?: string;                // null = available para todas las escuelas
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  studentId: string;
  schoolId: string;
  type: PointsTransactionType;
  pointsAmount: number;
  referenceId?: string;             // sale_id o redemption_id
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StudentRedemption {
  id: string;
  studentId: string;
  schoolId: string;
  product: MarketplaceProduct;
  pointsSpent: number;
  status: RedemptionStatus;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POSTransactionWithRewards {
  id: string;
  studentId: string;
  amount: number;                   // Precio con markup
  baseAmount: number;               // Precio sin markup
  markupAmount: number;             // Markup que genera puntos
  pointsEarned: number;
  description: string;
  createdAt: string;
}

// ============================================
// 23. BILLING TYPES
// ============================================

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum RevenueCategoryType {
  DEPOSIT_FEE = 'DEPOSIT_FEE',
  CARD_EMISSION = 'CARD_EMISSION',
  MONTHLY_RENT = 'MONTHLY_RENT',
  POS_COMMISSION = 'POS_COMMISSION',
  SETUP_FEE = 'SETUP_FEE',
  CONCESSIONAIRE_FEE = 'CONCESSIONAIRE_FEE'
}

export enum BlockingReason {
  OVERDUE_INVOICE = 'OVERDUE_INVOICE',
  MANUAL_SUSPENSION = 'MANUAL_SUSPENSION',
  POLICY_VIOLATION = 'POLICY_VIOLATION'
}

export interface BillingLineItem {
  description: string;
  quantity?: number;
  unitPrice: number;
  amount: number;
  category?: string;  // INFRASTRUCTURE | COMMISSION | SERVICES | CARD | OTHER
}

export interface SchoolBillingConfig {
  id: string;
  schoolId: string;

  // Setup & One-time Fees
  setupFee: number;
  setupFeePaidBy: 'SCHOOL' | 'CONCESSIONAIRE';

  // Monthly/Annual Infrastructure
  monthlyRent: number;
  annualLicense: number;

  // Credential/Card Costs
  yearlyCardCost: number;
  cardDesignFee: number;

  // Deposit Fees (Parents)
  depositFeeCard: number;        // 0.035 = 3.5%
  depositFeeSPEI: number;        // 8.00 = $8
  depositFeeCash: number;        // 0.00 = FREE

  // POS Commissions
  posMarkupPercentage: number;       // 0.03 = 3%
  posCommissionPercentage: number;   // 0.03 = 3%

  // Concessionaire Fees
  concessMonthlySystemFee: number;
  concessTechSupportFee: number;
  concessCardProcessingFee: number;

  // Early Withdrawal Fee
  earlyWithdrawalFeePercentage: number;  // 0.02 = 2%

  // Security Limits
  maxDepositPerTx: number;       // $50,000
  studentDailyLimit: number;     // $500
  studentWeeklyLimit: number;    // $2,000

  // Payment Terms & Suspension
  invoiceDueDate: number;        // 10 days
  overdueDaysBeforeSuspension: number;  // 30 days

  billingCycle: 'MONTHLY' | 'WEEKLY';

  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  schoolId: string;
  invoiceNumber: string;        // INV-2026-02-00001

  issueDate: string;            // DATE
  dueDate: string;              // DATE

  subtotal: number;
  taxes: number;
  total: number;

  status: InvoiceStatus;
  paymentMethod?: string;       // SPEI | BANK_TRANSFER
  paidAt?: string;

  lineItems: BillingLineItem[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SchoolBlockingRule {
  id: string;
  schoolId: string;
  blockedReason: BlockingReason;
  blockedAt: string;
  blockedUntilPayment: boolean;
  overdueDays: number;

  // Escalation
  notificationSent: boolean;
  legalEscalationEligible: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface RevenueTrackingRecord {
  id: string;
  schoolId: string;
  period: string;           // YYYY-MM-01

  revenueCategory: RevenueCategoryType;
  amount: number;
  transactionCount: number;

  createdAt: string;
}

export interface DepositWithFeeCalculation {
  amountRequested: number;
  depositMethod: DepositMethod;

  // Automatic calculation from SchoolBillingConfig
  feePercentage?: number;    // 0.035 for card
  feeFlatAmount?: number;    // 8.00 for SPEI
  totalFee: number;
  netAmount: number;

  description: string;       // "3.5% Platform Fee" or "$8 SPEI Fee"
}

// ============================================
// 25. EXIT PERMISSIONS SYSTEM
// ============================================

export type PermissionTransportType = 'bus_alterno' | 'auto_particular' | 'a_pie' | 'no_asiste' | 'otro';
export type PermissionStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado' | 'expirado';

export interface AuthorizedContact {
  id: string;
  familyId: string;           // Compartido entre ambos padres
  nombre: string;
  parentesco: string;         // "Abuela", "Tío", "Nana", etc.
  telefono: string;
  email?: string;
  identificacion: string;     // Número de INE/ID
  foto?: string;
  isDefault: boolean;
  createdBy: string;          // parentId que lo creó
  createdAt: string;
}

export interface PermissionApproval {
  parentId: string;
  parentName: string;
  status: 'aprobado' | 'rechazado' | 'pendiente';
  timestamp: string;
  deviceInfo?: string;
}

export interface ExitPermission {
  id: string;
  schoolId: string;
  
  // Alumno
  childId: string;
  childName: string;
  childGrade: string;
  childGroup: string;
  childPhoto?: string;
  
  // Transporte
  busOriginal: string;        // Ruta/camión donde normalmente se va
  busDestino?: string;        // Ruta/camión donde se subirá (si aplica)
  transporte: PermissionTransportType;
  transporteDetalle?: string;
  
  // Solicitud
  fecha: string;
  horaSalida: string;
  motivo: string;
  
  // Persona autorizada (referencia a contacto guardado o inline)
  authorizedContactId?: string;
  personaAutorizada?: {
    nombre: string;
    parentesco: string;
    telefono: string;
    email?: string;
    identificacion: string;
  };
  
  // Multi-padre: aprobaciones
  createdBy: string;          // parentId que creó el permiso
  createdByName: string;
  approvals: PermissionApproval[];
  
  // Escuela
  status: PermissionStatus;
  schoolApproval?: {
    status: 'aprobado' | 'rechazado' | 'pendiente';
    reviewedBy?: string;
    reviewedByName?: string;
    reviewedAt?: string;
    notes?: string;
  };
  
  // Notificaciones enviadas
  notificationsSent: {
    school: boolean;
    coparent: boolean;
    receivingFamily: boolean;
    externalPerson: boolean;
  };
  
  creadoEn: string;
  actualizadoEn: string;
}

export interface SchoolPermissionConfig {
  id: string;
  schoolId: string;
  
  horasAnticipacion: number;           // Default: 6
  requiereDosAprobaciones: boolean;    // Default: false (uno basta)
  horaLimiteSolicitud: string;         // Default: "14:00"
  diasPermitidos: string[];            // Default: ['LUN','MAR','MIE','JUE','VIE']
  requiereIdentificacion: boolean;     // Default: true
  permitirNoAsiste: boolean;           // Default: true
  maxPermisosPorSemana: number;        // Default: 0 (sin límite)
  notificarDireccion: boolean;         // Default: true
  requiereMotivo: boolean;             // Default: true
  mensajePersonalizado: string;        // Default: ""
  bloqueoEnExamenes: boolean;          // Default: false
  fechasExamen: string[];              // Fechas bloqueadas
  rutasCamion: string[];               // Lista de rutas para referencia
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 26. TRIPS & EXCURSIONS SYSTEM
// ============================================

export type TripStatus = 'borrador' | 'abierto' | 'cerrado' | 'completado' | 'cancelado';
export type EnrollmentStatus = 'inscrito' | 'pagado_parcial' | 'pagado' | 'cancelado' | 'lista_espera';
export type TripPaymentStatus = 'pendiente' | 'confirmado' | 'rechazado';

export interface SchoolTrip {
  id: string;
  schoolId: string;
  
  nombre: string;
  destino: string;
  descripcion: string;
  
  fechaSalida: string;
  fechaRegreso: string;
  
  costoTotal: number;
  costoPorAlumno: number;
  
  cupoMaximo: number;
  cupoDisponible: number;
  
  gradosPermitidos: string[];       // ["3° Primaria", "4° Primaria"]
  
  status: TripStatus;
  
  fechaLimitePago: string;
  fechaLimiteInscripcion: string;
  
  permiteParcialidades: boolean;
  numeroParcialidades: number;      // Default: 1 (pago único)
  
  requiereDocumentos: boolean;
  documentosRequeridos: string[];   // ["Carta responsiva", "Copia INE padre"]
  
  itinerario?: string;
  contactoEmergencia: string;
  notas?: string;
  
  imageEmoji?: string;              // Para UI: 🏕️, 🏛️, etc.
  
  creadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface TripEnrollment {
  id: string;
  tripId: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  parentId: string;
  parentName: string;
  
  status: EnrollmentStatus;
  
  totalPagado: number;
  saldoPendiente: number;
  
  documentosEntregados: string[];
  
  approvedByParent: boolean;
  approvalDate?: string;
  
  inscritoEn: string;
  actualizadoEn: string;
}

export interface TripPayment {
  id: string;
  enrollmentId: string;
  tripId: string;
  studentId: string;
  studentName: string;
  
  monto: number;
  parcialidad: number;             // 1, 2, 3...
  totalParcialidades: number;
  
  metodoPago: string;              // "SPEI", "Tarjeta", "Efectivo"
  comprobante?: string;
  
  status: TripPaymentStatus;
  
  fechaPago: string;
  fechaLimite: string;
  
  registradoPor?: string;
  createdAt: string;
}

export interface TripReminder {
  id: string;
  tripId: string;
  tripName: string;
  
  tipo: 'pago' | 'documento' | 'general' | 'inscripcion';
  mensaje: string;
  
  destinatarios: string[];         // parentIds
  
  fechaEnvio: string;
  enviado: boolean;
  
  createdAt: string;
}

// ============================================
// 27. MULTI-PARENT & ACTIVITY LOG
// ============================================

export interface ParentStudentLink {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  
  role: 'parent';                  // Futuro: 'titular' | 'asociado'
  
  linkedAt: string;
  linkedBy: string;                // parentId que creó el vínculo
  invitationCode?: string;
  status: 'active' | 'pending' | 'revoked';
}

export type ActivityAction = 
  | 'deposit' 
  | 'limit_change' 
  | 'restriction_change'
  | 'permission_create' 
  | 'permission_cancel'
  | 'permission_approve'
  | 'trip_enroll'
  | 'trip_payment'
  | 'contact_add'
  | 'contact_remove'
  | 'coparent_invite'
  | 'coparent_link'
  | 'login';

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  
  action: ActivityAction;
  entityType: 'student' | 'permission' | 'trip' | 'wallet' | 'contact' | 'parent' | 'session';
  entityId: string;
  
  details: string;                 // Descripción legible: "Depositó $500 a Santiago"
  metadata?: Record<string, any>;
  
  deviceInfo?: string;             // "iPhone 14 / Safari" 
  ipAddress?: string;
  
  timestamp: string;
}

// ============================================
// 28. TYPE GUARDS
// ============================================

export function isStudent(user: User | StudentProfile): user is StudentProfile {
  return 'studentId' in user;
}

export function isParent(user: User | ParentProfile): user is ParentProfile {
  return 'children' in user;
}

export function isSale(transaction: WalletTransaction | Sale): transaction is Sale {
  return 'items' in transaction;
}

export function isDeposit(transaction: WalletTransaction | Deposit): transaction is Deposit {
  return 'method' in transaction && 'allocations' in transaction;
}

// ============================================
// 29. STUDENT NOTIFICATIONS
// ============================================

export type StudentNotificationType =
  | 'purchase'
  | 'deposit'
  | 'low_balance'
  | 'gift_received'
  | 'gift_sent'
  | 'limit_changed'
  | 'trip_reminder'
  | 'reward_earned'
  | 'restriction_added'
  | 'permission_created';

export interface StudentNotification {
  id: string;
  type: StudentNotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  relatedEntityId?: string;
  icon?: string;
}
