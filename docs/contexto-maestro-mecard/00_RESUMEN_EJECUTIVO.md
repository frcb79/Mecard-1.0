# 00. Resumen Ejecutivo — Auditoría Integral de MeCard

> **Proyecto:** MeCard — Plataforma Tecnológica Escolar & Fintech  
> **Equipo Auditor:** Senior Multidisciplinary Taskforce (CTO, Lead Full-Stack, PM, EdTech, Fintech, CISO, DevOps, Business Strategist, Technical Doc Architect)  
> **Fecha de Auditoría:** Octubre 2026 (Análisis de base de código Enero – Abril 2026)  
> **Commit de Referencia Principal:** `86a62c3` (`origin/main`)  
> **Ramas Analizadas:** `main` (activo), `origin/staging` (abandonado en commit `62db4a5`)  

---

## 1. Fotografía General del Proyecto

**MeCard** es una plataforma tecnológica integral para instituciones educativas privadas en México que combina **EdTech** (administración escolar, control de alumnos, familias, permisos de salida, excursiones y asistencia) con una capa **Fintech cerrada** (billetera digital prepago para alumnos, terminal Punto de Venta [POS] en cafeterías/papelerías, facturación y cobro automatizado de colegiaturas, programa de lealtad con puntos/gamificación, y regalos sociales entre alumnos).

### Semáforo de Estado Global

| Dominio | Estado | Diagnóstico Sintético |
|---|:---:|---|
| **Frontend & UI/UX** | 🟢 **95% Completo** | 53 rutas implementadas y navegables para 6 roles. Diseño refinado ("Bento Grid", Inter, paleta Verde-Azul/Esmeralda/Indigo). Alta fidelidad en pantallas de padres, alumnos, POS y administradores. |
| **Arquitectura de Base de Datos** | 🟢 **90% Diseñada** | 52 tablas PostgreSQL documentadas con políticas Row-Level Security (RLS) multi-tenant y 11 funciones RPC atómicas para evitar doble gasto (*double-spend*) y garantizar transacciones financieras seguras. |
| **Capa de Servicios y Lógica** | 🟡 **60% Híbrida** | Arquitectura con patrón Factory (`src/services/factory.ts`). Los flujos de POS, alumnos, recompensas y reembolsos tienen soporte Supabase; pero colegiaturas, torniquetes/accesos, pre-órdenes y reportes operan todavía en memoria o `localStorage` con mocks. |
| **Fintech & Pagos Reales** | 🔴 **0% Integrado (Diferido)** | La emisión de cuentas CLABE individuales por alumno sigue el estándar oficial de Banxico/STP (banco 646, plaza 180). Sin embargo, **no existen conexiones reales activas a pasarelas bancarias (STP, Stripe, Conekta)**. Los depósitos y cobros se simulan mediante `MockPaymentService.ts`. |
| **Control de Versiones y Git** | 🟡 **Deuda Detectada** | La rama `origin/staging` contiene **35 commits no integrados** a `main` desde Enero 2026, incluyendo un módulo completo de **Gestión de Proveedores y Órdenes de Compra** que quedó abandonado. |
| **Seguridad y Privacidad** | 🟡 **Riesgos Críticos Abiertos** | Se resolvieron 4 vulnerabilidades críticas a nivel base de datos (funciones atómicas e idempotentes), pero persisten 3 riesgos graves en frontend: API Key de Google Gemini expuesta en cliente, token JWT en `localStorage`, y fuga del saldo bancario del alumno en la búsqueda social de amigos. |

---

## 2. Respuestas Ejecutivas a las 12 Preguntas de Dirección

A continuación se da respuesta precisa y documentada a las 12 preguntas requeridas por la dirección del proyecto:

### 1. ¿Qué es MeCard y cuál es su visión actual documentada?
MeCard es un ecosistema operativo y financiero para colegios. Su visión documentada (en [metadata.json](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/metadata.json), [Diseño_MeCard.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/Diseño_MeCard.md) y [PROJECT_BRAIN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/PROJECT_BRAIN.md)) es eliminar el uso de dinero en efectivo en escuelas, dar control total y tranquilidad a los padres sobre el consumo y seguridad de sus hijos, optimizar la recaudación y finanzas de la institución, e incentivar hábitos financieros saludables y nutricionales mediante gamificación e inteligencia artificial.

