#!/bin/bash
# scripts/test-environment.sh

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Iniciando pruebas del sistema de ambientes..."

# 1. Verificar existencia de archivos .env
echo "   - Verificando archivos .env..."
[ -f .env.local ] && echo "     ${GREEN}✔ .env.local encontrado${NC}" || echo "     ${RED}✖ .env.local NO encontrado${NC}"
[ -f .env.staging ] && echo "     ${GREEN}✔ .env.staging encontrado${NC}" || echo "     ${RED}✖ .env.staging NO encontrado${NC}"
[ -f .env.production ] && echo "     ${GREEN}✔ .env.production encontrado${NC}" || echo "     ${RED}✖ .env.production NO encontrado${NC}"

# 2. Simular carga de ambientes en vite
echo "   - Simulando carga de variables de entorno..."

# Prueba DEV
VITE_APP_ENV=development npm run build > /dev/null 2>&1
if grep -q "VITE_SUPABASE_URL_DEV" dist/index.html; then
  echo "     ${GREEN}✔ Variables de DEVELOPMENT cargadas correctamente${NC}"
else
  echo "     ${RED}✖ Fallo al cargar variables de DEVELOPMENT${NC}"
fi

# Prueba STAGING
VITE_APP_ENV=staging npm run build:staging > /dev/null 2>&1
if grep -q "VITE_SUPABASE_URL_STAGING" dist/index.html; then
  echo "     ${GREEN}✔ Variables de STAGING cargadas correctamente${NC}"
else
  echo "     ${RED}✖ Fallo al cargar variables de STAGING${NC}"
fi

# 3. Limpieza
rm -rf dist

echo "✅ Pruebas de ambiente finalizadas."
