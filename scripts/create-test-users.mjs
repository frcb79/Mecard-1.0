/**
 * create-test-users.mjs
 *
 * Crea los usuarios de prueba en Supabase Auth + tabla profiles.
 * Usar SOLO en entornos de desarrollo/staging.
 *
 * Uso:
 *   $env:SUPABASE_URL="https://xxx.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/create-test-users.mjs
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Faltan env vars: SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ──────────────────────────────────────────
// Definición de usuarios de prueba
// ──────────────────────────────────────────
const TEST_PASSWORD = 'Mecard2025!';

const TEST_USERS = [
  {
    email: 'admin@mecard.mx',
    full_name: 'Super Admin MeCard',
    role: 'SUPER_ADMIN',
    school_id: null,   // Super admin no pertenece a una escuela
  },
  {
    email: 'admin@escuela.mx',
    full_name: 'Admin Escuela Demo',
    role: 'SCHOOL_ADMIN',
    school_id: null,   // Se asignará la primera escuela disponible (ver abajo)
  },
];

// ──────────────────────────────────────────
async function main() {
  console.log('🚀 Creando usuarios de prueba en Supabase...\n');

  // Buscar una escuela existente para asignar al SCHOOL_ADMIN
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name')
    .limit(1)
    .maybeSingle();

  const schoolId = schools?.id ?? null;
  if (schoolId) {
    console.log(`🏫 Escuela encontrada: ${schools.name} (${schoolId})`);
    TEST_USERS.find(u => u.role === 'SCHOOL_ADMIN').school_id = schoolId;
  } else {
    console.log('⚠️  No se encontró ninguna escuela — SCHOOL_ADMIN quedará sin school_id');
  }

  for (const userDef of TEST_USERS) {
    await upsertUser(userDef);
  }

  console.log('\n✅ Proceso completado.');
  console.log('──────────────────────────────────────────');
  console.log('Credenciales de acceso (Vercel / producción):');
  console.log('');
  console.log('  Super Admin (gateway CORPORATIVO):');
  console.log(`    Email    : admin@mecard.mx`);
  console.log(`    Password : ${TEST_PASSWORD}`);
  console.log(`    MasterKey: MECARD2025`);
  console.log('');
  console.log('  School Admin (gateway COLEGIOS):');
  console.log(`    Email    : admin@escuela.mx`);
  console.log(`    Password : ${TEST_PASSWORD}`);
  console.log('──────────────────────────────────────────');
}

async function upsertUser({ email, full_name, role, school_id }) {
  console.log(`\n👤 Procesando: ${email} (${role})`);

  // 1. Crear o recuperar usuario en Supabase Auth
  let userId;

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    userId = existing.id;
    console.log(`   ↳ Perfil ya existe (id: ${userId}), actualizando contraseña...`);
    const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
      password: TEST_PASSWORD,
    });
    if (pwError) {
      console.error(`   ❌ Error actualizando contraseña: ${pwError.message}`);
    } else {
      console.log('   ✅ Contraseña actualizada');
    }
  } else {
    console.log('   ↳ No existe aún, creando auth user...');
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,  // skip email confirmation
    });

    if (createError) {
      console.error(`   ❌ Error creando auth user: ${createError.message}`);
      return;
    }
    userId = created.user.id;
    console.log(`   ✅ Auth user creado (id: ${userId})`);
  }

  // 2. Upsert en tabla profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name,
        role,
        school_id,
        status: 'Active',
        balance: 0,
      },
      { onConflict: 'id' }
    );

  if (profileError) {
    console.error(`   ❌ Error en profiles: ${profileError.message}`);
  } else {
    console.log(`   ✅ Perfil upserted en tabla profiles`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