### 2. ¿Qué tenemos desarrollado realmente?
Existe una aplicación web completa desarrollada en **React 19, Vite 6, TypeScript 5.7 y Tailwind CSS**, con **53 rutas protegidas**, divididas en 6 perfiles de acceso:
1. `SUPER_ADMIN`: Gestión global de colegios, monitoreo de cobranza, simulador comercial, configuración de facturación a colegios y bloqueos por impago.
2. `SCHOOL_ADMIN / SCHOOL_FINANCE`: Control de estudiantes, importador masivo por CSV con validación de CURP, asignación de CLABEs, gestión de colegiaturas, permisos de salida, excursiones y control de accesos.
3. `UNIT_MANAGER`: Panel del concesionario de cafetería/papelería, inventario, pronóstico de demanda de alimentos y personal.
4. `POS_OPERATOR / CASHIER`: Terminal punto de venta táctil con escaneo QR de credenciales, modo cafetería y papelería, venta sugerida por IA, canje de regalos y corte de caja.
5. `PARENT`: Portal familiar multi-hijo, recarga de billetera (tarjeta/SPEI), configuración de topes de gasto diario/categoría, autorización de permisos de salida con notificación cruzada a co-padre y pago de excursiones.
6. `STUDENT`: Dashboard personal, credencial digital con QR, historial de compras, wishlist/favoritos, colectas grupales ("vaquitas") de cumpleaños y canje de puntos en el marketplace.

### 3. ¿Qué funcionalidades están operativas y comprobadas?
- **Navegación y control de acceso (RBAC):** 16 pruebas automatizadas en [ProtectedRoute.test.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ProtectedRoute.test.tsx) pasando exitosamente.
- **Generación y validación algorítmica de CLABE:** Comprobada en [clabeService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/clabeService.test.ts) siguiendo la norma de Banxico.
- **Simulador de pagos y billetera (Mock):** Validado en [MockPaymentService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/MockPaymentService.test.ts).
- **Importación masiva de alumnos:** Parsing de CSV ([studentImportService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/studentImportService.ts)), validación sintáctica de CURP mexicano, email y teléfono a 10 dígitos.
- **Lógica de base de datos atómica:** Funciones SQL para cobro POS atómico (`process_pos_sale_atomic`) y reembolsos idempotentes (`settle_refund_idempotent`) en [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql).

### 4. ¿Qué funcionalidades están incompletas?
- **Colegiaturas y Cobranza Escolar:** [SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx) tiene toda la interfaz de usuario pero persiste los datos en `localStorage` ([SchoolFeeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/SchoolFeeService.ts)); no está conectado a Supabase.
- **Control de Accesos Físicos y Asistencia:** [SchoolAccessDashboard.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolAccessDashboard.tsx) opera sobre datos simulados; faltan los webhooks de hardware para torniquetes reales.
- **Pre-órdenes de cafetería:** El servicio [PreOrderService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/PreOrderService.ts) corre en mock a pesar de que la tabla `cafeteria_orders` ya fue creada en la migración `20260330`.
- **Integraciones Bancarias Reales:** No hay procesamiento bancario real de tarjetas ni recepción de webhooks SPEI.

### 5. ¿Qué trabajos quedaron abandonados en ramas o archivos?
- **En `origin/staging`:** El módulo completo de **Proveedores y Órdenes de Compra** ([SupplierManagementView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/components/SupplierManagementView.tsx), `supplierService.ts`, `purchaseOrderService.ts`, migraciones `003` y `004`), desarrollado en Enero 2026 con 35 commits, nunca se integró a `main` cuando se reestructuró la carpeta `src/`.
- **En la carpeta `src/_phase2/`:** Existen 10 componentes con conexiones directas a servicios de Supabase (Campus POSTab, GiftInbox, GiftSender, RewardsMarketplace, etc.) que quedaron aislados mientras las vistas principales mantuvieron implementaciones locales.
- **En la raíz del proyecto:** Archivos huérfanos como `types.ts` (31 KB desactualizado frente a `src/types.ts` de 68 KB), la carpeta `hooks/` (4 archivos en raíz frente a 19 en `src/hooks/`) y `pages/` (Login y Unauthorized desincronizados).

### 6. ¿Qué decisiones estratégicas y comerciales se han tomado?
- **Modelo de Negocio Parametrizable:** Se han modelado formalmente tres esquemas comerciales en [CommercialSimulator.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx):
  1. *Modelo A (Renta Fija):* $25k setup, $5,000/mes renta, 3% comisión cafetería, 3.5% tarjeta, $8 SPEI, $140 credencial anual.
  2. *Modelo B (SaaS Alumno):* $15k setup, $45/mes por alumno, 3% comisión cafetería, 3.5% tarjeta, $8 SPEI.
  3. *Modelo C (Comisión Pura):* $0 setup, $0 renta, 8% comisión cafetería, 5% tarjeta, $8 SPEI.
