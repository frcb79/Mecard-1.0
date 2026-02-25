
import { Product, Category, SalesData, StudentProfile, Transaction, EntityOwner, School, OperatingUnit, SupportTicket, AuthorizedContact, ExitPermission, SchoolPermissionConfig, SchoolTrip, TripEnrollment, TripPayment, TripReminder, ActivityLogEntry, Gift, GiftStatus, StudentNotification, Friend, PreOrder, PreOrderStatus, SchoolFee, SchoolFeeType, FeeRecurrence, ParentPayment, ParentPaymentStatus, SchoolAnnouncement, AnnouncementPriority, AccessPoint, AccessPointType, AccessDirection, ScanMethod, AccessPointStatus, AccessEvent, AttendanceRecord, AttendanceStatus, WebhookConfig, WebhookEventType, AccessApiKey } from './types';

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
  parentId: 'parent_01',
  busRoute: 'Ruta 3 - Satélite',
  status: 'Active',
  enrollmentDate: '2023-08-15',
  clabePersonal: '646180000012300015'
};

// Add missing clabePersonal property
export const MOCK_STUDENTS_LIST: StudentProfile[] = [
  MOCK_STUDENT,
  { 
    id: '2024002', name: 'Ana García', grade: '2° Primaria - A', group: 'A', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', schoolId: 'mx_01', 
    balance: 250.00, dailyLimit: 100, spentToday: 0, restrictedCategories: [], restrictedProducts: [], allergies: [], 
    parentName: 'Roberto Garcia', parentId: 'parent_02', busRoute: 'Ruta 1 - Lomas', status: 'Active', enrollmentDate: '2023-08-15',
    clabePersonal: '646180000012300028'
  },
  {
    id: '2024003', name: 'Diego Martínez', grade: '5° Primaria - C', group: 'C', photo: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=200', schoolId: 'mx_01',
    balance: 180.00, dailyLimit: 150, spentToday: 30, restrictedCategories: [Category.SNACKS], restrictedProducts: [], allergies: ['Gluten'],
    parentName: 'Laura Martínez', parentId: 'parent_03', busRoute: 'Ruta 2 - Del Valle', status: 'Active', enrollmentDate: '2022-08-20',
    clabePersonal: '646180000012300035'
  },
  {
    id: '2024004', name: 'Valentina López', grade: '3° Primaria - A', group: 'A', photo: 'https://images.unsplash.com/photo-1595454223600-91e5312e3186?w=200', schoolId: 'mx_01',
    balance: 320.00, dailyLimit: 120, spentToday: 0, restrictedCategories: [], restrictedProducts: [], allergies: [],
    parentName: 'Carlos López', parentId: 'parent_04', busRoute: 'Ruta 4 - Polanco', status: 'Active', enrollmentDate: '2024-01-10',
    clabePersonal: '646180000012300042'
  },
  {
    id: '2024005', name: 'Mateo Hernández', grade: '6° Primaria - B', group: 'B', photo: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?w=200', schoolId: 'mx_01',
    balance: 75.50, dailyLimit: 200, spentToday: 85, restrictedCategories: [], restrictedProducts: [], allergies: ['Dairy'],
    parentName: 'Patricia Hernández', parentId: 'parent_05', busRoute: 'Ruta 5 - Interlomas', status: 'Active', enrollmentDate: '2021-08-15',
    clabePersonal: '646180000012300059'
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
  // ── COMBO_MEALS (Cafetería) ──
  {
    id: 'c1', name: 'Menú del Día', category: Category.COMBO_MEALS, price: 85.00,
    image: 'https://images.unsplash.com/photo-1547496502-ffa222f79634?w=500',
    calories: 750, ingredients: ['Sopa', 'Pollo', 'Arroz', 'Agua'], isCombo: true, isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 'c2', name: 'Combo Hamburguesa', category: Category.COMBO_MEALS, price: 75.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    calories: 680, ingredients: ['Pan', 'Carne', 'Lechuga', 'Queso', 'Papas', 'Refresco'], isCombo: true, isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  // ── HOT_MEALS (Cafetería) ──
  {
    id: '1', name: 'Wrap de Pollo', category: Category.HOT_MEALS, price: 45.00,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500',
    calories: 450, ingredients: ['Tortilla', 'Pollo', 'Lechuga'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: '2', name: 'Quesadillas (3 pzas)', category: Category.HOT_MEALS, price: 40.00,
    image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500',
    calories: 520, ingredients: ['Tortilla de maíz', 'Queso Oaxaca', 'Salsa'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: '3', name: 'Hot Dog Jumbo', category: Category.HOT_MEALS, price: 35.00,
    image: 'https://images.unsplash.com/photo-1612392062126-3e5f3e2e2e0e?w=500',
    calories: 380, ingredients: ['Pan', 'Salchicha', 'Catsup', 'Mostaza'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: '4', name: 'Sincronizada de Jamón', category: Category.HOT_MEALS, price: 38.00,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
    calories: 410, ingredients: ['Tortilla de harina', 'Jamón', 'Queso'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  // ── SNACKS (Cafetería) ──
  {
    id: 'k1', name: 'Barra de Granola', category: Category.SNACKS, price: 18.00,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
    calories: 140, ingredients: ['Avena', 'Miel', 'Nueces'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 'k2', name: 'Fruta Picada', category: Category.SNACKS, price: 25.00,
    image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500',
    calories: 90, ingredients: ['Mango', 'Piña', 'Pepino', 'Chile'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 'k3', name: 'Galletas Integrales', category: Category.SNACKS, price: 15.00,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
    calories: 160, ingredients: ['Harina integral', 'Avena', 'Miel'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  // ── DRINKS (Cafetería) ──
  {
    id: 'd1', name: 'Agua Natural 600ml', category: Category.DRINKS, price: 12.00,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
    calories: 0, isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 'd2', name: 'Jugo de Naranja', category: Category.DRINKS, price: 22.00,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
    calories: 110, ingredients: ['Naranja natural'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  {
    id: 'd3', name: 'Smoothie de Fresa', category: Category.DRINKS, price: 35.00,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500',
    calories: 180, ingredients: ['Fresa', 'Yogurt', 'Miel'], isAvailable: true, ownerType: EntityOwner.CONCESSIONAIRE, unitId: 'unit_01'
  },
  // ── SUPPLIES (Papelería) ──
  {
    id: 's1', name: 'Cuaderno Profesional', category: Category.SUPPLIES, price: 45.00,
    image: 'https://images.unsplash.com/photo-1531346878377-a513bc95ba0d?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
  {
    id: 's2', name: 'Lápices de Colores (12)', category: Category.SUPPLIES, price: 65.00,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
  {
    id: 's3', name: 'Plumas (Paq. 4)', category: Category.SUPPLIES, price: 28.00,
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
  {
    id: 's4', name: 'Calculadora Científica', category: Category.SUPPLIES, price: 180.00,
    image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
  // ── UNIFORMS (Papelería) ──
  {
    id: 'u1', name: 'Playera Polo Escolar', category: Category.UNIFORMS, price: 250.00,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
  {
    id: 'u2', name: 'Pants Deportivo', category: Category.UNIFORMS, price: 320.00,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500',
    isAvailable: true, ownerType: EntityOwner.SCHOOL, unitId: 'unit_02'
  },
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

// ============================================
// BUS ROUTES (reference list for schools)
// ============================================
export const MOCK_BUS_ROUTES: string[] = [
  'Ruta 1 - Lomas',
  'Ruta 2 - Del Valle',
  'Ruta 3 - Satélite',
  'Ruta 4 - Polanco',
  'Ruta 5 - Interlomas',
  'Ruta 6 - Santa Fe',
  'Ruta 7 - Coyoacán',
  'Ruta 8 - Pedregal',
];

// ============================================
// AUTHORIZED CONTACTS (family level)
// ============================================
export const MOCK_AUTHORIZED_CONTACTS: AuthorizedContact[] = [
  {
    id: 'contact_01',
    familyId: 'family_01',
    nombre: 'Elena González Martínez',
    parentesco: 'Abuela materna',
    telefono: '+52 55 1234 5678',
    email: 'elena.gonzalez@email.com',
    identificacion: 'INE 1234567890123',
    isDefault: true,
    createdBy: 'parent_01',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'contact_02',
    familyId: 'family_01',
    nombre: 'Carlos González Ruiz',
    parentesco: 'Tío paterno',
    telefono: '+52 55 9876 5432',
    identificacion: 'INE 9876543210987',
    isDefault: false,
    createdBy: 'parent_01',
    createdAt: '2025-09-15T14:00:00Z',
  },
  {
    id: 'contact_03',
    familyId: 'family_01',
    nombre: 'Rosa María López',
    parentesco: 'Nana',
    telefono: '+52 55 5555 1234',
    identificacion: 'INE 5555123498765',
    isDefault: false,
    createdBy: 'parent_02',
    createdAt: '2025-10-01T09:00:00Z',
  },
];

// ============================================
// EXIT PERMISSIONS (enhanced)
// ============================================
export const MOCK_EXIT_PERMISSIONS: ExitPermission[] = [
  {
    id: 'perm-001',
    schoolId: 'mx_01',
    childId: '2024001',
    childName: 'Santiago González',
    childGrade: '4° Primaria',
    childGroup: 'B',
    childPhoto: '👦',
    busOriginal: 'Ruta 3 - Satélite',
    busDestino: 'Ruta 1 - Lomas',
    transporte: 'bus_alterno',
    transporteDetalle: 'Se va con su amigo Mateo en la Ruta 1',
    fecha: '2026-02-21',
    horaSalida: '14:30',
    motivo: 'Playdate con compañero de clase',
    authorizedContactId: 'contact_01',
    personaAutorizada: {
      nombre: 'Elena González Martínez',
      parentesco: 'Abuela materna',
      telefono: '+52 55 1234 5678',
      email: 'elena.gonzalez@email.com',
      identificacion: 'INE 1234567890123',
    },
    createdBy: 'parent_01',
    createdByName: 'María González',
    approvals: [
      { parentId: 'parent_01', parentName: 'María González', status: 'aprobado', timestamp: '2026-02-20T08:00:00Z' },
      { parentId: 'parent_02', parentName: 'Roberto González', status: 'pendiente', timestamp: '' },
    ],
    status: 'pendiente',
    schoolApproval: { status: 'pendiente' },
    notificationsSent: { school: true, coparent: true, receivingFamily: false, externalPerson: true },
    creadoEn: '2026-02-20T08:00:00Z',
    actualizadoEn: '2026-02-20T08:00:00Z',
  },
  {
    id: 'perm-002',
    schoolId: 'mx_01',
    childId: '2024002',
    childName: 'Ana García',
    childGrade: '2° Primaria',
    childGroup: 'A',
    childPhoto: '👧',
    busOriginal: 'Ruta 1 - Lomas',
    transporte: 'no_asiste',
    fecha: '2026-02-22',
    horaSalida: '',
    motivo: 'Cita con el dentista',
    createdBy: 'parent_02',
    createdByName: 'Roberto García',
    approvals: [
      { parentId: 'parent_02', parentName: 'Roberto García', status: 'aprobado', timestamp: '2026-02-20T10:00:00Z' },
    ],
    status: 'aprobado',
    schoolApproval: { status: 'aprobado', reviewedBy: 'admin_01', reviewedByName: 'Coordinación', reviewedAt: '2026-02-20T10:30:00Z' },
    notificationsSent: { school: true, coparent: true, receivingFamily: false, externalPerson: false },
    creadoEn: '2026-02-20T10:00:00Z',
    actualizadoEn: '2026-02-20T10:30:00Z',
  },
  {
    id: 'perm-003',
    schoolId: 'mx_01',
    childId: '2024001',
    childName: 'Santiago González',
    childGrade: '4° Primaria',
    childGroup: 'B',
    childPhoto: '👦',
    busOriginal: 'Ruta 3 - Satélite',
    transporte: 'auto_particular',
    transporteDetalle: 'Lo recoge su tío en auto rojo Toyota Corolla',
    fecha: '2026-02-19',
    horaSalida: '13:00',
    motivo: 'Evento familiar',
    personaAutorizada: {
      nombre: 'Carlos González Ruiz',
      parentesco: 'Tío paterno',
      telefono: '+52 55 9876 5432',
      identificacion: 'INE 9876543210987',
    },
    createdBy: 'parent_01',
    createdByName: 'María González',
    approvals: [
      { parentId: 'parent_01', parentName: 'María González', status: 'aprobado', timestamp: '2026-02-18T09:00:00Z' },
      { parentId: 'parent_02', parentName: 'Roberto González', status: 'aprobado', timestamp: '2026-02-18T09:30:00Z' },
    ],
    status: 'aprobado',
    schoolApproval: { status: 'aprobado', reviewedBy: 'admin_01', reviewedByName: 'Coordinación', reviewedAt: '2026-02-18T10:00:00Z' },
    notificationsSent: { school: true, coparent: true, receivingFamily: false, externalPerson: true },
    creadoEn: '2026-02-18T09:00:00Z',
    actualizadoEn: '2026-02-18T10:00:00Z',
  },
];

// ============================================
// SCHOOL PERMISSION CONFIG
// ============================================
export const MOCK_SCHOOL_PERMISSION_CONFIG: SchoolPermissionConfig = {
  id: 'config_perm_01',
  schoolId: 'mx_01',
  horasAnticipacion: 6,
  requiereDosAprobaciones: false,
  horaLimiteSolicitud: '14:00',
  diasPermitidos: ['LUN', 'MAR', 'MIE', 'JUE', 'VIE'],
  requiereIdentificacion: true,
  permitirNoAsiste: true,
  maxPermisosPorSemana: 0,
  notificarDireccion: true,
  requiereMotivo: true,
  mensajePersonalizado: 'Recuerde que los permisos deben solicitarse con al menos 6 horas de anticipación.',
  bloqueoEnExamenes: false,
  fechasExamen: [],
  validacionDeRuta: false,
  rutasCamion: [
    'Ruta 1 - Lomas',
    'Ruta 2 - Del Valle',
    'Ruta 3 - Satélite',
    'Ruta 4 - Polanco',
    'Ruta 5 - Interlomas',
    'Ruta 6 - Santa Fe',
    'Ruta 7 - Coyoacán',
    'Ruta 8 - Pedregal',
  ],
  createdAt: '2025-08-01T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// ============================================
// SCHOOL TRIPS
// ============================================
export const MOCK_TRIPS: SchoolTrip[] = [
  {
    id: 'trip_01',
    schoolId: 'mx_01',
    nombre: 'Campamento Sierra Gorda',
    destino: 'Sierra Gorda, Querétaro',
    descripcion: 'Campamento de 3 días con actividades al aire libre, senderismo, fogata y talleres de ecología.',
    fechaSalida: '2026-03-15',
    fechaRegreso: '2026-03-17',
    costoTotal: 180000,
    costoPorAlumno: 4500,
    cupoMaximo: 40,
    cupoDisponible: 12,
    gradosPermitidos: ['4° Primaria', '5° Primaria', '6° Primaria'],
    status: 'abierto',
    fechaLimitePago: '2026-03-10',
    fechaLimiteInscripcion: '2026-03-01',
    permiteParcialidades: true,
    numeroParcialidades: 3,
    requiereDocumentos: true,
    documentosRequeridos: ['Carta responsiva firmada', 'Copia INE padre/tutor', 'Ficha médica'],
    itinerario: 'Día 1: Salida 7am, llegada 12pm, instalación. Día 2: Senderismo y talleres. Día 3: Fogata de cierre y regreso 4pm.',
    contactoEmergencia: 'Prof. Martínez: +52 55 3344 5566',
    imageEmoji: '🏕️',
    creadoPor: 'admin_01',
    creadoEn: '2026-01-15T00:00:00Z',
    actualizadoEn: '2026-02-10T00:00:00Z',
  },
  {
    id: 'trip_02',
    schoolId: 'mx_01',
    nombre: 'Visita Museo de Antropología',
    destino: 'CDMX, Chapultepec',
    descripcion: 'Visita guiada al Museo Nacional de Antropología con taller de cerámica prehispánica.',
    fechaSalida: '2026-04-10',
    fechaRegreso: '2026-04-10',
    costoTotal: 30000,
    costoPorAlumno: 750,
    cupoMaximo: 40,
    cupoDisponible: 25,
    gradosPermitidos: ['3° Primaria', '4° Primaria'],
    status: 'abierto',
    fechaLimitePago: '2026-04-05',
    fechaLimiteInscripcion: '2026-03-28',
    permiteParcialidades: false,
    numeroParcialidades: 1,
    requiereDocumentos: true,
    documentosRequeridos: ['Carta responsiva firmada'],
    itinerario: 'Salida 8am del colegio. Llegada 9:30am. Visita guiada 10am-1pm. Taller 1:30-3pm. Regreso 4pm.',
    contactoEmergencia: 'Profa. Sánchez: +52 55 7788 9900',
    imageEmoji: '🏛️',
    creadoPor: 'admin_01',
    creadoEn: '2026-02-01T00:00:00Z',
    actualizadoEn: '2026-02-15T00:00:00Z',
  },
  {
    id: 'trip_03',
    schoolId: 'mx_01',
    nombre: 'Torneo Deportivo Inter-escolar',
    destino: 'Centro Deportivo Olímpico',
    descripcion: 'Torneo de fútbol, básquetbol y atletismo entre colegios de la zona.',
    fechaSalida: '2026-05-08',
    fechaRegreso: '2026-05-08',
    costoTotal: 15000,
    costoPorAlumno: 350,
    cupoMaximo: 45,
    cupoDisponible: 45,
    gradosPermitidos: ['4° Primaria', '5° Primaria', '6° Primaria'],
    status: 'borrador',
    fechaLimitePago: '2026-05-01',
    fechaLimiteInscripcion: '2026-04-25',
    permiteParcialidades: false,
    numeroParcialidades: 1,
    requiereDocumentos: true,
    documentosRequeridos: ['Carta responsiva firmada', 'Certificado médico reciente'],
    contactoEmergencia: 'Coach Ramírez: +52 55 1122 3344',
    imageEmoji: '⚽',
    creadoPor: 'admin_01',
    creadoEn: '2026-02-10T00:00:00Z',
    actualizadoEn: '2026-02-10T00:00:00Z',
  },
];

export const MOCK_TRIP_ENROLLMENTS: TripEnrollment[] = [
  {
    id: 'enroll_01',
    tripId: 'trip_01',
    studentId: '2024001',
    studentName: 'Santiago González',
    studentGrade: '4° Primaria',
    parentId: 'parent_01',
    parentName: 'María González',
    status: 'pagado_parcial',
    totalPagado: 3000,
    saldoPendiente: 1500,
    documentosEntregados: ['Carta responsiva firmada'],
    approvedByParent: true,
    approvalDate: '2026-02-01T00:00:00Z',
    inscritoEn: '2026-02-01T00:00:00Z',
    actualizadoEn: '2026-02-15T00:00:00Z',
  },
  {
    id: 'enroll_02',
    tripId: 'trip_02',
    studentId: '2024001',
    studentName: 'Santiago González',
    studentGrade: '4° Primaria',
    parentId: 'parent_01',
    parentName: 'María González',
    status: 'inscrito',
    totalPagado: 0,
    saldoPendiente: 750,
    documentosEntregados: [],
    approvedByParent: true,
    approvalDate: '2026-02-15T00:00:00Z',
    inscritoEn: '2026-02-15T00:00:00Z',
    actualizadoEn: '2026-02-15T00:00:00Z',
  },
];

export const MOCK_TRIP_PAYMENTS: TripPayment[] = [
  {
    id: 'pay_01',
    enrollmentId: 'enroll_01',
    tripId: 'trip_01',
    studentId: '2024001',
    studentName: 'Santiago González',
    monto: 1500,
    parcialidad: 1,
    totalParcialidades: 3,
    metodoPago: 'SPEI',
    status: 'confirmado',
    fechaPago: '2026-02-01T00:00:00Z',
    fechaLimite: '2026-02-10T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'pay_02',
    enrollmentId: 'enroll_01',
    tripId: 'trip_01',
    studentId: '2024001',
    studentName: 'Santiago González',
    monto: 1500,
    parcialidad: 2,
    totalParcialidades: 3,
    metodoPago: 'Tarjeta',
    status: 'confirmado',
    fechaPago: '2026-02-15T00:00:00Z',
    fechaLimite: '2026-02-25T00:00:00Z',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'pay_03',
    enrollmentId: 'enroll_01',
    tripId: 'trip_01',
    studentId: '2024001',
    studentName: 'Santiago González',
    monto: 1500,
    parcialidad: 3,
    totalParcialidades: 3,
    metodoPago: '',
    status: 'pendiente',
    fechaPago: '',
    fechaLimite: '2026-03-10T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

// ============================================
// TRIP REMINDERS
// ============================================
export const MOCK_TRIP_REMINDERS: TripReminder[] = [
  {
    id: 'rem_01',
    tripId: 'trip_01',
    tripName: 'Campamento Sierra Gorda',
    tipo: 'pago',
    mensaje: 'Recuerda que la 3ª parcialidad del campamento vence el 10 de marzo. ¡No te quedes sin lugar!',
    destinatarios: ['parent_01'],
    fechaEnvio: '2026-03-01T08:00:00Z',
    enviado: true,
    createdAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'rem_02',
    tripId: 'trip_01',
    tripName: 'Campamento Sierra Gorda',
    tipo: 'documento',
    mensaje: 'Faltan documentos para el campamento: Carta responsiva y Copia INE tutor. Favor de entregarlos antes del 10 de marzo.',
    destinatarios: ['parent_01', 'parent_02'],
    fechaEnvio: '2026-03-05T08:00:00Z',
    enviado: false,
    createdAt: '2026-02-26T10:00:00Z',
  },
  {
    id: 'rem_03',
    tripId: 'trip_02',
    tripName: 'Visita al Museo de Antropología',
    tipo: 'general',
    mensaje: 'El autobús sale a las 7:30 AM en punto. Los alumnos deben traer lunch, agua y gorra.',
    destinatarios: ['parent_01'],
    fechaEnvio: '2026-04-09T08:00:00Z',
    enviado: false,
    createdAt: '2026-02-26T12:00:00Z',
  },
];

// ============================================
// ACTIVITY LOG (multi-parent)
// ============================================
export const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: 'log_01',
    userId: 'parent_01',
    userName: 'María González',
    action: 'deposit',
    entityType: 'wallet',
    entityId: '2024001',
    details: 'Depositó $500.00 a Santiago González',
    deviceInfo: 'iPhone 14 / Safari',
    timestamp: '2026-02-20T08:30:00Z',
  },
  {
    id: 'log_02',
    userId: 'parent_02',
    userName: 'Roberto González',
    action: 'limit_change',
    entityType: 'student',
    entityId: '2024001',
    details: 'Cambió límite diario de Santiago a $300.00',
    deviceInfo: 'Samsung Galaxy S24 / Chrome',
    timestamp: '2026-02-19T14:00:00Z',
  },
  {
    id: 'log_03',
    userId: 'parent_01',
    userName: 'María González',
    action: 'permission_create',
    entityType: 'permission',
    entityId: 'perm-001',
    details: 'Creó permiso de salida para Santiago - Playdate',
    deviceInfo: 'iPhone 14 / Safari',
    timestamp: '2026-02-20T08:00:00Z',
  },
  {
    id: 'log_04',
    userId: 'parent_01',
    userName: 'María González',
    action: 'trip_enroll',
    entityType: 'trip',
    entityId: 'trip_01',
    details: 'Inscribió a Santiago en Campamento Sierra Gorda',
    deviceInfo: 'MacBook Pro / Chrome',
    timestamp: '2026-02-01T10:00:00Z',
  },
  {
    id: 'log_05',
    userId: 'parent_02',
    userName: 'Roberto González',
    action: 'contact_add',
    entityType: 'contact',
    entityId: 'contact_03',
    details: 'Agregó a Rosa María López (Nana) como contacto autorizado',
    deviceInfo: 'Samsung Galaxy S24 / Chrome',
    timestamp: '2025-10-01T09:00:00Z',
  },
];

// ============================================
// CO-PARENT DATA (multi-parent demo)
// ============================================
export const MOCK_COPARENT = {
  parentId: 'parent_02',
  name: 'Roberto González',
  email: 'roberto.gonzalez@email.com',
  phone: '+52 55 8877 6655',
  invitationCode: 'ABC123',
};

// ============================================
// STUDENT TRANSACTIONS (demo mode)
// ============================================
export const MOCK_STUDENT_TRANSACTIONS: Transaction[] = [
  { id: 'txn_s01', date: '2026-02-21T12:30:00Z', type: 'PURCHASE', description: 'Torta de Jamón', amount: -45.00, balance: 105.50 },
  { id: 'txn_s02', date: '2026-02-21T10:15:00Z', type: 'PURCHASE', description: 'Jugo de Naranja', amount: -25.00, balance: 150.50 },
  { id: 'txn_s03', date: '2026-02-20T13:00:00Z', type: 'PURCHASE', description: 'Ensalada César + Agua', amount: -55.00, balance: 175.50 },
  { id: 'txn_s04', date: '2026-02-20T08:30:00Z', type: 'DEPOSIT', description: 'Depósito de Mamá', amount: 500.00, balance: 230.50 },
  { id: 'txn_s05', date: '2026-02-19T12:45:00Z', type: 'PURCHASE', description: 'Sandwich de Pollo', amount: -38.00, balance: -269.50 },
  { id: 'txn_s06', date: '2026-02-19T10:00:00Z', type: 'GIFT_RECEIVED', description: 'Regalo de Valentina M. — Galletas', amount: 0, balance: -231.50 },
  { id: 'txn_s07', date: '2026-02-18T13:20:00Z', type: 'PURCHASE', description: 'Pizza Pepperoni', amount: -60.00, balance: -231.50 },
  { id: 'txn_s08', date: '2026-02-18T08:00:00Z', type: 'GIFT_SENT', description: 'Regalo a Diego R. — Brownie', amount: -35.00, balance: -171.50 },
  { id: 'txn_s09', date: '2026-02-17T12:00:00Z', type: 'PURCHASE', description: 'Hot Dog + Limonada', amount: -42.00, balance: -136.50 },
  { id: 'txn_s10', date: '2026-02-15T08:00:00Z', type: 'DEPOSIT', description: 'Depósito de Papá', amount: 300.00, balance: -94.50 },
];

// ============================================
// STUDENT NOTIFICATIONS (demo mode)
// ============================================
export const MOCK_STUDENT_NOTIFICATIONS: StudentNotification[] = [
  { id: 'notif_s01', type: 'purchase', title: 'Compra realizada', message: 'Torta de Jamón — $45.00 en Cafetería Principal', read: false, timestamp: '2026-02-21T12:30:00Z', icon: '🛒' },
  { id: 'notif_s02', type: 'low_balance', title: 'Saldo bajo', message: 'Tu saldo es $105.50. Pide a tus papás que recarguen.', read: false, timestamp: '2026-02-21T12:31:00Z', icon: '⚠️' },
  { id: 'notif_s03', type: 'gift_received', title: '¡Nuevo regalo!', message: 'Valentina M. te envió Galletas 🍪', read: false, timestamp: '2026-02-19T10:00:00Z', icon: '🎁', relatedEntityId: 'gift_r02' },
  { id: 'notif_s04', type: 'deposit', title: 'Depósito recibido', message: 'Mamá depositó $500.00 a tu cuenta', read: true, timestamp: '2026-02-20T08:30:00Z', icon: '💰' },
  { id: 'notif_s05', type: 'reward_earned', title: '¡Puntos ganados!', message: 'Ganaste 45 puntos MeCard por tu compra de hoy', read: true, timestamp: '2026-02-21T12:30:00Z', icon: '⭐' },
  { id: 'notif_s06', type: 'limit_changed', title: 'Límite modificado', message: 'Papá cambió tu límite diario a $300.00', read: true, timestamp: '2026-02-19T14:00:00Z', icon: '🔒' },
  { id: 'notif_s07', type: 'trip_reminder', title: 'Viaje próximo', message: 'Campamento Sierra Gorda — Faltan 15 días', read: true, timestamp: '2026-02-18T09:00:00Z', icon: '🗺️' },
  { id: 'notif_s08', type: 'permission_created', title: 'Permiso de salida', message: 'Mamá creó un permiso de salida para el viernes', read: true, timestamp: '2026-02-20T08:00:00Z', icon: '📋' },
  { id: 'notif_s09', type: 'restriction_added', title: 'Nueva restricción', message: 'Se bloqueó la categoría Bebidas Azucaradas', read: true, timestamp: '2026-02-15T10:00:00Z', icon: '🚫' },
  { id: 'notif_s10', type: 'gift_sent', title: 'Regalo enviado', message: 'Enviaste un Brownie a Diego R.', read: true, timestamp: '2026-02-18T08:00:00Z', icon: '📤' },
];

// ============================================
// STUDENT GIFTS (demo mode)
// ============================================
export const MOCK_STUDENT_GIFTS_SENT: Gift[] = [
  {
    id: 'gift_s01', senderId: '2024001', senderName: 'Santiago González', senderStudentId: 'STU-001',
    receiverId: 'stu_003', receiverName: 'Diego Ramírez', receiverStudentId: 'STU-003',
    inventoryItemId: 'prod_05', productName: 'Brownie de Chocolate', productImage: '🍫',
    amount: 35.00, redemptionCode: 'MEC7X2', status: GiftStatus.REDEEMED,
    message: '¡Feliz cumpleaños bro!', createdAt: '2026-02-18T08:00:00Z', expiresAt: '2026-03-20T08:00:00Z',
    redeemedAt: '2026-02-18T13:00:00Z', thankYouMessage: '¡Gracias Santiago! Estuvo buenísimo 🤤',
  },
  {
    id: 'gift_s02', senderId: '2024001', senderName: 'Santiago González', senderStudentId: 'STU-001',
    receiverId: 'stu_004', receiverName: 'Sofía López', receiverStudentId: 'STU-004',
    inventoryItemId: 'prod_08', productName: 'Galletas de Avena', productImage: '🍪',
    amount: 28.00, redemptionCode: 'MEC9K4', status: GiftStatus.PENDING,
    message: 'Por ayudarme con mate 📐', createdAt: '2026-02-20T10:00:00Z', expiresAt: '2026-03-22T10:00:00Z',
  },
  {
    id: 'gift_s03', senderId: '2024001', senderName: 'Santiago González', senderStudentId: 'STU-001',
    receiverId: 'stu_005', receiverName: 'Mateo Hernández', receiverStudentId: 'STU-005',
    inventoryItemId: 'prod_02', productName: 'Jugo de Naranja', productImage: '🧃',
    amount: 25.00, redemptionCode: 'MECQ3L', status: GiftStatus.EXPIRED,
    createdAt: '2026-01-10T12:00:00Z', expiresAt: '2026-02-09T12:00:00Z',
  },
];

export const MOCK_STUDENT_GIFTS_RECEIVED: Gift[] = [
  {
    id: 'gift_r01', senderId: 'stu_003', senderName: 'Diego Ramírez', senderStudentId: 'STU-003',
    receiverId: '2024001', receiverName: 'Santiago González', receiverStudentId: 'STU-001',
    inventoryItemId: 'prod_06', productName: 'Pizza Pepperoni', productImage: '🍕',
    amount: 60.00, redemptionCode: 'MECW8P', status: GiftStatus.PENDING,
    message: '¡Por el gol de ayer! ⚽', createdAt: '2026-02-21T09:00:00Z', expiresAt: '2026-03-23T09:00:00Z',
  },
  {
    id: 'gift_r02', senderId: 'stu_004', senderName: 'Valentina Martínez', senderStudentId: 'STU-004',
    receiverId: '2024001', receiverName: 'Santiago González', receiverStudentId: 'STU-001',
    inventoryItemId: 'prod_08', productName: 'Galletas', productImage: '🍪',
    amount: 28.00, redemptionCode: 'MECR5N', status: GiftStatus.REDEEMED,
    message: '¡Feliz día! 🎉', createdAt: '2026-02-19T10:00:00Z', expiresAt: '2026-03-21T10:00:00Z',
    redeemedAt: '2026-02-19T12:30:00Z',
  },
  {
    id: 'gift_r03', senderId: 'stu_006', senderName: 'Camila Torres', senderStudentId: 'STU-006',
    receiverId: '2024001', receiverName: 'Santiago González', receiverStudentId: 'STU-001',
    inventoryItemId: 'prod_01', productName: 'Sandwich de Pollo', productImage: '🥪',
    amount: 38.00, redemptionCode: 'MECJ2T', status: GiftStatus.EXPIRED,
    createdAt: '2026-01-15T08:00:00Z', expiresAt: '2026-02-14T08:00:00Z',
  },
];

// ============================================
// STUDENT FRIENDS (demo mode)
// ============================================
export const MOCK_STUDENT_FRIENDS: Friend[] = [
  { id: 'stu_003', fullName: 'Diego Ramírez', studentId: 'STU-003', grade: '4° Primaria - B', balance: 180.00, favorites: ['prod_05', 'prod_06'], favoritesPublic: true, allergies: [], status: 'ACTIVE', schoolId: 'mx_01' },
  { id: 'stu_004', fullName: 'Valentina Martínez', studentId: 'STU-004', grade: '4° Primaria - A', balance: 220.00, favorites: ['prod_08', 'prod_02'], favoritesPublic: true, allergies: ['Gluten'], status: 'ACTIVE', schoolId: 'mx_01' },
  { id: 'stu_005', fullName: 'Mateo Hernández', studentId: 'STU-005', grade: '4° Primaria - B', balance: 95.00, favorites: ['prod_01', 'prod_03'], favoritesPublic: false, allergies: [], status: 'ACTIVE', schoolId: 'mx_01' },
  { id: 'stu_006', fullName: 'Camila Torres', studentId: 'STU-006', grade: '4° Primaria - A', balance: 310.00, favorites: ['prod_01', 'prod_08', 'prod_05'], favoritesPublic: true, allergies: ['Lactosa'], status: 'ACTIVE', schoolId: 'mx_01' },
  { id: 'stu_007', fullName: 'Emiliano Ruiz', studentId: 'STU-007', grade: '3° Primaria - C', balance: 145.00, favorites: null, favoritesPublic: false, allergies: [], status: 'ACTIVE', schoolId: 'mx_01' },
];

// ── PRE-ORDERS (Demo) ──
const today = new Date().toISOString().slice(0, 10);
export const MOCK_PRE_ORDERS: PreOrder[] = [
  {
    id: 'po_001', studentId: '2024001', studentName: 'Santiago Gonzalez', schoolId: 'mx_01', unitId: 'unit_01',
    items: [
      { productId: 'c1', productName: 'Menú del Día', productImage: 'https://images.unsplash.com/photo-1547496502-ffa222f79634?w=500', category: Category.COMBO_MEALS, quantity: 1, unitPrice: 85.00, subtotal: 85.00 },
      { productId: '6', productName: 'Jugo de Naranja', productImage: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500', category: Category.DRINKS, quantity: 1, unitPrice: 25.00, subtotal: 25.00 },
    ],
    total: 110.00, status: PreOrderStatus.CONFIRMED, pickupTime: '10:30', pickupDate: today, notes: 'Sin cebolla por favor',
    createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'po_002', studentId: '2024002', studentName: 'Ana García', schoolId: 'mx_01', unitId: 'unit_01',
    items: [
      { productId: '2', productName: 'Quesadillas (3 pzas)', productImage: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500', category: Category.HOT_MEALS, quantity: 1, unitPrice: 40.00, subtotal: 40.00 },
    ],
    total: 40.00, status: PreOrderStatus.PREPARING, pickupTime: '11:00', pickupDate: today, preparedBy: 'Cajero 1',
    createdAt: new Date(Date.now() - 1800000).toISOString(), updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'po_003', studentId: '2024003', studentName: 'Carlos López', schoolId: 'mx_01', unitId: 'unit_01',
    items: [
      { productId: 'c2', productName: 'Combo Hamburguesa', productImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', category: Category.COMBO_MEALS, quantity: 1, unitPrice: 75.00, subtotal: 75.00 },
      { productId: '7', productName: 'Agua Natural 600ml', productImage: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=500', category: Category.DRINKS, quantity: 2, unitPrice: 15.00, subtotal: 30.00 },
    ],
    total: 105.00, status: PreOrderStatus.READY, pickupTime: '10:00', pickupDate: today,
    createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 600000).toISOString(), preparedBy: 'Cajero 2',
  },
  {
    id: 'po_004', studentId: '2024001', studentName: 'Santiago Gonzalez', schoolId: 'mx_01', unitId: 'unit_01',
    items: [
      { productId: '4', productName: 'Galletas de Avena (3)', productImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', category: Category.SNACKS, quantity: 2, unitPrice: 20.00, subtotal: 40.00 },
    ],
    total: 40.00, status: PreOrderStatus.PICKED_UP, pickupTime: '09:30', pickupDate: today,
    createdAt: new Date(Date.now() - 14400000).toISOString(), updatedAt: new Date(Date.now() - 10800000).toISOString(), preparedBy: 'Cajero 1',
  },
];

// ============================================
// SCHOOL FEES / COLEGIATURAS
// ============================================

export const MOCK_SCHOOL_FEES: SchoolFee[] = [
  { id: 'fee_01', schoolId: 'mx_01', name: 'Colegiatura Mensual', description: 'Pago mensual de colegiatura', type: SchoolFeeType.TUITION, amount: 8500, recurrence: FeeRecurrence.MONTHLY, dueDay: 5, appliesTo: { all: true }, lateFeePercent: 5, isActive: true, createdAt: '2026-01-01' },
  { id: 'fee_02', schoolId: 'mx_01', name: 'Inscripción 2026-2027', description: 'Cuota de inscripción anual', type: SchoolFeeType.ENROLLMENT, amount: 15000, recurrence: FeeRecurrence.ANNUAL, dueDay: 15, appliesTo: { all: true }, isActive: true, createdAt: '2026-01-01' },
  { id: 'fee_03', schoolId: 'mx_01', name: 'Uniforme Completo', description: 'Kit de uniformes (diario + deportivo)', type: SchoolFeeType.UNIFORM, amount: 3200, recurrence: FeeRecurrence.ONE_TIME, dueDay: 10, appliesTo: { all: false, grades: ['1° Primaria'] }, isActive: true, createdAt: '2026-01-15' },
  { id: 'fee_04', schoolId: 'mx_01', name: 'Seguro Escolar', description: 'Seguro de accidentes y cobertura médica', type: SchoolFeeType.INSURANCE, amount: 1800, recurrence: FeeRecurrence.ANNUAL, dueDay: 20, appliesTo: { all: true }, isActive: true, createdAt: '2026-01-01' },
  { id: 'fee_05', schoolId: 'mx_01', name: 'Material Didáctico', description: 'Paquete de material y libros del semestre', type: SchoolFeeType.MATERIAL, amount: 2500, recurrence: FeeRecurrence.SEMESTER, dueDay: 1, appliesTo: { all: true }, isActive: false, createdAt: '2026-01-01' },
];

export const MOCK_PARENT_PAYMENTS: ParentPayment[] = [
  { id: 'pay_01', feeId: 'fee_01', feeName: 'Colegiatura Enero', parentId: 'parent_01', studentId: '2024001', studentName: 'Santiago Gonzalez', amount: 8500, status: ParentPaymentStatus.PAID, dueDate: '2026-01-05', paidAt: '2026-01-03', paidAmount: 8500, paymentMethod: 'SPEI', referenceNumber: 'REF-20260103-001' },
  { id: 'pay_02', feeId: 'fee_01', feeName: 'Colegiatura Febrero', parentId: 'parent_01', studentId: '2024001', studentName: 'Santiago Gonzalez', amount: 8500, status: ParentPaymentStatus.PAID, dueDate: '2026-02-05', paidAt: '2026-02-04', paidAmount: 8500, paymentMethod: 'SPEI', referenceNumber: 'REF-20260204-001' },
  { id: 'pay_03', feeId: 'fee_01', feeName: 'Colegiatura Marzo', parentId: 'parent_01', studentId: '2024001', studentName: 'Santiago Gonzalez', amount: 8500, status: ParentPaymentStatus.PENDING, dueDate: '2026-03-05' },
  { id: 'pay_04', feeId: 'fee_02', feeName: 'Inscripción 2026-2027', parentId: 'parent_01', studentId: '2024001', studentName: 'Santiago Gonzalez', amount: 15000, status: ParentPaymentStatus.PENDING, dueDate: '2026-06-15' },
  { id: 'pay_05', feeId: 'fee_04', feeName: 'Seguro Escolar', parentId: 'parent_01', studentId: '2024001', studentName: 'Santiago Gonzalez', amount: 1800, status: ParentPaymentStatus.PAID, dueDate: '2026-01-20', paidAt: '2026-01-18', paidAmount: 1800, paymentMethod: 'CARD' },
  { id: 'pay_06', feeId: 'fee_01', feeName: 'Colegiatura Enero', parentId: 'parent_02', studentId: '2024002', studentName: 'Valentina Torres', amount: 8500, status: ParentPaymentStatus.PAID, dueDate: '2026-01-05', paidAt: '2026-01-05', paidAmount: 8500, paymentMethod: 'SPEI', referenceNumber: 'REF-20260105-002' },
  { id: 'pay_07', feeId: 'fee_01', feeName: 'Colegiatura Febrero', parentId: 'parent_02', studentId: '2024002', studentName: 'Valentina Torres', amount: 8500, status: ParentPaymentStatus.OVERDUE, dueDate: '2026-02-05' },
  { id: 'pay_08', feeId: 'fee_01', feeName: 'Colegiatura Marzo', parentId: 'parent_02', studentId: '2024002', studentName: 'Valentina Torres', amount: 8500, status: ParentPaymentStatus.PENDING, dueDate: '2026-03-05' },
  { id: 'pay_09', feeId: 'fee_03', feeName: 'Uniforme Completo', parentId: 'parent_03', studentId: '2024003', studentName: 'Mateo Ramírez', amount: 3200, status: ParentPaymentStatus.PARTIAL, dueDate: '2026-02-10', paidAmount: 1600, paymentMethod: 'CASH' },
  { id: 'pay_10', feeId: 'fee_01', feeName: 'Colegiatura Enero', parentId: 'parent_03', studentId: '2024003', studentName: 'Mateo Ramírez', amount: 8500, status: ParentPaymentStatus.PAID, dueDate: '2026-01-05', paidAt: '2026-01-04', paidAmount: 8500, paymentMethod: 'SPEI', referenceNumber: 'REF-20260104-003' },
  { id: 'pay_11', feeId: 'fee_01', feeName: 'Colegiatura Febrero', parentId: 'parent_03', studentId: '2024003', studentName: 'Mateo Ramírez', amount: 8500, status: ParentPaymentStatus.PAID, dueDate: '2026-02-05', paidAt: '2026-02-03', paidAmount: 8500, paymentMethod: 'OXXO', referenceNumber: 'REF-20260203-003' },
  { id: 'pay_12', feeId: 'fee_01', feeName: 'Colegiatura Marzo', parentId: 'parent_03', studentId: '2024003', studentName: 'Mateo Ramírez', amount: 8500, status: ParentPaymentStatus.PENDING, dueDate: '2026-03-05' },
];

// ============================================
// SCHOOL ANNOUNCEMENTS / CIRCULARES
// ============================================

export const MOCK_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  { id: 'ann_01', schoolId: 'mx_01', title: 'Junta de Padres de Familia', body: 'Se convoca a todos los padres de familia a la junta general del bimestre. Se tratarán temas importantes sobre el calendario escolar, actividades extracurriculares y mejoras en las instalaciones. La junta se realizará en el auditorio principal.\n\nFecha: Viernes 7 de marzo, 5:00 PM\nLugar: Auditorio Principal\n\nSe solicita puntualidad.', priority: AnnouncementPriority.INFO, audience: { type: 'all' }, publishedAt: '2026-02-20T10:00:00Z', expiresAt: '2026-03-08T00:00:00Z', createdBy: 'Dirección', readByCount: 78, totalRecipients: 120 },
  { id: 'ann_02', schoolId: 'mx_01', title: '⚠️ Recordatorio: Pago de Colegiatura Marzo', body: 'Les recordamos que el plazo para el pago de la colegiatura del mes de marzo vence el próximo 5 de marzo. Los pagos pueden realizarse por SPEI, tarjeta o en ventanilla.\n\nEvite recargos realizando su pago a tiempo. Si tiene alguna duda, comuníquese a la oficina de administración.', priority: AnnouncementPriority.URGENT, audience: { type: 'all' }, publishedAt: '2026-02-24T08:00:00Z', expiresAt: '2026-03-06T00:00:00Z', createdBy: 'Administración', readByCount: 45, totalRecipients: 120 },
  { id: 'ann_03', schoolId: 'mx_01', title: 'Festival de Primavera 2026', body: 'Con gusto les informamos que nuestro Festival de Primavera se realizará el 21 de marzo. Los alumnos prepararán presentaciones por grado. Se solicita apoyo con vestuario según las indicaciones de cada maestro titular.\n\nHorario: 9:00 AM - 1:00 PM\nEntrada libre para familiares.', priority: AnnouncementPriority.INFO, audience: { type: 'grades', targets: ['1° Primaria', '2° Primaria', '3° Primaria'] }, publishedAt: '2026-02-18T14:00:00Z', createdBy: 'Coordinación Académica', readByCount: 32, totalRecipients: 60 },
  { id: 'ann_04', schoolId: 'mx_01', title: '🚨 Suspensión de Clases - Emergencia Climática', body: 'Debido a las condiciones climáticas adversas reportadas por Protección Civil, se suspenden las actividades escolares el día de mañana. Las clases se reanudarán cuando las autoridades confirmen que es seguro. Se enviarán actualizaciones por este medio.\n\nPor favor manténganse seguros.', priority: AnnouncementPriority.EMERGENCY, audience: { type: 'all' }, publishedAt: '2026-02-23T18:30:00Z', createdBy: 'Dirección General', readByCount: 110, totalRecipients: 120 },
];

// ============================================
// ACCESS CONTROL - MOCK DATA
// ============================================

export const MOCK_ACCESS_POINTS: AccessPoint[] = [
  { id: 'ap_01', schoolId: 'mx_01', name: 'Entrada Principal', type: AccessPointType.MAIN_GATE, direction: AccessDirection.ENTRY, supportedMethods: [ScanMethod.QR_CODE, ScanMethod.NFC, ScanMethod.FACIAL], status: AccessPointStatus.ONLINE, hardwareModel: 'ZKTeco SpeedFace V5L', ipAddress: '192.168.1.101', lastHeartbeat: new Date(Date.now() - 30000).toISOString(), scansToday: 186, isActive: true, createdAt: '2026-01-10' },
  { id: 'ap_02', schoolId: 'mx_01', name: 'Salida Principal', type: AccessPointType.MAIN_GATE, direction: AccessDirection.EXIT, supportedMethods: [ScanMethod.QR_CODE, ScanMethod.NFC], status: AccessPointStatus.ONLINE, hardwareModel: 'ZKTeco SpeedFace V5L', ipAddress: '192.168.1.102', lastHeartbeat: new Date(Date.now() - 45000).toISOString(), scansToday: 42, isActive: true, createdAt: '2026-01-10' },
  { id: 'ap_03', schoolId: 'mx_01', name: 'Estacionamiento', type: AccessPointType.PARKING, direction: AccessDirection.BIDIRECTIONAL, supportedMethods: [ScanMethod.NFC, ScanMethod.BARCODE], status: AccessPointStatus.ONLINE, hardwareModel: 'HID iCLASS SE R40', ipAddress: '192.168.1.110', lastHeartbeat: new Date(Date.now() - 120000).toISOString(), scansToday: 24, isActive: true, createdAt: '2026-01-15' },
  { id: 'ap_04', schoolId: 'mx_01', name: 'Zona de Camiones', type: AccessPointType.BUS_ZONE, direction: AccessDirection.BIDIRECTIONAL, supportedMethods: [ScanMethod.QR_CODE, ScanMethod.MANUAL], status: AccessPointStatus.MAINTENANCE, hardwareModel: 'Suprema BioStation 2', ipAddress: '192.168.1.120', lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), scansToday: 0, isActive: true, createdAt: '2026-01-20' },
];

const todayISO = new Date().toISOString().slice(0, 10);
const makeTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
const makeTS = (h: number, m: number) => `${todayISO}T${makeTime(h, m)}:00`;

export const MOCK_ACCESS_EVENTS: AccessEvent[] = [
  { id: 'ae_01', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024001', studentName: 'Santiago Gonzalez', studentGrade: '4° Primaria - B', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 15), authorized: true },
  { id: 'ae_02', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024002', studentName: 'Valentina Torres', studentGrade: '3° Primaria - A', credentialUsed: ScanMethod.NFC, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 18), authorized: true },
  { id: 'ae_03', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024003', studentName: 'Mateo Ramírez', studentGrade: '5° Primaria - A', credentialUsed: ScanMethod.FACIAL, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 22), authorized: true },
  { id: 'ae_04', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024004', studentName: 'Isabella Morales', studentGrade: '2° Primaria - C', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 35), authorized: true },
  { id: 'ae_05', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024005', studentName: 'Diego Hernández', studentGrade: '6° Primaria - A', credentialUsed: ScanMethod.NFC, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 52), authorized: true },
  { id: 'ae_06', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: 'unknown_01', studentName: 'Desconocido', studentGrade: '', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.ENTRY, timestamp: makeTS(8, 5), authorized: false, deniedReason: 'Credencial no reconocida' },
  { id: 'ae_07', accessPointId: 'ap_03', accessPointName: 'Estacionamiento', studentId: '2024001', studentName: 'Santiago Gonzalez', studentGrade: '4° Primaria - B', credentialUsed: ScanMethod.NFC, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 14), authorized: true },
  { id: 'ae_08', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024001', studentName: 'Santiago Gonzalez', studentGrade: '4° Primaria - B', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.EXIT, timestamp: makeTS(14, 30), authorized: true },
  { id: 'ae_09', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024002', studentName: 'Valentina Torres', studentGrade: '3° Primaria - A', credentialUsed: ScanMethod.NFC, direction: AccessDirection.EXIT, timestamp: makeTS(14, 32), authorized: true },
  { id: 'ae_10', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024003', studentName: 'Mateo Ramírez', studentGrade: '5° Primaria - A', credentialUsed: ScanMethod.FACIAL, direction: AccessDirection.EXIT, timestamp: makeTS(14, 35), authorized: true },
  { id: 'ae_11', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024006', studentName: 'Camila Vargas', studentGrade: '1° Primaria - A', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.ENTRY, timestamp: makeTS(8, 15), authorized: true },
  { id: 'ae_12', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024004', studentName: 'Isabella Morales', studentGrade: '2° Primaria - C', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.EXIT, timestamp: makeTS(13, 0), authorized: true },
  { id: 'ae_13', accessPointId: 'ap_01', accessPointName: 'Entrada Principal', studentId: '2024007', studentName: 'Emiliano Ruiz', studentGrade: '4° Primaria - A', credentialUsed: ScanMethod.NFC, direction: AccessDirection.ENTRY, timestamp: makeTS(7, 45), authorized: true },
  { id: 'ae_14', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024005', studentName: 'Diego Hernández', studentGrade: '6° Primaria - A', credentialUsed: ScanMethod.NFC, direction: AccessDirection.EXIT, timestamp: makeTS(14, 40), authorized: true },
  { id: 'ae_15', accessPointId: 'ap_02', accessPointName: 'Salida Principal', studentId: '2024006', studentName: 'Camila Vargas', studentGrade: '1° Primaria - A', credentialUsed: ScanMethod.QR_CODE, direction: AccessDirection.EXIT, timestamp: makeTS(14, 45), authorized: true },
];

const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().slice(0, 10);
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().slice(0, 10);

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Today
  { id: 'att_01', studentId: '2024001', studentName: 'Santiago Gonzalez', grade: '4° Primaria - B', date: todayISO, entryTime: '07:15', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_02', studentId: '2024002', studentName: 'Valentina Torres', grade: '3° Primaria - A', date: todayISO, entryTime: '07:18', exitTime: '14:32', status: AttendanceStatus.PRESENT },
  { id: 'att_03', studentId: '2024003', studentName: 'Mateo Ramírez', grade: '5° Primaria - A', date: todayISO, entryTime: '07:22', exitTime: '14:35', status: AttendanceStatus.PRESENT },
  { id: 'att_04', studentId: '2024004', studentName: 'Isabella Morales', grade: '2° Primaria - C', date: todayISO, entryTime: '07:35', exitTime: '13:00', status: AttendanceStatus.EARLY_EXIT, notes: 'Cita médica' },
  { id: 'att_05', studentId: '2024005', studentName: 'Diego Hernández', grade: '6° Primaria - A', date: todayISO, entryTime: '07:52', status: AttendanceStatus.LATE, notes: 'Llegó 22 min tarde' },
  { id: 'att_06', studentId: '2024006', studentName: 'Camila Vargas', grade: '1° Primaria - A', date: todayISO, entryTime: '08:15', status: AttendanceStatus.LATE },
  { id: 'att_07', studentId: '2024007', studentName: 'Emiliano Ruiz', grade: '4° Primaria - A', date: todayISO, status: AttendanceStatus.ABSENT },
  // Yesterday
  { id: 'att_08', studentId: '2024001', studentName: 'Santiago Gonzalez', grade: '4° Primaria - B', date: yesterday, entryTime: '07:10', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_09', studentId: '2024002', studentName: 'Valentina Torres', grade: '3° Primaria - A', date: yesterday, entryTime: '07:20', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_10', studentId: '2024003', studentName: 'Mateo Ramírez', grade: '5° Primaria - A', date: yesterday, status: AttendanceStatus.EXCUSED, notes: 'Permiso médico' },
  { id: 'att_11', studentId: '2024004', studentName: 'Isabella Morales', grade: '2° Primaria - C', date: yesterday, entryTime: '07:25', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_12', studentId: '2024005', studentName: 'Diego Hernández', grade: '6° Primaria - A', date: yesterday, entryTime: '07:30', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  // Two days ago
  { id: 'att_13', studentId: '2024001', studentName: 'Santiago Gonzalez', grade: '4° Primaria - B', date: twoDaysAgo, entryTime: '07:12', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_14', studentId: '2024002', studentName: 'Valentina Torres', grade: '3° Primaria - A', date: twoDaysAgo, entryTime: '07:50', exitTime: '14:30', status: AttendanceStatus.LATE },
  { id: 'att_15', studentId: '2024005', studentName: 'Diego Hernández', grade: '6° Primaria - A', date: twoDaysAgo, entryTime: '07:28', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  // Three days ago
  { id: 'att_16', studentId: '2024001', studentName: 'Santiago Gonzalez', grade: '4° Primaria - B', date: threeDaysAgo, entryTime: '07:08', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_17', studentId: '2024002', studentName: 'Valentina Torres', grade: '3° Primaria - A', date: threeDaysAgo, entryTime: '07:15', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_18', studentId: '2024003', studentName: 'Mateo Ramírez', grade: '5° Primaria - A', date: threeDaysAgo, entryTime: '07:20', exitTime: '14:30', status: AttendanceStatus.PRESENT },
  { id: 'att_19', studentId: '2024004', studentName: 'Isabella Morales', grade: '2° Primaria - C', date: threeDaysAgo, status: AttendanceStatus.ABSENT },
  { id: 'att_20', studentId: '2024005', studentName: 'Diego Hernández', grade: '6° Primaria - A', date: threeDaysAgo, entryTime: '07:55', exitTime: '14:30', status: AttendanceStatus.LATE },
];

export const MOCK_WEBHOOK_CONFIGS: WebhookConfig[] = [
  { id: 'wh_01', schoolId: 'mx_01', url: 'https://erp.colegiocumbres.mx/api/webhooks/mecard', secret: 'whsec_a1b2c3d4e5f6g7h8i9j0', events: [WebhookEventType.ACCESS_ENTRY, WebhookEventType.ACCESS_EXIT, WebhookEventType.ATTENDANCE_MARKED], isActive: true, lastDelivery: new Date(Date.now() - 60000).toISOString(), failCount: 0, createdAt: '2026-01-15' },
  { id: 'wh_02', schoolId: 'mx_01', url: 'https://sistema-asistencia.example.com/hooks/mecard', secret: 'whsec_x9y8z7w6v5u4t3s2r1q0', events: [WebhookEventType.ATTENDANCE_MARKED, WebhookEventType.DEVICE_OFFLINE], isActive: true, lastDelivery: new Date(Date.now() - 7200000).toISOString(), failCount: 3, createdAt: '2026-02-01' },
];

export const MOCK_API_KEYS: AccessApiKey[] = [
  { id: 'key_01', schoolId: 'mx_01', name: 'ERP Principal', keyPrefix: 'mk_live_', keyHash: 'sha256_abc123...', permissions: ['access:read', 'access:write', 'attendance:read', 'students:read'], lastUsed: new Date(Date.now() - 300000).toISOString(), createdAt: '2026-01-10', isActive: true },
  { id: 'key_02', schoolId: 'mx_01', name: 'Torniquetes ZKTeco', keyPrefix: 'mk_dev_', keyHash: 'sha256_def456...', permissions: ['access:write', 'heartbeat'], lastUsed: new Date(Date.now() - 60000).toISOString(), createdAt: '2026-01-20', isActive: true },
  { id: 'key_03', schoolId: 'mx_01', name: 'App Padres (Legacy)', keyPrefix: 'mk_test_', keyHash: 'sha256_ghi789...', permissions: ['attendance:read'], createdAt: '2025-11-01', expiresAt: '2026-06-30', isActive: false },
];
