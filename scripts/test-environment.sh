#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV=${1:-staging}
ERRORS=0

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MeCard Platform - Environment Test Suite    ║${NC}"
echo -e "${BLUE}║   Testing: ${ENV^^}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

check_env_var() {
  if [ -z "${!1}" ]; then
    echo -e "${RED}  ✗ $1 no está configurada${NC}"
    ((ERRORS++))
    return 1
  else
    echo -e "${GREEN}  ✓ $1 configurada${NC}"
    return 0
  fi
}

if [ "$ENV" = "staging" ]; then
  export $(cat .env.staging | xargs)
elif [ "$ENV" = "production" ]; then
  export $(cat .env.production | xargs)
else
  export $(cat .env.local | xargs)
fi

echo -e "${YELLOW}[1/6] Verificando variables de entorno...${NC}"
check_env_var "VITE_APP_ENV"
check_env_var "VITE_SUPABASE_URL"
check_env_var "VITE_SUPABASE_ANON_KEY"
echo ""

echo -e "${YELLOW}[2/6] Verificando Node.js...${NC}"
if ! command -v node > /dev/null; then
  echo -e "${RED}  ✗ Node.js no está instalado${NC}"
  ((ERRORS++))
else
  echo -e "${GREEN}  ✓ Node.js instalado: $(node -v)${NC}"
fi
echo ""

echo -e "${YELLOW}[3/6] Type Check...${NC}"
if npm run type-check > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Type check pasó${NC}"
else
  echo -e "${RED}  ✗ Type check falló${NC}"
  ((ERRORS++))
fi
echo ""

echo -e "${YELLOW}[4/6] Linting...${NC}"
if npm run lint > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Linting pasó${NC}"
else
  echo -e "${RED}  ✗ Linting falló${NC}"
  ((ERRORS++))
fi
echo ""

echo -e "${YELLOW}[5/6] Build Test...${NC}"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}  ✓ Build completado${NC}"
else
  echo -e "${RED}  ✗ Build falló${NC}"
  ((ERRORS++))
fi
echo ""

echo -e "${YELLOW}[6/6] Supabase Connection...${NC}"
if [ "$VITE_USE_MOCK_DATA" = "true" ]; then
  echo -e "${YELLOW}  ⚠ Modo Mock - Skip${NC}"
else
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL/rest/v1/" || echo "000")
  if [ "$HEALTH" = "200" ] || [ "$HEALTH" = "401" ]; then
    echo -e "${GREEN}  ✓ Supabase OK${NC}"
  else
    echo -e "${RED}  ✗ Supabase no responde${NC}"
    ((ERRORS++))
  fi
fi
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS ERROR(ES) ENCONTRADO(S)${NC}"
  exit 1
fi