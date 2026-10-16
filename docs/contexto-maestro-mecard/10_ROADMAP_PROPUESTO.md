# 10. Roadmap Propuesto de Continuidad y Operación

> **Directriz de Elaboración:** Este roadmap no presenta fechas calendáricas arbitrarias ni presupuestos inventados. Se estructura en **etapas de madurez técnica y operativa verificable**, con hitos de salida (*exit criteria*) claros para cada fase.

---

## 1. Visión General del Roadmap por Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│                     ROADMAP DE MADURACIÓN MECARD                       │
├─────────────┬───────────────────────────┬──────────────────────────────┤
│ FASE        │ ENFOQUE PRINCIPAL         │ OBJETIVO DE NEGOCIO          │
├─────────────┼───────────────────────────┼──────────────────────────────┤
│ FASE 0      │ Blindaje P0 & Limpieza    │ Eliminar riesgos de seguridad│
│ (Inmediato) │ de Repositorio            │ y estabilizar la base activa │
├─────────────┼───────────────────────────┼──────────────────────────────┤
│ FASE 1      │ MVP Operativo & UAT       │ Validar el 100% de los flujos│
│ (2 semanas) │ (Pagos Mock / Cerrados)   │ con directores y familias    │
├─────────────┼───────────────────────────┼──────────────────────────────┤
│ FASE 2      │ Piloto en Colegio Real    │ Operación real en 1 colegio  │
│ (1 mes)     │ (Recargas en Ventanilla)  │ con credenciales físicas     │
├─────────────┼───────────────────────────┼──────────────────────────────┤
│ FASE 3      │ Integración FinTech       │ Conexión bancaria real       │
│ (1-2 meses) │ (SPEI STP + Tarjetas)     │ para recargas automáticas    │
├─────────────┼───────────────────────────┼──────────────────────────────┤
│ FASE 4      │ Escalamiento & Red        │ Expansión comercial a 10+    │
│ (Trimestral)│ Multi-Colegio             │ colegios y app móvil nativa  │
└─────────────┴───────────────────────────┴──────────────────────────────┘
```

---

## 2. Desglose Detallado por Fase

### Fase 0: Seguridad Crítica e Higiene de Repositorio (Inmediato — Esfuerzo: 2 a 3 días)
- **Objetivo:** Cerrar vulnerabilidades abiertas de privacidad y costos de IA antes de que cualquier usuario externo toque la plataforma.
- **Entregables Técnicos:**
  1. `supabaseSocial.ts`: Eliminar `balance` del query de búsqueda de amigos.
  2. `geminiService.ts`: Mover la API Key de Google a una función backend o aislarla.
  3. Limpieza de raíz: Eliminar `types.ts`, `hooks/` y `pages/` huérfanos que provocan ambigüedades.
- **Hito de Salida (Gate):** Zero vulnerabilidades críticas abiertas; build de Vite limpio en CI sin warnings de tipado.

### Fase 1: MVP Operativo y Validación UAT (Esfuerzo: 2 semanas)
- **Objetivo:** Cumplir la decisión estratégica del 2026-03-30: *"Plataforma lista para demostración y UAT con pagos cerrados"*.
- **Entregables Técnicos:**
  1. Conectar [SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx) a tablas de Supabase para colegiaturas persistentes.
  2. Conectar [PreOrderService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/PreOrderService.ts) a la tabla `cafeteria_orders`.
  3. Ejecutar script [seed-qa-data.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/seed-qa-data.mjs) en la base de datos de staging de Supabase.
  4. Realizar recorrido de validación E2E manual según los 8 casos de [DAY2_E2E_PLAN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DAY2_E2E_PLAN.md) (SuperAdmin, SchoolAdmin, Cajero POS, Padre, Alumno).
- **Hito de Salida (Gate):** Sign-off de prueba exitosa por parte del propietario en entorno `mecard-network-staging.vercel.app`.

### Fase 2: Lanzamiento Piloto en Colegio Real (Esfuerzo: 4 a 6 semanas)
- **Objetivo:** Poner en marcha la plataforma en 1 colegio aliado de prueba (100 a 300 alumnos) sin incurrir en complejidad de pasarelas bancarias complejas.
- **Estrategia Operativa:**
  - Las recargas de saldo inicial se realizan mediante **depósito en ventanilla escolar / caja del colegio**.
  - El administrador del colegio acredita el saldo mediante la función [reload_wallet_atomic](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/supabase/migrations/20260327_admin_ops_rpcs.sql).
  - La cafetería cobra exclusivamente mediante el escaneo de la credencial con código QR en la tablet/laptop del POS.
  - Los padres monitorean en tiempo real los consumos y configuran topes diarios desde el celular.
- **Entregables Técnicos:**
  1. Impresión de lote de credenciales físicas de PVC con QR plastificado.
  2. Capacitación de 1 hora al personal de cafetería sobre la terminal [PosView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/PosView.tsx) y corte de caja.
  3. Firma del Aviso de Privacidad y Consentimiento de Padres para menores.
- **Hito de Salida (Gate):** 30 días continuos de recesos escolares operando con 0 pérdidas de dinero en efectivo y 0 fallos de cobro atómico.

### Fase 3: Integración Fintech y Pagos Bancarios Automatizados (Esfuerzo: 6 a 8 semanas)
- **Objetivo:** Automatizar las recargas para que el colegio no reciba efectivo en ventanilla, habilitando transferencias SPEI y tarjetas bancarias.
- **Entregables Técnicos y Financieros:**
  1. Contratación y firma de contrato con proveedor bancario adquirente (ej. STP para SPEI y Kushki/Stripe/Conekta para tarjetas).
  2. Apertura de cuenta concentradora STP y vinculación del webhook de abonos SPEI directos a la CLABE de cada alumno.
  3. Integración de checkout de tarjetas de débito/crédito en [ParentWalletView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentWalletView.tsx) con retención automática de la comisión del 3.5%.
  4. Rescate e integración del módulo de **Proveedores y Órdenes de Compra** desde `origin/staging`.
- **Hito de Salida (Gate):** Primera recarga SPEI bancaria real acreditada en menos de 60 segundos en la billetera de un alumno de forma desatendida.

### Fase 4: Escalamiento Comercial y Red Multi-Colegio (Trimestral)
- **Objetivo:** Adquisición de nuevos colegios, apertura de marketplace escolar con patrocinadores y desarrollo de app nativa.
- **Iniciativas Estratégicas:**
  1. Activación de la red de recompensas patrocinadas por marcas de alimentos saludables.
  2. Desarrollo de la versión móvil nativa (iOS / Android) en React Native.
  3. Implementación de los módulos de hardware biométrico para torniquetes escolares.

---

## 3. Metodología Ligera de Coordinación Tripartita

Para garantizar máxima eficiencia, minimizar consumo de tokens y evitar que los agentes se desvíen en tareas de programación prematuras, se establece este protocolo operativo:

```
┌────────────────────────────────────────────────────────────────────────┐
│               METODOLOGÍA DE COORDINACIÓN DEL PROYECTO                 │
├─────────────────┬──────────────────────────────────────────────────────┤
│ ACTOR           │ RESPONSABILIDAD EXCLUSIVA                            │
├─────────────────┼──────────────────────────────────────────────────────┤
│ **PROPIETARIO** │ Definición de prioridades de negocio, validación UAT │
│                 │ y relación institucional con colegios y bancos.      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ **GPT-6**       │ Dirección estratégica, diseño funcional de producto, │
│ (ChatGPT)       │ redacción de historias de usuario, resolución de     │
│                 │ dudas de negocio y seguimiento de este roadmap.      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ **AG**          │ Ejecución técnica disciplinada en el workspace:      │
│ (Antigravity)   │ auditorías de código, refactorización, migración SQL,│
│                 │ tests unitarios y commits atómicos verificados.      │
├─────────────────┼──────────────────────────────────────────────────────┤
│ **GITHUB**      │ Fuente única de verdad del código fuente, historial, │
│                 │ ramas, PRs protegidos y CI/CD automatizado a Vercel. │
└─────────────────┴──────────────────────────────────────────────────────┘
```

### Reglas de Interacción entre AG y GPT-6:
1. **GPT-6 no programa en el aire:** Antes de pedir a AG que programe una funcionalidad, GPT-6 consulta este compendio ([INDEX.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/INDEX.md)) para confirmar si ya existe código o tablas al respecto.
2. **AG no toma decisiones comerciales unilaterales:** Ante discrepancias de modelo de comisiones o alcances, AG documenta las alternativas técnicas y solicita decisión a GPT-6 y al propietario.
3. **Trazabilidad por PR:** Toda nueva funcionalidad o corrección pasa por una rama de tarea (`feature/` o `fix/`), corre los tests locales y se fusiona a `main` tras validación.
