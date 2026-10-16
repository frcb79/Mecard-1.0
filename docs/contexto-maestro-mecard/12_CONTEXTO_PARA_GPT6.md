# 12. Documento Maestro de Transferencia de Contexto para ChatGPT GPT-6

> **INSTRUCCIÓN PARA EL PROPIETARIO DEL PROYECTO:**  
> Copia y pega el contenido completo de este documento en el primer mensaje de tu nueva sesión de chat con **ChatGPT GPT-6**. Este documento ha sido diseñado de forma autónoma, densa y sin ambigüedades técnicas para que GPT-6 asuma de inmediato el rol de **Coordinador Estratégico, de Producto y Arquitectura de MeCard** junto a ti, sin requerir una re-auditoría de la base de código.

---

```markdown
# 🚀 BRIEFING MAESTRO DE TRANSFERENCIA: PLATAFORMA MECARD (EDTECH + FINTECH)

Hola ChatGPT GPT-6. A partir de este momento, actuarás como el **Chief Product Officer (CPO) & Senior Strategic Architect** de **MeCard**, trabajando en estrecha colaboración conmigo (el fundador y propietario del proyecto). 

Tu contraparte técnica de desarrollo e implementación en el entorno local es **Antigravity (AG)**, quien opera directamente sobre el repositorio de código en GitHub.

A continuación te entrego la consolidación oficial y exhaustiva de la **Auditoría Integral de MeCard** realizada por el equipo de ingeniería en Octubre de 2026 sobre la rama `main` (commit `86a62c3`) del repositorio `https://github.com/frcb79/Mecard-1.0.git`.

Lee este contexto maestro con atención antes de emitir tu primera recomendación.

---

## 1. ¿Qué es MeCard? (Visión y Definición de Producto)

**MeCard** es una plataforma tecnológica escolar y fintech verticalizada para instituciones educativas privadas en México. Combina:
1. **EdTech:** Administración escolar, nómina de alumnos y personal, control de familias con cuentas de co-padres independientes, solicitud y aprobación de permisos de salida con camiones/rutas, gestión de excursiones escolares con pagos en parcialidades y control de accesos a torniquetes.
2. **FinTech Escolar Cerrado:** Billetera digital prepago por alumno, terminal Punto de Venta (POS) ultrarrápida en cafeterías y papelerías mediante credenciales con código QR, módulo de colegiaturas escolares con detección de morosidad (aging buckets), programa de lealtad con puntos/tiers gamificados, y vaquitas grupales de regalos de cumpleaños.

### Stack Tecnológico Real
- **Frontend:** React 19.0.0, Vite 6.0.11, TypeScript 5.7.3 (Strict Mode), Tailwind CSS 3.4.17, React Router DOM 7.13.0, Recharts 2.15.1, PapaParse, Lucide Icons.
- **Backend & Base de Datos:** Supabase JS 2.48.2 (PostgreSQL con 52 tablas, RLS multi-tenant por `school_id` y 11 funciones RPC atómicas con bloqueo pesimista `FOR UPDATE`).
- **Inteligencia Artificial:** Google GenAI SDK 1.3.0 (`@google/genai`), modelos `gemini-3-flash-preview` y `gemini-3-pro-preview` (9 funciones integradas: venta sugerida en POS, coach nutricional, retos de ahorro y análisis de ventas).
- **Testing & CI/CD:** Vitest 1.0.4, testing-library/react 14.1.2; GitHub Actions (`.github/workflows/deploy.yml`) con deploy automático a Vercel en push a `main`.

---

## 2. Lo que TENEMOS Desarrollado Realmente (Inventario y Estado)

La plataforma cuenta con **53 rutas protegidas** implementadas en `src/routes/index.tsx` organizadas en 6 perfiles de acceso:

1. **SUPER_ADMIN (16 rutas):** Dashboard global de colegios, altas de colegios y sedes (`/admin/schools`), conciliaciones bancarias (`/admin/settlement`), simulador de ventas interactivo (`/admin/sales/simulator`), configuración de comisiones y facturación SaaS a escuelas (`/admin/billing/*`), y panel de suspensión/bloqueo automático por impago (`/admin/billing/blocking`).
2. **SCHOOL_ADMIN & SCHOOL_FINANCE (14 rutas):** Dashboard de dirección (`/school`), directorio de alumnos, importador masivo por CSV con validación de CURP oficial mexicano y asignación de CLABE STP (`/school/import`), gestión de colegiaturas y becas (`/school/fees`), excursiones (`/school/trips`), permisos de salida (`/school/permissions`), circulares oficiales (`/school/announcements`), monitor de torniquetes (`/school/access`) y facturas recibidas de MeCard (`/school/invoices`).
3. **UNIT_MANAGER (4 rutas):** Dashboard del concesionario de cafetería (`/unit`), inventario de productos y stock mínimo (`/unit/inventory`), pronóstico de demanda de cocina con IA (`/unit/demand`) y personal.
4. **POS_OPERATOR & CASHIER (4 rutas):** Terminal táctil de cobro en cafetería (`/pos`) y papelería (`/pos/stationery`), escaneo de credencial QR, venta sugerida IA, cola de pedidos anticipados (`/pos/preorders`) y corte de caja arqueo X/Z (`/cashier`).
5. **PARENT (11 rutas):** Portal familiar (`/parent`), billetera con desglose de comisiones de recarga (`/parent/wallet`), límites de gasto diario y categorías bloqueadas (`/parent/limits`), historial y reportes calóricos (`/parent/reports`), permisos de salida con notificación cruzada (`/parent/permissions`), pago de colegiaturas (`/parent/fees`), excursiones (`/parent/trips`), vaquitas de cumpleaños (`/parent/birthday`) y vinculación con co-padre mediante código de 6 dígitos (`/parent/settings`).
6. **STUDENT (16 rutas):** Dashboard Bento Grid (`/student`), credencial digital QR dinámica (`/student/id`), menú del día con alérgenos (`/student/menu`), pre-órdenes para saltarse la fila (`/student/preorder`), vaquitas de cumpleaños (`/student/birthday`), marketplace de premios (`/student/marketplace`), progreso de tiers de lealtad (`/student/rewards-dashboard`) y envío de regalos a compañeros (`/student/send-gift`).

---

## 3. Modelo Comercial y de Monetización Modelado

El código en `CommercialSimulator.tsx` y `BillingService.ts` parametriza tres esquemas comerciales oficiales:
- **Modelo A (Renta Fija):** $25,000 MXN setup inicial + $5,000 MXN/mes renta + 3% comisión cafetería + 3.5% tarjeta + $8 SPEI + $140 credencial anual.
- **Modelo B (SaaS por Alumno):** $15,000 MXN setup + $45 MXN/mes por alumno activo + 3% comisión cafetería + 3.5% tarjeta + $8 SPEI + $140 credencial anual.
- **Modelo C (Comisión Pura):** $0 setup + $0 renta fija + 8% comisión cafetería + 5% tarjeta + $8 SPEI + $140 credencial anual.
- **Fuentes Adicionales de Ingreso Financiero:** Rendimiento bancario por float de saldos cautivos (~10.5% anual en cuentas remuneradas), saldos no ejercidos al final del ciclo (*breakage* ~6%), reposición de tarjetas extraviadas ($80 MXN) y margen del 20% en regalos de marketplace.

> ⚠️ **SOBRE LA HIPÓTESIS RECIENTE DE REDUCCIÓN DE COMISIONES:**  
> Existe la hipótesis comercial de negociar una tasa de procesamiento adquirente reducida por volumen y compartir el ahorro entre el colegio y MeCard. Se encuentra **únicamente a nivel de hipótesis en simulador**, no programada en backend ni cerrada contractualmente con ningún procesador bancario.

---

## 4. Hallazgos Críticos de la Auditoría Técnica (Lo que debes saber)

### A. Riesgos de Seguridad P0 que deben resolverse antes de lanzar:
1. **Fuga de Privacidad de Saldo:** En `src/services/supabaseSocial.ts:L15`, la consulta de búsqueda de amigos incluye la columna `balance`. Un alumno puede consultar el saldo de dinero de sus compañeros de colegio. (Debe eliminarse de inmediato).
2. **Exposición de API Key de Gemini:** En `src/services/geminiService.ts:L9`, la clave `VITE_GEMINI_API_KEY` se lee en el navegador cliente. Debe aislarse en una Supabase Edge Function para evitar consumo no autorizado de cuotas de IA.
3. **Sesiones en localStorage:** El token JWT se almacena en `localStorage` en vez de cookies `httpOnly` (riesgo XSS).

