
import { Product, Category, SalesData, StudentProfile, Transaction, EntityOwner, School, OperatingUnit, SupportTicket, AuthorizedContact, ExitPermission, SchoolPermissionConfig, SchoolTrip, TripEnrollment, TripPayment, ActivityLogEntry, Gift, GiftStatus, StudentNotification, Friend } from './types';

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
