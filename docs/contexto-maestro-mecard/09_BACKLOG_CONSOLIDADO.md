# 09. Backlog Consolidado y Deuda Técnica de MeCard

> **Criterio de Priorización Obligatorio:**
> - **P0 — Bloqueantes Críticos:** Seguridad, integridad financiera, fugas de privacidad o fallos que impiden la operación básica.
> - **P1 — Requisitos de Lanzamiento (MVP UAT):** Funcionalidades comprometidas para la primera versión utilizable en escuelas piloto.
> - **P2 — Mejoras Posteriores:** Optimizaciones de arquitectura, recuperación de módulos secundarios y automatizaciones.
> - **P3 — Futuras / Exploratorias:** Ideas de negocio de largo plazo, red multi-colegio y aplicaciones móviles nativas.

---

## 1. Tareas Prioridad P0: Bloqueantes Críticos y Seguridad

| ID | Tarea / Hallazgo | Componentes / Archivos Afectados | Esfuerzo Estimado | Criterio de Aceptación |
|---|---|---|:---:|---|
| **P0-1** | **Eliminar fuga de saldo en búsqueda social de amigos** | [src/services/supabaseSocial.ts:L15](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts#L15) | 1 hora | El query `SELECT` a la tabla `students` no debe incluir la columna `balance`. Ningún alumno puede inspeccionar fondos ajenos. |
| **P0-2** | **Aislar API Key de Gemini mediante Edge Function** | [src/services/geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts), crear `supabase/functions/gemini-proxy` | 1 día | Ninguna variable `VITE_GEMINI_API_KEY` debe estar en el bundle de Vite. Las llamadas pasan por un endpoint intermedio autenticado. |
| **P0-3** | **Desplegar y verificar funciones atómicas en Supabase de Staging/Prod** | [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql), `20260327_admin_ops_rpcs.sql` | 4 horas | Ejecutar script en la base de datos viva y validar que `process_pos_sale_atomic` rechaza compras concurrentes con saldo cero. |
| **P0-4** | **Limpieza de archivos huérfanos y duplicados en raíz** | Eliminar/archivar `types.ts` raíz, `hooks/` raíz y `pages/` raíz | 2 horas | La aplicación compila con cero errores y todos los imports apuntan unívocamente a `src/types.ts` y `src/hooks/`. |

---

## 2. Tareas Prioridad P1: Requisitos de Lanzamiento (MVP Escuela Piloto)

| ID | Tarea / Requisito | Componentes / Archivos Afectados | Esfuerzo Estimado | Criterio de Aceptación |
|---|---|---|:---:|---|
| **P1-1** | **Migrar persistencia de Colegiaturas a Supabase** | [SchoolFeeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/SchoolFeeService.ts), [SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx), crear tablas `school_fees`, `fee_payments` | 2-3 días | Las colegiaturas, becas y pagos se guardan en Supabase con RLS por `school_id` y no se pierden al limpiar el navegador. |
| **P1-2** | **Conectar Pre-Órdenes a tabla `cafeteria_orders`** | [PreOrderService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/PreOrderService.ts), [PreOrderQueueView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/PreOrderQueueView.tsx) | 1 día | Los pedidos anticipados se guardan en la tabla SQL `cafeteria_orders` y se reflejan en tiempo real en la cola del POS de cafetería. |
| **P1-3** | **Ejecutar Seed de Datos QA y validar UAT (Días 3 al 10)** | [scripts/seed-qa-data.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/seed-qa-data.mjs), [docs/project/DAY2_E2E_PLAN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DAY2_E2E_PLAN.md) | 2 días | Probar con 1 colegio, 3 sedes, 50 alumnos, 20 productos y credenciales QA en entorno de staging en Vercel. |
| **P1-4** | **Consolidar componentes de `src/_phase2/`** | [src/_phase2/](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/_phase2/) vs [src/components/](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/) | 1 día | Integrar definitivamente los componentes de regalos y marketplace de `_phase2/` en la estructura principal eliminando duplicidades. |
| **P1-5** | **Aviso de Privacidad y Consentimiento de Menores (LFPDPPP)** | Componente modal de primer inicio en `ParentPortalContainer.tsx` | 1 día | Los padres deben aceptar formalmente el Aviso de Privacidad y consentimiento de uso de datos escolares antes de activar al alumno. |

---

## 3. Tareas Prioridad P2: Mejoras Importantes Posteriores (Fase 2)

| ID | Tarea / Requisito | Componentes / Archivos Afectados | Esfuerzo Estimado | Criterio de Aceptación |
|---|---|---|:---:|---|
| **P2-1** | **Rescate del Módulo de Proveedores y Órdenes de Compra** | Traer desde `origin/staging` (`SupplierManagementView.tsx`, `supplierService.ts`, `purchaseOrderService.ts`) | 2 días | El concesionario de cafetería puede dar de alta proveedores y registrar compras de insumos para actualizar stock automáticamente. |
| **P2-2** | **Conexión de Pasarela de Pagos Real (Stripe / Conekta)** | [src/services/SupabasePaymentService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/SupabasePaymentService.ts), [ParentWalletView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentWalletView.tsx) | 1 semana | Los padres pueden pagar con tarjeta de crédito/débito real con tokenización PCI-DSS y saldo acreditado en la cuenta del colegio. |
| **P2-3** | **Conexión de Webhooks SPEI con STP** | [src/services/clabeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/clabeService.ts), Endpoint backend de recepción STP | 1-2 semanas | Una transferencia electrónica de un padre hacia la CLABE del alumno acredita el saldo en tiempo real mediante webhook firmado. |
| **P2-4** | **Implementación de Suite Automatizada E2E con Playwright** | Configuración de Playwright, GitHub Actions workflow | 3 días | Tests automatizados que simulen el recorrido completo: Login Padre -> Depósito -> Venta POS -> Descuento de saldo. |
| **P2-5** | **Migración de Sesiones JWT a Cookies `HttpOnly`** | [AuthContext.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/contexts/AuthContext.tsx), [supabaseClient.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/supabaseClient.ts) | 2 días | Eliminar el token de autenticación del `localStorage` para blindar la app contra ataques XSS. |
| **P2-6** | **Notificaciones Externas por WhatsApp / SMS (Twilio)** | `notificationService.ts`, vinculación con co-padre y salidas | 3 días | Avisos inmediatos al celular de los padres cuando su hijo sale de la escuela o realiza compras. |

---

## 4. Tareas Prioridad P3: Funcionalidades Futuras o Exploratorias

| ID | Tarea / Requisito | Justificación y Dependencias | Horizonte |
|---|---|---|:---:|
| **P3-1** | **Aplicación Móvil Nativa (iOS / Android)** | Construir app en React Native / Expo reutilizando los servicios y tipos TypeScript para permitir notificaciones push nativas y NFC en teléfono. | Q3-Q4 2027 |
| **P3-2** | **Intercambio de Regalos Multi-Colegio (Cross-School)** | Permitir que alumnos de diferentes colegios de la red MeCard puedan enviarse regalos; requiere fideicomiso de liquidación inter-escuelas. | Post-Escala |
| **P3-3** | **Hardware SDK para Torniquetes Biométricos** | Conexión directa mediante firmware local o Raspberry Pi para torniquetes con reconocimiento facial o huella dactilar. | Según demanda |
| **P3-4** | **Mecanismo de Escrow para Excursiones de Alto Costo** | Fideicomiso digital que congele fondos de viajes hasta que la agencia proveedora cumpla los hitos del itinerario escolar. | Fase Financiera Avanzada |
