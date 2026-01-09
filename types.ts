
export enum Category {
  HOT_MEALS = 'Hot Meals',
  COMBO_MEALS = 'Comidas Completas',
  SNACKS = 'Snacks',
  DRINKS = 'Drinks',
  SUPPLIES = 'School Supplies',
  UNIFORMS = 'Uniforms',
  BOOKS = 'Books & Rentals',
  TECH = 'Tech Accessories'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SCHOOL_FINANCE = 'SCHOOL_FINANCE',
  UNIT_MANAGER = 'UNIT_MANAGER',
  CAFETERIA_STAFF = 'CAFETERIA_STAFF',
  STATIONERY_STAFF = 'STATIONERY_STAFF',
  CASHIER = 'CASHIER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  POS_OPERATOR = 'POS_OPERATOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
}

export interface Friend {
  id: string;
  full_name: string;
  student_id: string;
  balance: number;
  favorites: string[] | null;
  favorites_public: boolean;
  status: string;
  grade?: string;
  allergies?: string[] | null;
}

export interface Gift {
  id: string;
  sender_id: string;
  receiver_id: string;
  inventory_item_id: string;
  redemption_code: string;
  amount: number;
  status: 'pending' | 'redeemed' | 'expired' | 'cancelled';
  message?: string;
  created_at: string;
  expires_at: string;
  redeemed_at?: string;
  item?: {
    name: string;
    price: number;
    image_url?: string;
  };
  sender?: {
    full_name: string;
    student_id: string;
  };
  receiver?: {
    full_name: string;
    student_id: string;
  };
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum EntityOwner {
  SCHOOL = 'SCHOOL',
  CONCESSIONAIRE = 'CONCESSIONAIRE'
}

export enum MovementType {
  SALE = 'SALE',
  RESTOCK = 'RESTOCK',
  ADJUSTMENT = 'ADJUSTMENT',
  WASTE = 'WASTE'
}

export interface InventoryItem {
  productId: string;
  unitId: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  lastRestocked?: string;
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  type: MovementType;
  quantity: number;
  stockAfter: number;
  createdAt: string;
  reason?: string;
}

export enum NotificationType {
  PURCHASE_ALERT = 'PURCHASE_ALERT',
  LOW_BALANCE = 'LOW_BALANCE',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
  DEPOSIT_CONFIRMED = 'DEPOSIT_CONFIRMED',
  SETTLEMENT_READY = 'SETTLEMENT_READY'
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Disbursement {
  id: string;
  recipientType: 'SCHOOL' | 'VENDOR';
  recipientName: string;
  amount: number;
  clabe: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  speiReference?: string;
}

export interface Settlement {
  id: string;
  schoolId: string;
  periodStart: string;
  periodEnd: string;
  grossRevenue: number;
  platformCommission: number;
  schoolShare: number;
  vendorShare: number;
  status: SettlementStatus | string;
  disbursements: Disbursement[] | any[];
  createdAt: string;
}

export interface OperatingUnit {
  id: string;
  schoolId: string;
  name: string;
  type: 'CAFETERIA' | 'STATIONERY' | 'LIBRARY' | 'OTHER';
  ownerType: EntityOwner;
  managerId?: string;
  vendorName?: string;
  vendorCLABE?: string;
  commissionPercent?: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  calories?: number;
  ingredients?: string[];
  isCombo?: boolean;
  isAvailable: boolean;
  ownerType: EntityOwner;
  unitId?: string;
  sku?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface School {
  id: string;
  name: string;
  logo: string;
  studentCount: number;
  balance: number;
  stpCostCenter?: string;
  settlementCLABE?: string;
  platformFeePercent: number;
  onboardingStatus: 'PENDING' | 'COMPLETED';
  rfc?: string;
  legalName?: string;
  branding?: {
    primary: string;
    secondary: string;
  };
  businessModel: {
    setupFee: number;
    annualFee: number;
    monthlyRentFee: number;
    parentAppFee: number;
    cardDepositFeePercent: number;
    speiDepositFeeFixed: number;
    cafeteriaFeePercent: number;
    cafeteriaFeeAutoMarkup: boolean;
    // Dynamic POS configuration
    posMarkupPercent: number;
    posOperatorIncentivePercent: number;
    pointsExchangeRate: number;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  isLocked: boolean;
  releaseDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface FinancialProfile {
  studentId: string;
  schoolId: string;
  wallet: {
    availableBalance: number;
    lockedBalance: number;
    points: number;
  };
  savingsGoals: SavingsGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  parentId: string;
  type: 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_ACCOUNT';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Deposit {
  id: string;
  parentId: string;
  amount: number;
  paymentMethodId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  depositDate: string;
  completedDate?: string;
  speiReference?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpendingLimit {
  id: string;
  parentId: string;
  studentId: string;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  restrictedCategories: Category[];
  restrictedProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  schoolId: string;
  children: string[]; // Array of student IDs
  totalWalletBalance: number;
  paymentMethods: PaymentMethod[];
  spendingLimits: SpendingLimit[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  photo: string;
  schoolId: string;
  balance: number;
  dailyLimit: number;
  spentToday: number;
  restrictedCategories: Category[];
  restrictedProducts: string[]; 
  allergies: string[];
  parentName: string;
  status: 'Active' | 'Pending' | 'Inactive';
  enrollmentDate: string;
  clabePersonal: string;
  curp?: string;
}

export interface Transaction {
  id: string;
  date: string;
  item: string;
  location: string;
  amount: number;
  type: 'purchase' | 'deposit';
  category?: string;
  studentId?: string;
  unitId?: string;
}

export interface SalesData {
  name: string;
  revenue: number;
  orders: number;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  creatorId: string;
  messages: TicketMessage[];
}

export interface AlertConfig {
  id: string;
  parentId: string;
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  largePurchaseAlert: boolean;
  largePurchaseThreshold: number;
  deniedPurchaseAlert: boolean;
  alertChannels: ('EMAIL' | 'SMS' | 'IN_APP')[];
  createdAt: string;
  updatedAt: string;
}

export interface AlertLog {
  id: string;
  parentId: string;
  studentId: string;
  type: 'LOW_BALANCE' | 'LARGE_PURCHASE' | 'DENIED_PURCHASE';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export enum AppView {
  SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
  SCHOOL_ADMIN_DASHBOARD = 'SCHOOL_ADMIN_DASHBOARD',
  SCHOOL_ADMIN_STAFF = 'SCHOOL_ADMIN_STAFF',
  SCHOOL_ONBOARDING = 'SCHOOL_ONBOARDING',
  UNIT_MANAGER_DASHBOARD = 'UNIT_MANAGER_DASHBOARD',
  UNIT_MANAGER_STAFF = 'UNIT_MANAGER_STAFF',
  POS_CAFETERIA = 'POS_CAFETERIA',
  POS_STATIONERY = 'POS_STATIONERY',
  CASHIER_VIEW = 'CASHIER_VIEW',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  PARENT_WALLET = 'PARENT_WALLET',
  PARENT_ALERTS = 'PARENT_ALERTS',
  PARENT_MONITORING = 'PARENT_MONITORING',
  PARENT_SETTINGS = 'PARENT_SETTINGS',
  PARENT_MENU = 'PARENT_MENU',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  STUDENT_ID = 'STUDENT_ID',
  STUDENT_HISTORY = 'STUDENT_HISTORY',
  STUDENT_MENU = 'STUDENT_MENU',
  CONCESSIONAIRE_SALES = 'CONCESSIONAIRE_SALES',
  HELP_DESK = 'HELP_DESK',
  POS_GIFT_REDEEM = 'POS_GIFT_REDEEM'
}
