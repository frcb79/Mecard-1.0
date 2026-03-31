/**
 * verify-supabase-schema.mjs
 *
 * Valida que las tablas definidas en los SQL del proyecto existan en Supabase.
 *
 * Uso (PowerShell):
 *   $env:SUPABASE_URL="https://<project>.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
 *   node scripts/verify-supabase-schema.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const SCHEMA_FILE = path.join(ROOT, 'SUPABASE_SCHEMA.sql');
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: SUPABASE_URL (o VITE_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function extractTables(sqlText) {
  const tables = new Set();
  const regex = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)/gi;
  let match;

  while ((match = regex.exec(sqlText)) !== null) {
    tables.add(match[1]);
  }

  return tables;
}

function collectRequiredTables() {
  const required = new Set();

  if (fs.existsSync(SCHEMA_FILE)) {
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    for (const table of extractTables(schemaSql)) {
      required.add(table);
    }
  }

  if (fs.existsSync(MIGRATIONS_DIR)) {
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.toLowerCase().endsWith('.sql'));

    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      for (const table of extractTables(sql)) {
        required.add(table);
      }
    }
  }

  return Array.from(required).sort();
}

async function checkTableExists(tableName) {
  const { error } = await supabase
    .from(tableName)
    .select('*', { head: true, count: 'exact' })
    .limit(1);

  if (!error) {
    return { tableName, status: 'ok' };
  }

  const message = (error.message || '').toLowerCase();

  if (
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('relation')
  ) {
    return { tableName, status: 'missing', error: error.message };
  }

  return { tableName, status: 'error', error: error.message };
}

async function run() {
  const requiredTables = collectRequiredTables();

  if (requiredTables.length === 0) {
    console.error('❌ No se detectaron tablas en SQL del proyecto');
    process.exit(1);
  }

  console.log(`🔎 Validando ${requiredTables.length} tablas contra Supabase...\n`);

  const results = [];
  for (const table of requiredTables) {
    const result = await checkTableExists(table);
    results.push(result);

    if (result.status === 'ok') {
      console.log(`✅ ${table}`);
    } else if (result.status === 'missing') {
      console.log(`❌ ${table} (FALTA)`);
    } else {
      console.log(`⚠️  ${table} (error: ${result.error})`);
    }
  }

  const okCount = results.filter((r) => r.status === 'ok').length;
  const missing = results.filter((r) => r.status === 'missing');
  const errors = results.filter((r) => r.status === 'error');

  console.log('\n════════════════════════════════════');
  console.log('RESUMEN');
  console.log('════════════════════════════════════');
  console.log(`Total requeridas: ${requiredTables.length}`);
  console.log(`Existentes: ${okCount}`);
  console.log(`Faltantes: ${missing.length}`);
  console.log(`Errores de verificación: ${errors.length}`);

  if (missing.length > 0) {
    console.log('\nTablas faltantes:');
    for (const m of missing) {
      console.log(`- ${m.tableName}`);
    }
  }

  if (errors.length > 0) {
    console.log('\nTablas con error:');
    for (const e of errors) {
      console.log(`- ${e.tableName}: ${e.error}`);
    }
  }

  if (missing.length === 0 && errors.length === 0) {
    console.log('\n✅ Esquema Supabase completo según SQL del proyecto.');
    process.exit(0);
  }

  process.exit(2);
}

run().catch((err) => {
  console.error('❌ Error inesperado validando esquema:', err?.message || err);
  process.exit(1);
});
