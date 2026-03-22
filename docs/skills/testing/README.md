# Skill: Testing — meCard

## Objetivo

Garantizar que los cambios al sistema sean validados automáticamente antes de llegar a staging o producción. Este skill define las reglas, patrones y herramientas para escribir tests confiables en meCard.

## Stack de Testing

| Herramienta | Rol |
|---|---|
| **Vitest** | Test runner principal (unit + integración) |
| **@testing-library/react** | Renderizado y simulación de componentes |
| **@testing-library/user-event** | Simulación de interacciones de usuario |
| **jsdom** | Entorno DOM para tests sin navegador (localStorage disponible) |
| **vi** (Vitest) | Spies, mocks, control de Math.random, timers |

## Comandos

```bash
# Dev: modo watch (re-ejecuta al guardar)
npm run test

# CI: ejecución única  
npm run test -- --run

# Con UI visual
npm run test:ui

# Con reporte de cobertura
npm run test:coverage
```

## Pirámide de Testing en meCard

```
         [ E2E — Playwright ]          ← Flujos completos por rol
       [ Integración ]                  ← Auth → POS → Supabase
    [ Componentes React ]               ← Formularios, flujos UI
  [ Unit — Servicios / Helpers ]        ← Lógica pura, sin DOM / red
```

## Reglas de Código para Tests

- Un `describe` por clase o módulo; un `it` por comportamiento.
- Nombre de test = _qué debería pasar_ en español.
- Usar `beforeEach(() => localStorage.clear())` en tests que usan servicios con estado.
- Pasar `mockDelay: 0` al construir `MockPaymentService` para evitar esperas.
- No usar `any` ni `as unknown` en tests; tipar correctamente los fixtures.
- Preferir `vi.spyOn(Math, 'random').mockReturnValue(...)` sobre lógica aleatoria sin control.
- Usar `vi.restoreAllMocks()` en `beforeEach` o `afterEach` para no contaminar otros tests.

## Dominios con Cobertura Obligatoria

| Dominio | Archivo(s) clave | Tipo |
|---|---|---|
| **CLABE / FinTech** | `clabeService.ts` | Unit puro |
| **Pagos (mock)** | `MockPaymentService.ts` | Unit con localStorage |
| **Roles / Permisos** | `RoleService.ts` | Unit con localStorage |
| **Factory** | `factory.ts` | Unit |
| **Env validation** | `lib/env.ts` | Unit puro |
| **Auth** | `contexts/AuthContext.tsx`, `supabaseAuth.ts` | Integración |
| **RLS multi-tenant** | Supabase queries | E2E / integración |

## Convención de Archivos

```
src/
  services/
    __tests__/
      clabeService.test.ts
      MockPaymentService.test.ts
      RoleService.test.ts
      factory.test.ts
  lib/
    env.test.ts
  components/
    __tests__/
      [ComponenteName].test.tsx
```

Tests E2E van en `e2e/` en la raíz del proyecto (cuando Playwright se configure).

## Checkpoints (antes de hacer PR)

- [ ] `npm run test -- --run` pasa sin errores
- [ ] Cobertura de líneas ≥ umbral acordado por el equipo (iniciar en 40%, subir gradualmente)
- [ ] No hay tests ignorados (`it.skip`) sin issue de tracking adjunto
- [ ] Tests de regresión: si se corrige un bug, existe un test que lo reproduciría

## Flujos Críticos que Deben Tener Tests

### P0 — Bloquean deploy si fallan
1. `CLABEService.validate()` — genera y valida CLABEs correctamente
2. `MockPaymentService.processTransaction()` — deduce balance correcto, rechaza CLABE inválida
3. `MockPaymentService.refundTransaction()` — restaura balance exactamente
4. `RoleService.resolvePermissions()` — resuelve permisos en orden correcto (explícitos > customRole > base)
5. `RoleService.hasPermission()` — no permite falsos positivos de permisos

### P1 — Deben existir antes de staging
6. Auth context: login / logout / token expirado
7. POS checkout: flujo completo con puntos generados
8. Parent deposit: monto correcto acreditado
9. Aislamiento multi-tenant: usuario school_A no puede consultar datos school_B

### P2 — Antes de producción
10. Playwright E2E: 5 flujos críticos completos
11. Lighthouse CI: performance baseline por vista crítica

## Historial

- 2026-03-21: Skill creado como parte del plan de habilitación de pruebas v1.
  - Incluye unit tests para `CLABEService`, `MockPaymentService`, `RoleService`, `factory` y `env`.
