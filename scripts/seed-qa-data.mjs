/**
 * seed-qa-data.mjs
 * 
 * Crea datos maestros de prueba para QA en Supabase.
 * Incluye: 1 colegio, 3 campuses, 5 unidades, staff, y 50 alumnos.
 * 
 * Uso:
 *   $env:SUPABASE_URL="https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/seed-qa-data.mjs
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Faltan: SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ──────────────────────────────────────────
// DATO MAESTRO: 1 COLEGIO QA
// ──────────────────────────────────────────
const QA_SCHOOL = {
  name: 'Escuela QA Demo',
  legal_name: 'Escuela Municipal QA Demo',
  rfc: 'EMQ123456ABC',
  status: 'ACTIVE',
  contract_type: 'TRIAL',
  trial_duration_months: 3,
  onboarding_status: 'COMPLETED',
  student_count: 50,
  balance: 0,
};

// ──────────────────────────────────────────
// DATO MAESTRO: 3 CAMPUSES
// ──────────────────────────────────────────
const QA_CAMPUSES = [
  { name: 'Campus Principal', is_active: true },
  { name: 'Campus Secundaria', is_active: true },
  { name: 'Campus Preparatoria', is_active: true },
];

// ──────────────────────────────────────────
// DATO MAESTRO: 5 UNIDADES (cafetería, papelería, etc.)
// ──────────────────────────────────────────
const QA_UNITS = [
  { name: 'Cafetería Principal', type: 'CAFETERIA', owner_type: 'SCHOOL' },
  { name: 'Café Secundaria', type: 'CAFETERIA', owner_type: 'SCHOOL' },
  { name: 'Papelería Central', type: 'STATIONERY', owner_type: 'CONCESSIONAIRE' },
  { name: 'Librería', type: 'LIBRARY', owner_type: 'SCHOOL' },
  { name: 'Cooperativa', type: 'BOOKSTORE', owner_type: 'CONCESSIONAIRE' },
];

// ──────────────────────────────────────────
// DATO MAESTRO: STAFF (para crear roles)
// ──────────────────────────────────────────
const QA_STAFF = [
  {
    email: 'principal@escuela-qa.mx',
    full_name: 'Director QA School',
    role: 'SCHOOL_ADMIN',
  },
  {
    email: 'finance@escuela-qa.mx',
    full_name: 'Encargado Finanzas',
    role: 'SCHOOL_FINANCE',
  },
  {
    email: 'cafeteria-op@escuela-qa.mx',
    full_name: 'Operador Cafetería',
    role: 'CAFETERIA_STAFF',
  },
  {
    email: 'pos-operator@escuela-qa.mx',
    full_name: 'Operador POS',
    role: 'POS_OPERATOR',
  },
];

// ──────────────────────────────────────────
// DATO MAESTRO: 20 PRODUCTOS DE CATÁLOGO
// ──────────────────────────────────────────
const QA_PRODUCTS = [
  // Comidas
  { sku: 'CAFE-SANDWICH-001', name: 'Sándwich de Jamón y Queso', category: 'Comidas', price: 45.00, image_url: null, allergens: ['gluten', 'dairy'] },
  { sku: 'CAFE-BURGER-001', name: 'Hamburguesa de Pollo', category: 'Comidas', price: 55.00, image_url: null, allergens: ['gluten', 'dairy'] },
  { sku: 'CAFE-PIZZA-001', name: 'Pizza Margarita', category: 'Comidas', price: 65.00, image_url: null, allergens: ['gluten', 'dairy'] },
  { sku: 'CAFE-PASTA-001', name: 'Pasta Alfredo', category: 'Comidas', price: 50.00, image_url: null, allergens: ['gluten', 'dairy'] },
  
  // Bebidas
  { sku: 'CAFE-JUICE-001', name: 'Jugo Natural Naranja', category: 'Bebidas', price: 20.00, image_url: null, allergens: [] },
  { sku: 'CAFE-SODA-001', name: 'Refresco Tamaño Grande', category: 'Bebidas', price: 25.00, image_url: null, allergens: [] },
  { sku: 'CAFE-WATER-001', name: 'Agua Embotellada', category: 'Bebidas', price: 10.00, image_url: null, allergens: [] },
  { sku: 'CAFE-COFFEE-001', name: 'Café Latte', category: 'Bebidas', price: 30.00, image_url: null, allergens: ['dairy'] },
  
  // Snacks
  { sku: 'CAFE-CHIPS-001', name: 'Papas Fritas Pequeñas', category: 'Snacks', price: 15.00, image_url: null, allergens: [] },
  { sku: 'CAFE-CHOCO-001', name: 'Barra de Chocolate', category: 'Snacks', price: 18.00, image_url: null, allergens: ['nuts', 'dairy'] },
  { sku: 'CAFE-POP-001', name: 'Palomitas de Maíz', category: 'Snacks', price: 20.00, image_url: null, allergens: [] },
  { sku: 'CAFE-NUTS-001', name: 'Mezcla de Frutos Secos', category: 'Snacks', price: 30.00, image_url: null, allergens: ['nuts'] },
  
  // Postres
  { sku: 'CAFE-FRUIT-001', name: 'Tazón de Frutas', category: 'Postres', price: 35.00, image_url: null, allergens: [] },
  { sku: 'CAFE-CAKE-001', name: 'Pastel de Chocolate', category: 'Postres', price: 40.00, image_url: null, allergens: ['gluten', 'dairy'] },
  
  // Otros
  { sku: 'PAPER-NOTEBOOK-001', name: 'Cuaderno 100 Hojas', category: 'Papelería', price: 25.00, image_url: null, allergens: [] },
  { sku: 'PAPER-PEN-001', name: 'Bolígrafo (Pack 3)', category: 'Papelería', price: 12.00, image_url: null, allergens: [] },
];

// ──────────────────────────────────────────
// DATO MAESTRO: 50 ALUMNOS DE PRUEBA
// ──────────────────────────────────────────
function generateStudents(count = 50) {
  const students = [];
  const names = [
    'Juan García', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Hernández',
    'Laura Gómez', 'Miguel Sánchez', 'Rosa Fernández', 'Diego Torres', 'Sofia Ruiz',
  ];
  
  for (let i = 0; i < count; i++) {
    const firstName = names[i % names.length];
    const suffix = Math.floor(i / names.length);
    const name = suffix > 0 ? `${firstName} ${suffix}` : firstName;
    
    students.push({
      email: `student${String(i+1).padStart(3, '0')}@escuela-qa.mx`,
      full_name: name,
      curp: `XXXX${String(i+1).padStart(6, '0')}HDFXXX0${i % 10}`,
      student_id_number: `ALU${String(i+1).padStart(5, '0')}`,
      phone: `5500${String(i).padStart(6, '0')}`,
      clabe: `002010${String(i+1).padStart(11, '0')}`,
      initial_balance: 500.00,
    });
  }
  
  return students;
}

// ──────────────────────────────────────────
// EXECUCIÓN
// ──────────────────────────────────────────
async function main() {
  console.log('🌱 Sembrando datos QA en Supabase...\n');
  
  try {
    // 1. Crear colegio
    console.log('1️⃣  Crear colegio...');
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert([QA_SCHOOL])
      .select('id')
      .single();
    
    if (schoolError) throw schoolError;
    const schoolId = school.id;
    console.log(`   ✅ Colegio creado: ${schoolId}\n`);
    
    // 2. Crear campuses
    console.log('2️⃣  Crear campuses...');
    const campusesWithSchool = QA_CAMPUSES.map(c => ({ ...c, school_id: schoolId }));
    const { data: campuses, error: campusError } = await supabase
      .from('campuses')
      .insert(campusesWithSchool)
      .select('id, name');
    
    if (campusError) throw campusError;
    console.log(`   ✅ ${campuses.length} campuses creados\n`);
    
    // 3. Crear unidades operativas
    console.log('3️⃣  Crear unidades operativas...');
    const unitsWithSchool = QA_UNITS.map((u, idx) => ({
      ...u,
      school_id: schoolId,
      campus_id: campuses[idx % campuses.length].id,
    }));
    
    const { data: units, error: unitError } = await supabase
      .from('operating_units')
      .insert(unitsWithSchool)
      .select('id, name');
    
    if (unitError) throw unitError;
    console.log(`   ✅ ${units.length} unidades operativas creadas\n`);
    
    // 4. Crear staff y credenciales
    console.log('4️⃣  Crear staff con credenciales...');
    const staffCredentials = [];
    const TEST_PASSWORD = 'Mecard2025!';
    
    for (const staffMember of QA_STAFF) {
      // Crear auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: staffMember.email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      
      if (authError && !authError.message.includes('User already exists')) {
        console.error(`   ❌ Error creando staff ${staffMember.email}: ${authError.message}`);
        continue;
      }
      
      if (authUser?.user) {
        const userId = authUser.user.id;
        
        // Crear perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: staffMember.email,
            full_name: staffMember.full_name,
            role: staffMember.role,
            school_id: schoolId,
            status: 'Active',
          }, { onConflict: 'id' });
        
        if (profileError) throw profileError;
        
        staffCredentials.push({
          email: staffMember.email,
          role: staffMember.role,
          password: TEST_PASSWORD,
        });
      }
    }
    
    console.log(`   ✅ ${staffCredentials.length} staff creados\n`);
    
    // 5. Crear productos
    console.log('5️⃣  Crear productos...');
    const productsWithSchool = QA_PRODUCTS.map(p => ({
      ...p,
      school_id: schoolId,
      status: 'active',
      stock: 100,
    }));
    
    const { data: products, error: prodError } = await supabase
      .from('products')
      .insert(productsWithSchool)
      .select('id, sku');
    
    if (prodError) throw prodError;
    console.log(`   ✅ ${products.length} productos creados\n`);
    
    // 6. Crear alumnos
    console.log('6️⃣  Crear alumnos y credenciales...');
    const students = generateStudents(50);
    let studentCount = 0;
    
    for (const student of students) {
      // Crear auth user (skip if exists)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: TEST_PASSWORD,
        email_confirm: true,
      });
      
      if (authError && !authError.message.includes('User already exists')) {
        continue;
      }
      
      if (authUser?.user) {
        const userId = authUser.user.id;
        
        // Crear perfil de estudiante
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: student.email,
            full_name: student.full_name,
            role: 'STUDENT',
            school_id: schoolId,
            status: 'Active',
            balance: student.initial_balance,
          }, { onConflict: 'id' });
        
        if (profileError) throw profileError;
        
        studentCount++;
      }
    }
    
    console.log(`   ✅ ${studentCount} alumnos creados\n`);
    
    // 7. Resumen y credenciales
    console.log('✅ Seed completado exitosamente.\n');
    console.log('──────────────────────────────────────────');
    console.log('📊 RESUMEN DE DATOS CREADOS:');
    console.log(`  Colegio: Escuela QA Demo (${schoolId})`);
    console.log(`  Campuses: ${campuses.length}`);
    console.log(`  Unidades: ${units.length}`);
    console.log(`  Staff: ${staffCredentials.length}`);
    console.log(`  Productos: ${products.length}`);
    console.log(`  Alumnos: ${studentCount}`);
    console.log('──────────────────────────────────────────');
    console.log('\n🔑 CREDENCIALES DE ACCESO (todas con password: Mecard2025!):\n');
    
    console.log('👤 STAFF:');
    staffCredentials.forEach(s => {
      console.log(`  - ${s.email} (${s.role})`);
    });
    
    console.log('\n👦 ALUMNOS (primeros 5):');
    students.slice(0, 5).forEach(s => {
      console.log(`  - ${s.email}`);
    });
    console.log(`  ... y ${studentCount - 5} más`);
    
    console.log('\n──────────────────────────────────────────');
    console.log('✅ Próximo paso: Actualizar TESTING_ROLES.md con matriz de usuarios');
    console.log('──────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Fatal:', error);
    process.exit(1);
  }
}

main();