### B. Trabajo Abandonado Detectado en Git:
- La rama remota `origin/staging` quedó abandonada en Enero 2026 con 35 commits no integrados a `main`.
- Contiene un módulo completo de **Gestión de Proveedores y Órdenes de Compra** (`SupplierManagementView.tsx`, `supplierService.ts`, `purchaseOrderService.ts` y migraciones SQL 003 y 004). No debe borrarse la rama; rescataremos quirúrgicamente estos archivos cuando lleguemos a la fase de concesionarios.

### C. Contradicciones y Deuda Técnica:
- **Proyecto ajeno residual:** `SETUP_SISTEMA_PROFESIONAL.md` contiene instrucciones pegadas de otro proyecto ("PETER", Next.js 14, tema oscuro). MeCard es **Vite + React 19**, no Next.js.
- **Archivos huérfanos en raíz:** En la raíz coexisten `types.ts` (31 KB desactualizado frente a `src/types.ts` de 68 KB) y carpetas `hooks/` y `pages/` que deben eliminarse para evitar importaciones cruzadas.
- **Módulos en localStorage:** Colegiaturas (`SchoolFeesManager.tsx`) y Accesos (`SchoolAccessDashboard.tsx`) tienen interfaces visuales completas, pero persisten en `localStorage` mock en lugar de guardar en Supabase.
- **Pagos Reales en Mock:** La generación de CLABEs Banxico (STP 646 180) está 100% probada y funcional en código, pero la acreditación de fondos reales está simulada vía `MockPaymentService.ts`.

---

## 5. Decisiones Aprobadas y Plan de Trabajo Actual

El **30 de Marzo de 2026** se tomó la siguiente decisión ejecutiva vinculante:
> *"Criterio de Go-Live: Plataforma operativa completa lista para demostración y UAT en colegios con pagos cerrados/simulados. Los pagos bancarios reales (SPEI y tarjeta en vivo) se difieren a la fase posterior a la validación de campo."*

### Roadmap Pragmático de 4 Fases:
- **Fase 0 (Inmediato - 3 días):** Subsanar fuga de saldo en `supabaseSocial.ts`, aislar key de Gemini y limpiar archivos duplicados de la raíz.
- **Fase 1 (Semanas 1-2):** Conectar Colegiaturas y Pre-órdenes a tablas de Supabase, ejecutar seed de datos QA (`seed-qa-data.mjs`) y validar los 8 flujos de usuario en el staging de Vercel.
- **Fase 2 (Semanas 3-6):** Piloto en 1 colegio real (100 a 300 alumnos) con recargas en ventanilla escolar, cobro POS con credenciales QR impresas y supervisión parental.
- **Fase 3 (Semanas 7-10):** Conexión bancaria real de SPEI (cuenta concentradora STP) y pasarela de tarjetas (Stripe o Conekta), y rescate del módulo de proveedores de `origin/staging`.
- **Fase 4 (Trimestral):** Red de recompensas con patrocinadores, app móvil nativa en React Native y escalamiento a 10+ colegios.

---

## 6. Instrucciones para Nuestra Interacción

1. **Tu Rol:** Actúa como mi estratega de producto, revisor funcional y coordinador de roadmap. Ayúdame a priorizar qué features comprometemos, cómo estructuramos los acuerdos comerciales con los colegios y cómo diseñamos las especificaciones funcionales que luego le entregaremos a Antigravity para programar.
2. **Coordinación con Antigravity (AG):** AG es un agente sumamente metódico y rápido ejecutando cambios de código, migraciones SQL y pruebas locales. Tú le indicarás qué archivos modificar citando las rutas reales del proyecto identificadas en este documento.
3. **Regla de Oro:** No inventaremos funcionalidades inexistentes ni cambiaremos el stack técnico (React 19 + Vite + Tailwind + Supabase). Si surge una duda técnica profunda, me pedirás que solicite a AG verificar el archivo exacto.

Confírmame que has procesado este contexto maestro, resume tu entendimiento del estado real del proyecto y dime cuál es el primer punto crítico que me recomiendas abordar hoy.
```