- **Fuentes Adicionales de Ingreso:** Explotación de float financiero (rendimiento bancario del ~10.5% anual en saldos no ejercidos), saldo no reclamado (*breakage* ~6%) y reposición de credenciales extraviadas ($80 MXN).
- **Hipótesis de Optimización de Costos de Procesamiento:** Hipótesis reciente para negociar adquirencia de bajo costo y compartir el diferencial entre el colegio y MeCard; se encuentra **documentada únicamente a nivel conceptual en simulación**, no formalizada con proveedores financieros.
- **Decisión de Go-Live Escalonado (2026-03-30):** Lanzar primero una versión operativa completa en escuelas piloto con pagos simulados/cerrados antes de abrir la integración bancaria SPEI real.

### 7. ¿Qué información todavía necesitamos recuperar?
- Las transcripciones y acuerdos previos de las sesiones de **Gemini y Claude** que contienen conversaciones de producto entre el fundador y los agentes anteriores (pendiente de entrega por el usuario).
- La definición de la **entidad legal y regulatoria** en México para la captación de fondos (si operará mediante una IFPE/Fintech regulada, mediante un fideicomiso, o a través de un agregador tipo STP/Conekta).
- El contrato o acuerdo marco con los proveedores de credenciales físicas (tarjetas PVC con chip RFID/NFC o código QR impreso).

### 8. ¿Qué riesgos tecnológicos, financieros, operativos o de seguridad existen?
- **Seguridad (Crítico):** La variable `VITE_GEMINI_API_KEY` se lee directamente en el cliente ([geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts)), exponiendo la clave de Google en el paquete JavaScript público.
- **Privacidad (Crítico):** En [supabaseSocial.ts:L15](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts#L15), la búsqueda de amigos incluye el campo `balance`, permitiendo a cualquier alumno consultar el saldo económico de otros compañeros.
- **Legal/Regulatorio:** Manejo de datos personales y biométricos de menores de edad conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) en México.
- **Operativo/Financiero:** Si la base de datos de producción no tiene ejecutadas las funciones atómicas de [SECURITY_FIXES_PHASE1.sql](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql), un alumno podría efectuar compras concurrentes en el POS sin tener saldo suficiente (*double-spending*).

### 9. ¿Qué falta para tener una primera versión comercializable?
1. Resolver los 3 bloqueantes de seguridad P0 (mover Gemini a Edge Functions, remover fuga de saldo y auditar RLS).
2. Conectar a Supabase los módulos escolares que siguen en `localStorage` (Colegiaturas y Pre-órdenes).
3. Desplegar y validar el esquema de 52 tablas y las 11 funciones RPC atómicas en la instancia real de Supabase.
4. Ejecutar el script [seed-qa-data.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/seed-qa-data.mjs) y validar el flujo operativo completo en un colegio de prueba (UAT).
5. Formalizar si el lanzamiento inicial se hace con recargas manuales/referenciadas en ventanilla escolar o con pasarela bancaria.

### 10. ¿Qué recomendamos hacer primero, segundo y tercero?
1. **Primero (Semana 1 - P0 Seguridad & Higiene):** Subsanar la fuga de saldo en `supabaseSocial.ts`, mover llamadas de Gemini a funciones protegidas o aislar la key, y limpiar los archivos duplicados de la raíz (`types.ts`, `hooks/`, `pages/`).
2. **Segundo (Semana 2 - P1 Operación Real):** Ejecutar las migraciones SQL pendientes en la base de datos de staging de Supabase, conectar `SchoolFeesManager` y `PreOrderService` a tablas reales, y correr la validación UAT punta a punta (Días 3 al 10 del plan de go-live).
3. **Tercero (Semana 3-4 - P2 Rescate & Conexión Fintech):** Recuperar el módulo de Proveedores y Órdenes de Compra desde `origin/staging` hacia `src/components/`, y definir la pasarela bancaria (STP o Stripe) para depósitos reales con tarjeta y SPEI.

### 11. ¿Dónde está cada documento generado?
Toda la documentación maestra se encuentra en la carpeta:  
[`docs/contexto-maestro-mecard/`](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/)  
Navegable de forma centralizada mediante [INDEX.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/INDEX.md).

### 12. ¿Cuál es el documento principal que debemos llevar a GPT-6?
El archivo [12_CONTEXTO_PARA_GPT6.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/12_CONTEXTO_PARA_GPT6.md). Ha sido diseñado de forma autónoma, densa y sin ambigüedades técnicas para que ChatGPT GPT-6 pueda absorber el 100% de la arquitectura, decisiones, estado actual y prioridades en un único prompt de inicio.
