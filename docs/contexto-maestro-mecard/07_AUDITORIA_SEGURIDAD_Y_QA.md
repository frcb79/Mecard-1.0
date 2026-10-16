# 07. Auditoría de Seguridad, Privacidad y Control de Calidad (QA)

> **Fuentes de Evidencia:** [SECURITY_IMPLEMENTATION_REPORT.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_IMPLEMENTATION_REPORT.md), [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql), [docs/skills/security/README.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/skills/security/README.md), [docs/skills/legal/README.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/skills/legal/README.md), [docs/skills/testing/README.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/skills/testing/README.md) y código fuente.

---

## 1. Vulnerabilidades Críticas Resueltas vs. Pendientes

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ESTADO DE SEGURIDAD DE LA PLATAFORMA                 │
├──────────┬────────────────────────────────────────┬────────────────────┤
│ CÓDIGO   │ DESCRIPCIÓN DEL RIESGO                 │ ESTADO ACTUAL      │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ CRIT-001 │ Falta de atomicidad en POS             │ 🟢 RESUELTO (SQL)  │
│          │ (Riesgo de doble gasto / double-spend) │ RPC atómica creada │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ CRIT-002 │ Fuga multi-tenant entre colegios       │ 🟢 RESUELTO (SQL)  │
│          │ (Políticas RLS incompletas)            │ WITH CHECK forzado │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ CRIT-003 │ Reembolsos duplicados por concurrencia │ 🟢 RESUELTO (SQL)  │
│          │ (Falta de idempotencia y bloqueo)      │ settle_idempotent  │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ CRIT-004 │ Montos negativos en aportaciones/POS   │ 🟢 RESUELTO (SQL)  │
│          │ (Inyección de saldos negativos)        │ CHECK constraints  │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ VULN-P01 │ Clave API de Gemini expuesta en cliente│ 🔴 RIESGO ABIERTO  │
│          │ (VITE_GEMINI_API_KEY en bundle JS)     │ Requiere proxy     │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ VULN-P02 │ Fuga de saldo en búsqueda social       │ 🔴 RIESGO ABIERTO  │
│          │ (supabaseSocial.ts:15 expone balance)  │ Remover 'balance'  │
├──────────┼────────────────────────────────────────┼────────────────────┤
│ VULN-P03 │ Token JWT guardado en localStorage     │ 🟡 RIESGO MEDIO    │
│          │ (Vulnerable ante ataques XSS)          │ Migrar a httpOnly  │
└──────────┴────────────────────────────────────────┴────────────────────┘
```

---

## 2. Detalle de Vulnerabilidades Abiertas y Plan de Remediación

### A. VULN-P01: API Key de Google Gemini Expuesta en el Bundle del Navegador
- **Evidencia:** [src/services/geminiService.ts:L9-L14](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts#L9-L14):
  ```typescript
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || 'placeholder-key' });
  ```
- **Impacto:** En el modelo de Vite, cualquier variable que comience con `VITE_` se incrusta en texto plano en el archivo JavaScript distribuido a los navegadores de los usuarios. Cualquier estudiante o usuario con conocimientos básicos de inspección de red puede extraer la clave y utilizarla fuera de la plataforma, consumiendo cuotas y generando facturación no autorizada en Google Cloud.
- **Acción Correctiva Obligatoria:** Mover la inicialización de `@google/genai` a una **Supabase Edge Function** (`supabase/functions/gemini-advisor/index.ts`). El frontend debe invocar la función autenticada sin conocer la API key.

### B. VULN-P02: Exposición del Saldo Económico de Alumnos en la Búsqueda Social
- **Evidencia:** [src/services/supabaseSocial.ts:L15](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts#L15):
  ```typescript
  .select('id, full_name, student_id, school_id, grade, balance, status')
  ```
- **Impacto:** Cuando un alumno busca a un compañero para enviarle un regalo de cumpleaños o cafetería, la consulta devuelve el campo `balance`. Esto permite que un alumno conozca el saldo exacto en dinero que tienen sus compañeros de clase, lo cual constituye una violación flagrante a la privacidad escolar y puede propiciar situaciones de discriminación, acoso o extorsión escolar.
- **Acción Correctiva Obligatoria:** Editar de inmediato la consulta en `supabaseSocial.ts` para eliminar la columna `balance` de la proyección `SELECT`.

### C. VULN-P03: Almacenamiento de Sesión en `localStorage`
- **Evidencia:** [src/contexts/AuthContext.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/contexts/AuthContext.tsx) y configuración predeterminada de `supabaseClient.ts`.
- **Impacto:** Los tokens de autenticación almacenados en `localStorage` son accesibles por cualquier script ejecutado en el contexto de la ventana (vulnerabilidad ante Cross-Site Scripting).
- **Acción Correctiva:** Configurar el cliente de Supabase para almacenar las cookies de sesión con flags `HttpOnly`, `Secure` y `SameSite=Lax`.

---

## 3. Privacidad y Marco Normativo en México (LFPDPPP)

MeCard gestiona una categoría altamente sensible de información: **datos de menores de edad (niños y adolescentes) combinados con información financiera y biométrica**.

### Consideraciones Legales Identificadas (No constituyen asesoría legal formal):
1. **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP):**
   - **Consentimiento Expreso:** El tratamiento de datos de menores exige el consentimiento expreso y por escrito o electrónico verificable de los padres o tutores legales.
   - **Aviso de Privacidad Integral Escolar:** Debe redactarse y publicarse un Aviso de Privacidad específico que detalle que los datos no se compartirán con fines comerciales ni se comercializarán a terceros adquirentes de publicidad.
2. **Fotografías y Credenciales de Menores:**
   - Las imágenes de los alumnos almacenadas en el bucket de storage de Supabase deben contar con URLs firmadas con expiración temporal (`createSignedUrl`) y no con acceso público universal.
3. **Restricción de Acceso a Concesionarios:**
   - El personal de cafetería o papelería únicamente debe ver el nombre de pila, foto para verificación visual y alérgenos alimentarios en el POS. **Bajo ninguna circunstancia deben tener acceso a domicilios, teléfonos o datos patrimoniales de los padres.**

---

## 4. Estado de Pruebas Automatizadas y Calidad de Código (QA)

### Cobertura de Pruebas Existente

| Suite de Prueba | Archivo de Prueba | Cobertura / Casos Evaluados | Resultado |
|---|---|---|:---:|
| **Control de Acceso y Rutas** | [src/components/ProtectedRoute.test.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ProtectedRoute.test.tsx) | 16 escenarios: loading, desautenticado, roles denegados (SuperAdmin, SchoolAdmin, Parent, Student), permisos. | 🟢 **16/16 PASS** |
| **Generador de Cuentas CLABE** | [src/services/__tests__/clabeService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/clabeService.test.ts) | 4 escenarios: longitud 18 dígitos, código Banxico 646, ponderaciones de módulo 10 y rechazo de dígito inválido. | 🟢 **PASS** |
| **Simulador de Pagos POS** | [src/services/__tests__/MockPaymentService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/MockPaymentService.test.ts) | 8 escenarios: saldo insuficiente, CLABE malformada, decremento de balance, orden válida. | 🟢 **PASS** |
| **Gestor de Roles y Permisos** | [src/services/__tests__/RoleService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/RoleService.test.ts) | Permisos granulares de Super Admin, finanzas y cajeros. | 🟢 **PASS** |
| **Factory de Servicios** | [src/services/__tests__/factory.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/factory.test.ts) | Creación singleton, cambio de mocks a servicios reales según env flags. | 🟢 **PASS** |
| **Validación de Entorno** | [src/lib/env.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/env.test.ts) | Detección de llaves placeholder de Supabase y modo estricto. | 🟢 **PASS** |
| **Logger Centralizado** | [src/lib/logger.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/logger.test.ts) | Emisión de eventos `mecard:log`, normalización de errores nativos y niveles de log. | 🟢 **PASS** |
| **Telemetría Frontend** | [src/lib/telemetry.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/telemetry.test.ts) | Envío batch de eventos de error a endpoints de observabilidad. | 🟢 **PASS** |

### Vacíos en la Pirámide de Testing:
- **Pruebas End-to-End (E2E):** No existe framework de pruebas E2E instalado (como Playwright o Cypress). Todo el testing de flujos entre múltiples ventanas (ej. padre recarga -> alumno gasta en POS -> concesionario corta caja) se ha realizado de forma manual según los protocolos de [TEST_PLAN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/TEST_PLAN.md).
- **Pruebas sobre Supabase Real:** Los tests unitarios corren con mocks en memoria; no hay una suite de integración con base de datos de test efímera en Docker.
