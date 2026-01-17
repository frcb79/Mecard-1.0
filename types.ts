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
  RESTRICTED_PURCHASE = 'RESTRICTED_PURCHASE'
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
  parentName: string;
  parentEmail?: string;
  
  // Metadata
  photo?: string;
  enrollmentDate: string;
  status: UserStatus;
  
  // Finanzas
  clabePersonal?: string;  // Para devoluciones
  
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
  redeemedAt?: string;
  
  // Metadata
  metadata?: Record<string, any>;
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
// 22. TYPE GUARDS
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
