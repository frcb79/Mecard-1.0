
import { Product, Category, SalesData, StudentProfile, Transaction, EntityOwner, School, OperatingUnit, SupportTicket } from './types';

// Add missing clabePersonal property
export const MOCK_STUDENT: StudentProfile = {
  id: '2024001',
  name: 'Santiago Gonzalez',
  grade: '4° Primaria - B',
  photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
  schoolId: 'mx_01',
  balance: 150.50,
  dailyLimit: 200.00,
  spentToday: 45.00,
  restrictedCategories: [Category.DRINKS],
  restrictedProducts: ['1'], // Bloqueamos el Wrap de Pollo por defecto
  allergies: ['Peanuts'],
  parentName: 'Maria Gonzalez',
  status: 'Active',
  enrollmentDate: '2023-08-15',
  clabePersonal: '646180000012300015'
};

// Add missing clabePersonal property
export const MOCK_STUDENTS_LIST: StudentProfile[] = [
  MOCK_STUDENT,
  { 
    id: '2024002', name: 'Ana García', grade: '10° A', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', schoolId: 'mx_01', 
    balance: 250.00, dailyLimit: 100, spentToday: 0, restrictedCategories: [], restrictedProducts: [], allergies: [], 
    parentName: 'Roberto Garcia', status: 'Active', enrollmentDate: '2023-08-15',
    clabePersonal: '646180000012300028'
  },
];

export const MOCK_SCHOOLS: School[] = [
  { 
    id: 'mx_01', 
    name: 'Colegio Cumbres México', 
    logo: '🏔️', 
    studentCount: 1200, 
    balance: 450000.00, 
    stpCostCenter: '123',
    platformFeePercent: 4.5,
    onboardingStatus: 'COMPLETED',
    status: 'ACTIVE',
    contractType: 'STANDARD',
    createdAt: '2023-01-01T00:00:00Z',
    branding: { primary: '#4f46e5', secondary: '#818cf8' },
    businessModel: {
      setupFee: 25000,
      annualFee: 15000,
      monthlyRentFee: 5000,
      parentAppFee: 25,
      saasPerStudent: 45,
      saasPerStaff: 25,
      chargeStaffUsage: false,
      cardDepositFeePercent: 3.5,
      speiDepositFeeFixed: 8.0,
      cafeteriaFeePercent: 5.0,
      cafeteriaFeeAutoMarkup: true,
      posMethods: {
        allowQrBarcode: true,
        allowMatricula: true,
        allowAnonymous: false
      },
      margins: {
        concessionaireMargin: 85,
        schoolMargin: 10,
        mecardMargin: 5
      },
      settlement: {
        frequency: 'WEEKLY',
        method: 'BANK_TRANSFER'
      }
    }
  },
  { 
    id: 'mx_02', 
    name: 'Instituto Americano', 
    logo: '🎓', 
    studentCount: 850, 
    balance: 230000.00, 
    stpCostCenter: '456',
    platformFeePercent: 4.5,
    onboardingStatus: 'COMPLETED',
    status: 'ACTIVE',
    contractType: 'STANDARD',
    createdAt: '2023-01-01T00:00:00Z',
    branding: { primary: '#0f172a', secondary: '#334155' },
    businessModel: {
      setupFee: 18000,
      annualFee: 10000,
      monthlyRentFee: 3500,
      parentAppFee: 20,
      saasPerStudent: 40,
      saasPerStaff: 20,
      chargeStaffUsage: false,
      cardDepositFeePercent: 3.2,
      speiDepositFeeFixed: 7.0,
      cafeteriaFeePercent: 4.5,
      cafeteriaFeeAutoMarkup: false,
      posMethods: {
        allowQrBarcode: true,
        allowMatricula: true,
        allowAnonymous: false
      },
      margins: {
        concessionaireMargin: 85,
        schoolMargin: 10,
        mecardMargin: 5
      },
      settlement: {
        frequency: 'WEEKLY',
        method: 'BANK_TRANSFER'
      }
    }
  }
];

export const MOCK_UNITS: OperatingUnit[] = [
  { id: 'unit_01', schoolId: 'mx_01', name: 'Cafetería Central', type: 'CAFETERIA', ownerType: EntityOwner.CONCESSIONAIRE, managerId: 'mgr_01' },
  { id: 'unit_02', schoolId: 'mx_01', name: 'Papelería Secundaria', type: 'STATIONERY', ownerType: EntityOwner.SCHOOL },
  { id: 'unit_03', schoolId: 'mx_02', name: 'Comedor Principal', type: 'CAFETERIA', ownerType: EntityOwner.CONCESSIONAIRE }
];

export const PRODUCTS: Product[] = [
  {
    id: 'c1', name: 'Menú del Día', category: Category.COMBO_MEALS, price: 85.00,
    image: 'https://images.unsplash.com/photo-1547496502-ffa222f79634?w=500',
    calories: 750, ingredients: ['Sopa', 'Pollo', 'Arroz', 'Agua'], isCombo: true, isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: '1', name: 'Wrap de Pollo', category: Category.HOT_MEALS, price: 45.00,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500',
    calories: 450, ingredients: ['Tortilla', 'Pollo', 'Lechuga'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 's1', name: 'Cuaderno Profesional', category: Category.SUPPLIES, price: 45.00,
    image: 'https://images.unsplash.com/photo-1531346878377-a513bc95ba0d?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  }
];

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'T-1001',
    subject: 'Problema con CLABE STP',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2024-10-24T10:00:00Z',
    creatorId: 'mx_01_admin',
    messages: [
      { id: 'm1', senderId: 'mx_01_admin', senderName: 'Director Cumbres', text: 'No se están reflejando las recargas de hoy.', timestamp: '2024-10-24T10:00:00Z', isAdmin: false }
    ]
  }
];

export const SALES_DATA: SalesData[] = [
  { name: 'Lun', revenue: 12000, orders: 150 },
  { name: 'Mar', revenue: 14500, orders: 180 },
  { name: 'Mie', revenue: 11000, orders: 130 },
  { name: 'Jue', revenue: 16000, orders: 200 },
  { name: 'Vie', revenue: 19000, orders: 240 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: 'Oct 24, 10:30 AM', item: 'Wrap de Pollo', location: 'Cafetería Central', amount: -45.00, type: 'purchase', category: 'Alimentos', studentId: '2024001' },
  { id: 't2', date: 'Oct 23, 08:00 AM', item: 'Abono SPEI', location: 'Portal Online', amount: 200.00, type: 'deposit', studentId: '2024001' },
];
