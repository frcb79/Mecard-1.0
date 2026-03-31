/**
 * audit-schema-coverage.mjs
 *
 * Valida cobertura de esquema local:
 * - Extrae tablas definidas en SQL
 * - Extrae tablas usadas en código (supabase.from)
 * - Reporta tablas usadas pero no definidas
 *
 * Uso:
 *   node scripts/audit-schema-coverage.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCHEMA_FILE = path.join(ROOT, 'SUPABASE_SCHEMA.sql');
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');
const SECURITY_FIXES_FILE = path.join(ROOT, 'SECURITY_FIXES_PHASE1.sql');
const SRC_DIRS = [
  path.join(ROOT, 'src'),
  path.join(ROOT, 'scripts'),
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

function extractDefinedTables(sqlText) {
  const set = new Set();
  const re = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_]+)/gi;
  let m;
  while ((m = re.exec(sqlText)) !== null) set.add(m[1]);
  return set;
}

function extractUsedTables(codeText) {
  const set = new Set();
  const re = /\.from\(\s*['\"]([a-zA-Z0-9_]+)['\"]\s*\)/g;
  let m;
  while ((m = re.exec(codeText)) !== null) set.add(m[1]);
  return set;
}

function extractUsedRpcs(codeText) {
  const set = new Set();
  const re = /\.rpc\(\s*['\"]([a-zA-Z0-9_]+)['\"]\s*/g;
  let m;
  while ((m = re.exec(codeText)) !== null) set.add(m[1]);
  return set;
}

function collectDefinedTables() {
  const defined = new Set();

  if (fs.existsSync(SCHEMA_FILE)) {
    const sql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    for (const t of extractDefinedTables(sql)) defined.add(t);
  }

  if (fs.existsSync(MIGRATIONS_DIR)) {
    for (const file of fs.readdirSync(MIGRATIONS_DIR)) {
      if (!file.endsWith('.sql')) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      for (const t of extractDefinedTables(sql)) defined.add(t);
    }
  }

  if (fs.existsSync(SECURITY_FIXES_FILE)) {
    const sql = fs.readFileSync(SECURITY_FIXES_FILE, 'utf-8');
    for (const t of extractDefinedTables(sql)) defined.add(t);
  }

  return defined;
}

function collectUsage() {
  const usedTables = new Set();
  const usedRpcs = new Set();

  for (const srcDir of SRC_DIRS) {
    const files = walk(srcDir).filter((f) =>
      /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f)
    );
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf-8');
      for (const t of extractUsedTables(text)) usedTables.add(t);
      for (const fn of extractUsedRpcs(text)) usedRpcs.add(fn);
    }
  }

  return { usedTables, usedRpcs };
}

function run() {
  const defined = collectDefinedTables();
  const { usedTables, usedRpcs } = collectUsage();

  const missingTables = [...usedTables].filter((t) => !defined.has(t)).sort();

  console.log('════════════════════════════════════');
  console.log('SCHEMA COVERAGE (LOCAL)');
  console.log('════════════════════════════════════');
  console.log(`Tablas definidas (SQL): ${defined.size}`);
  console.log(`Tablas usadas (codigo): ${usedTables.size}`);
  console.log(`RPC usadas (codigo): ${usedRpcs.size}`);

  if (missingTables.length === 0) {
    console.log('\n✅ Todas las tablas usadas en código existen en SQL del proyecto.');
  } else {
    console.log('\n❌ Tablas usadas en código que NO aparecen en SQL:');
    for (const t of missingTables) console.log(`- ${t}`);
  }

  if (usedRpcs.size > 0) {
    console.log('\nRPC detectadas:');
    [...usedRpcs].sort().forEach((fn) => console.log(`- ${fn}`));
  }

  process.exit(missingTables.length === 0 ? 0 : 2);
}

run();
