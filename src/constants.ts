
import { Product, Category, SalesData, StudentProfile, Transaction, EntityOwner, School, OperatingUnit, SupportTicket, AuthorizedContact, ExitPermission, SchoolPermissionConfig, SchoolTrip, TripEnrollment, TripPayment, ActivityLogEntry } from './types';

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
