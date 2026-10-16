# 03. Matriz de Estado Real de Funcionalidades de MeCard

> **Clasificación Estándar Utilizada:**
> - **Implementado y verificado:** Existe código y evidencia de ejecución o pruebas unitarias/smoke satisfactorias.
> - **Implementado sin verificar:** El código existe completamente, pero no hay pruebas automatizadas que garanticen su robustez.
> - **Parcial:** Hay elementos desarrollados (ej. UI o base de datos), pero el flujo punta a punta está incompleto o corre sobre mocks.
> - **Diseñado:** Está especificado funcional o técnicamente, pero no implementado en código productivo.
> - **Propuesto:** Existe como idea o hipótesis sin aprobación confirmada del propietario.
> - **Bloqueado:** Depende de una integración externa, decisión de negocio o servicio no contratado.
> - **Obsoleto / sustituido:** Código o arquitectura que fue reemplazada por una versión más reciente.
> - **Desconocido:** No se encontró evidencia documental o de código suficiente.

---

## 1. Módulo: Autenticación, Roles y Navegación (RBAC)

### F-01: Control de Acceso Basado en Roles (RBAC) y Guardián de Rutas
1. **Nombre:** Guardián de Rutas Protegidas y Matriz de Roles.
2. **Objetivo/Beneficio:** Prevenir accesos no autorizados a pantallas restringidas según el rol activo del usuario autenticado.
3. **Roles Involucrados:** Todos los roles (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `SCHOOL_FINANCE`, `UNIT_MANAGER`, `POS_OPERATOR`, `PARENT`, `STUDENT`).
4. **Estado de Implementación:** **Implementado y verificado**.
5. **Ubicación del Código:** [src/components/ProtectedRoute.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ProtectedRoute.tsx), [src/services/RoleService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/RoleService.ts), [src/routes/index.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/routes/index.tsx).
6. **Rama y Commit:** `main`, commits `2132fc8` ("test(day2): expand auth role matrix smoke coverage to 16 tests") y `50878d3`.
7. **APIs/Tablas:** Tabla `user_roles`, `profiles`.
8. **Interfaz Funcional:** Sí, redirige automáticamente a `/login` si no hay sesión y a `/unauthorized` si el rol no tiene permisos.
9. **Pruebas Disponibles:** [src/components/ProtectedRoute.test.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ProtectedRoute.test.tsx) (16 tests unitarios pasando: loading, redirección no autenticada, rol denegado, permisos granulares).
10. **Errores/Limitaciones:** Requiere que `profiles` esté poblado correctamente en Supabase.
11. **Documentación:** [docs/project/DAY2_E2E_PLAN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DAY2_E2E_PLAN.md), [TESTING_ROLES.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/TESTING_ROLES.md).
12. **Decisiones Vinculadas:** [docs/project/DECISIONS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md) (2026-03-21 y 2026-03-30).
13. **Acciones para Terminar:** Ninguna; módulo base terminado y blindado.

### F-02: Autenticación Híbrida (Supabase Real + Modo Demo Local)
1. **Nombre:** AuthContext con Fallback Automático Demo.
2. **Objetivo/Beneficio:** Permitir el desarrollo y demostración offline sin credenciales reales de Supabase, activando validación estricta solo si se configura.
3. **Roles Involucrados:** Todos los roles.
4. **Estado de Implementación:** **Implementado y verificado**.
5. **Ubicación del Código:** [src/contexts/AuthContext.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/contexts/AuthContext.tsx), [src/lib/env.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/env.ts).
6. **Rama y Commit:** `main`, commit `6f6d595` y `853a4cd`.
7. **APIs/Tablas:** `supabase.auth`, tabla `profiles`.
8. **Interfaz Funcional:** Sí, [LoginView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/LoginView.tsx) ofrece login con contraseña real o botones rápidos para asumir roles en demo.
9. **Pruebas Disponibles:** [src/lib/env.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/lib/env.test.ts) (valida detección de placeholders y flags).
10. **Errores/Limitaciones:** Los tokens de sesión se guardan en `localStorage` (riesgo XSS pendiente de mitigar).
11. **Documentación:** [docs/project/DECISIONS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md) (2026-03-21 Centralized env validation).
12. **Decisiones Vinculadas:** Crear variable `VITE_REQUIRE_SUPABASE=false` para no bloquear desarrollo.
13. **Acciones para Terminar:** Migrar sesión a cookies `httpOnly` en etapa de endurecimiento pre-producción.

---

## 2. Módulo: Fintech, Billetera y Punto de Venta (POS)

### F-03: Cobro Atómico en Terminal POS (Anti Double-Spend)
1. **Nombre:** Venta en POS con Ejecución Transaccional Atómica.
2. **Objetivo/Beneficio:** Procesar cobro de productos en cafetería/papelería descontando el saldo del alumno de forma atómica con clave de idempotencia, evitando fraudes de doble gasto concurrente.
3. **Roles Involucrados:** `POS_OPERATOR`, `CASHIER`, `STUDENT`.
4. **Estado de Implementación:** **Implementado y verificado** (en base de datos y mock); **Implementado sin verificar** (en conexión viva con Supabase real).
5. **Ubicación del Código:** SQL en [SECURITY_FIXES_PHASE1.sql:L88-L157](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_FIXES_PHASE1.sql#L88-L157), Frontend en [src/components/PosView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/PosView.tsx), Servicio en [src/services/supabasePos.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabasePos.ts).
6. **Rama y Commit:** `main`, commits `ec5aa8f` ("feat(pos): harden POS frontend and wire real Supabase backend services") y `eb0f2a8`.
7. **APIs/Tablas:** RPC `process_pos_sale_atomic`, tablas `students`, `transactions`, `operating_units`.
8. **Interfaz Funcional:** Sí, terminal táctil con catálogo de productos, carrito, cálculo de puntos, escaneo QR y emisión de ticket con folio.
9. **Pruebas Disponibles:** Pruebas unitarias en [MockPaymentService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/MockPaymentService.test.ts) (validación de saldo insuficiente, CLABE errónea y cambio de balance).
10. **Errores/Limitaciones:** En el entorno local sin Supabase corre sobre `MockPaymentService`.
11. **Documentación:** [SECURITY_IMPLEMENTATION_REPORT.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/SECURITY_IMPLEMENTATION_REPORT.md).
12. **Decisiones Vinculadas:** Decisión crítica CRIT-001 de March 11, 2026.
13. **Acciones para Terminar:** Ejecutar script `seed-qa-data.mjs` en Supabase y verificar la RPC en una terminal física.

### F-04: Algoritmo de Generación y Validación de CLABE Bancaria Escolar
1. **Nombre:** Generador y Verificador de Cuentas CLABE para Alumnos.
2. **Objetivo/Beneficio:** Asignar una cuenta bancaria estandarizada de 18 dígitos a cada estudiante para permitir recargas vía SPEI directo por parte de los padres.
3. **Roles Involucrados:** `SUPER_ADMIN`, `SCHOOL_ADMIN`, `PARENT`.
4. **Estado de Implementación:** **Implementado y verificado**.
5. **Ubicación del Código:** [src/services/clabeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/clabeService.ts).
6. **Rama y Commit:** `main`, commit `6f6d595`.
7. **APIs/Tablas:** Tabla `schools` (`stp_cost_center`, `settlement_clabe`), tabla `students`.
8. **Interfaz Funcional:** Sí, se visualiza en la credencial del estudiante ([StudentCredentialView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/StudentCredentialView.tsx)) y en el portal de padres para transferir.
9. **Pruebas Disponibles:** [src/services/__tests__/clabeService.test.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/__tests__/clabeService.test.ts) (verifica algoritmo de pesos 3, 7, 1 de Banxico y rechazo de dígito verificador inválido).
10. **Errores/Limitaciones:** La generación de la CLABE es 100% matemática y válida; sin embargo, no está dada de alta en el core bancario de STP porque no hay API key de STP contratada.
11. **Documentación:** [docs/project/PROJECT_BRAIN.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/PROJECT_BRAIN.md), [BILLING_TESTING_GUIDE.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/BILLING_TESTING_GUIDE.md).
12. **Decisiones Vinculadas:** Diferir integración bancaria real con STP a Fase 3 (post-UAT).
13. **Acciones para Terminar:** Contratar cuenta concentradora en STP y conectar webhooks de abono SPEI.

### F-05: Recarga de Billetera Familiar con Cálculo de Comisiones
1. **Nombre:** Portal de Recarga y Billetera para Padres.
2. **Objetivo/Beneficio:** Permitir a los padres recargar saldo a sus hijos conociendo con transparencia las comisiones aplicables según el método de pago.
3. **Roles Involucrados:** `PARENT`.
4. **Estado de Implementación:** **Parcial** (UI y cálculo de comisiones completo; procesamiento bancario en mock).
5. **Ubicación del Código:** [src/components/ParentWalletView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentWalletView.tsx), [src/services/BillingService.ts:L66-L90](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/BillingService.ts#L66-L90).
6. **Rama y Commit:** `main`, commit `9147022`.
7. **APIs/Tablas:** Tablas `wallet_transactions`, `students`, `school_billing_config`.
8. **Interfaz Funcional:** Sí, incluye tabs para depositar, ver comisiones (tarjeta 3.5%, SPEI $8), programar recarga automática y ver historial.
9. **Pruebas Disponibles:** Documentadas en [BILLING_TESTING_GUIDE.md:Workflow 1](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/BILLING_TESTING_GUIDE.md).
10. **Errores/Limitaciones:** El depósito se confirma en memoria sin cobrar a una tarjeta real.
11. **Documentación:** [BILLING_TESTING_GUIDE.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/BILLING_TESTING_GUIDE.md).
12. **Decisiones Vinculadas:** Validar el cálculo y la psicología del usuario antes de conectar pasarela de pago real.
13. **Acciones para Terminar:** Conectar pasarela tipo Stripe o Conekta para el tokenizado de tarjetas.

### F-06: Pre-Órdenes de Cafetería y Horarios de Recolección
1. **Nombre:** Pre-Ordering System con Pickup Slots.
2. **Objetivo/Beneficio:** Evitar aglomeraciones en cafetería permitiendo a alumnos y padres solicitar alimentos antes del recreo.
3. **Roles Involucrados:** `STUDENT`, `PARENT`, `POS_OPERATOR`, `CAFETERIA_STAFF`.
4. **Estado de Implementación:** **Parcial**.
5. **Ubicación del Código:** UI en [StudentPreOrderView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/StudentPreOrderView.tsx) y [PreOrderQueueView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/PreOrderQueueView.tsx); Servicio en [src/services/PreOrderService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/PreOrderService.ts); Migración en `supabase/migrations/20260330_pos_and_cafeteria_tables.sql`.
6. **Rama y Commit:** `main`, commit `f5bda70` ("feat: Pre-ordering system (Phase E)") y `f76ece2`.
7. **APIs/Tablas:** Tabla `cafeteria_orders` (creada en SQL pero no conectada al frontend), servicio en `localStorage`.
8. **Interfaz Funcional:** Sí, selección de platillos, elección de franja horaria (09:00 a 14:00) y cola de preparación en cafetería.
9. **Pruebas Disponibles:** Pruebas manuales documentadas.
10. **Errores/Limitaciones:** El servicio sigue usando `localStorage` (`STORAGE_KEY = 'mecard_pre_orders'`) en vez de persistir en `cafeteria_orders`.
11. **Documentación:** [IDEAS_2026.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md), [PLATFORM_READINESS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/PLATFORM_READINESS.md).
12. **Decisiones Vinculadas:** F5bda70 aprobó el flujo visual; la migración a Supabase quedó como pendiente de Día 8 del plan de go-live.
13. **Acciones para Terminar:** Reemplazar llamadas a `localStorage` en `PreOrderService.ts` por queries directas a la tabla `cafeteria_orders`.

---

## 3. Módulo: Gestión Escolar, Alumnos y Familias (EdTech)

### F-07: Importación Masiva de Matrícula Escolar por CSV
1. **Nombre:** Student Import Wizard con Detección de CURP y Familias.
2. **Objetivo/Beneficio:** Permitir a los colegios dar de alta cientos de alumnos y padres en menos de 2 minutos mediante archivos de Excel/CSV.
3. **Roles Involucrados:** `SCHOOL_ADMIN`, `SCHOOL_FINANCE`.
4. **Estado de Implementación:** **Implementado sin verificar** (en frontend/servicio; requiere validación con base de datos viva).
5. **Ubicación del Código:** [StudentImportWizard.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/StudentImportWizard.tsx), [studentImportService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/studentImportService.ts).
6. **Rama y Commit:** `main`, commit `909e4d9`.
7. **APIs/Tablas:** Tablas `students`, `parent_student_links`, `profiles`.
8. **Interfaz Funcional:** Sí, asistente de 4 pasos (carga, validación de filas, confirmación, resumen).
9. **Pruebas Disponibles:** Script de generación de usuarios de prueba en [scripts/create-test-users.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/create-test-users.mjs).
10. **Errores/Limitaciones:** Si la institución tiene formatos de CSV no estándar con columnas en diferente orden, el mapeo requiere coincidencia exacta de encabezados.
11. **Documentación:** [TEST_PLAN.md:1.1](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/TEST_PLAN.md).
12. **Decisiones Vinculadas:** Requisito obligatorio para el Día 4 del plan de go-live.
13. **Acciones para Terminar:** Probar con un archivo real de 500 registros y validar la inserción masiva en Supabase con RLS activo.

### F-08: Gestión de Colegiaturas, Becas y Cobranza Escolar
1. **Nombre:** School Fees Manager y Aging Buckets.
2. **Objetivo/Beneficio:** Administrar el cobro de mensualidades escolares, aplicar becas o descuentos y detectar morosidad por periodos de retraso (30, 60, 90+ días).
3. **Roles Involucrados:** `SCHOOL_ADMIN`, `SCHOOL_FINANCE`, `PARENT`.
4. **Estado de Implementación:** **Parcial** (UI hipercompleta de 69 KB en `SchoolFeesManager.tsx`, pero datos en `localStorage`).
5. **Ubicación del Código:** [SchoolFeesManager.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolFeesManager.tsx), [ParentFeesView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentFeesView.tsx), [SchoolFeeService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/SchoolFeeService.ts).
6. **Rama y Commit:** `main`, commit `0907266` ("feat: complete colegiaturas module - Phase 1") y `63f6b83`.
7. **APIs/Tablas:** Mock en `localStorage` (`mecard_school_fees`, `mecard_parent_payments`, `mecard_scholarships`). No usa tablas Supabase todavía.
8. **Interfaz Funcional:** Sí, tablero con KPIs de cobranza, desglose de cuotas, planes de pago y estado de cuenta familiar.
9. **Pruebas Disponibles:** Pruebas manuales con constantes `MOCK_SCHOOL_FEES`.
10. **Errores/Limitaciones:** Si el usuario borra la caché del navegador, las colegiaturas y becas creadas se reinician a los valores mock.
11. **Documentación:** [docs/project/CHANGELOG.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/CHANGELOG.md).
12. **Decisiones Vinculadas:** Se priorizó terminar la experiencia de usuario y lógica de recargos antes de persistir en base de datos.
13. **Acciones para Terminar:** Crear la tabla `school_fees`, `parent_fee_payments` y `scholarships` en Supabase y cablear `SchoolFeeService` a Supabase client.

### F-09: Permisos de Salida Escolares y Notificación Cruzada a Co-Padres
1. **Nombre:** Exit Permissions y Co-Parenting Management.
2. **Objetivo/Beneficio:** Gestionar autorizaciones de salida de alumnos (quién lo recoge, camión destino, motivo) notificando a ambos padres y al colegio.
3. **Roles Involucrados:** `PARENT`, `SCHOOL_ADMIN`, `STUDENT`.
4. **Estado de Implementación:** **Implementado sin verificar** en UI; **Parcial** en persistencia.
5. **Ubicación del Código:** [ParentPermissionsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentPermissionsView.tsx), [SchoolPermissionsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolPermissionsView.tsx), [ParentSettingsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentSettingsView.tsx).
6. **Rama y Commit:** `main`, commits `6b03d0b` y `e5a6bc2`.
7. **APIs/Tablas:** Tablas `exit_permissions`, `permission_approvals`, `authorized_contacts`, `school_permission_config` (definidas en `SUPABASE_SCHEMA.sql`).
8. **Interfaz Funcional:** Sí, creación de permisos, selección de persona autorizada (3 contactos fijos), alerta "No asiste" y vinculación de co-padre con código de 6 dígitos.
9. **Pruebas Disponibles:** Casos de prueba manuales en `TEST_PLAN.md`.
10. **Errores/Limitaciones:** El envío de notificaciones por WhatsApp o SMS a los co-padres no cuenta con proveedor conectado (Twilio no configurado).
11. **Documentación:** [IDEAS_2026.md:Sección 1 y 3](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md).
12. **Decisiones Vinculadas:** Decisión documentada en `IDEAS_2026.md`: "Co-padres: cuentas separadas iguales, sin jerarquía. Camiones: MeCard no gestiona rutas, solo registra texto libre".
13. **Acciones para Terminar:** Conectar servicio de mensajería (SMS/WhatsApp) para notificación cruzada.

### F-10: Excursiones y Viajes Escolares con Pagos Parciales
1. **Nombre:** School Trips & Installment Payments.
2. **Objetivo/Beneficio:** Publicar excursiones, gestionar inscripciones, controlar cupos, recolectar firmas responsivas y cobrar en pagos parciales.
3. **Roles Involucrados:** `SCHOOL_ADMIN`, `PARENT`, `STUDENT`.
4. **Estado de Implementación:** **Implementado sin verificar**.
5. **Ubicación del Código:** [SchoolTripsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SchoolTripsView.tsx), [ParentTripsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/ParentTripsView.tsx), [StudentTripsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/StudentTripsView.tsx).
6. **Rama y Commit:** `main`, commit `6b03d0b` y `e5a6bc2`.
7. **APIs/Tablas:** Tablas `school_trips`, `trip_enrollments`, `trip_payments`, `trip_reminders`.
8. **Interfaz Funcional:** Sí, vistas completas con barras de progreso de recaudación, checklist de documentos y estado de pagos de cada familia.
9. **Pruebas Disponibles:** Pruebas visuales locales.
10. **Errores/Limitaciones:** Los cobros de parcialidades se deducen del saldo mock de la billetera familiar.
11. **Documentación:** [IDEAS_2026.md:Sección 2](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/IDEAS_2026.md).
12. **Decisiones Vinculadas:** Modelo con parcialidades automáticas y estados borrador → abierto → cerrado → completado.
13. **Acciones para Terminar:** Probar concurrencia en la reserva de cupo cuando se alcanza el límite de alumnos.

---

## 4. Módulo: Gamificación, Lealtad y Red Social Escolar

### F-11: Programa de Puntos y Recompensas (Rewards)
1. **Nombre:** MeCard Rewards & Tiers (Bronze, Silver, Gold, Platinum).
2. **Objetivo/Beneficio:** Incentivar la compra en la red MeCard y premiar hábitos de consumo saludables mediante puntos acumulables.
3. **Roles Involucrados:** `STUDENT`, `SUPER_ADMIN`, `PARENT`.
4. **Estado de Implementación:** **Implementado sin verificar** (Lógica completa con modo dual Supabase/mock).
5. **Ubicación del Código:** [rewardsService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/rewardsService.ts), [RewardsMarketplacePage.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/RewardsMarketplacePage.tsx), [StudentRewardsView.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/StudentRewardsView.tsx), [AdminRewardsConfig.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/AdminRewardsConfig.tsx).
6. **Rama y Commit:** `main`, commit `7119dde` ("feat: Sistema Completo MeCard Rewards") y `c5c0346`.
7. **APIs/Tablas:** Tablas `school_rewards_config`, `student_rewards_points`, `points_transactions`, `marketplace_products`, `student_redemptions`.
8. **Interfaz Funcional:** Sí, catálogo de recompensas, canje por puntos, barras de nivel de tier y panel de administración global.
9. **Pruebas Disponibles:** Pruebas de integración básica POS ↔ Rewards documentadas en `docs/`.
10. **Errores/Limitaciones:** Falta validar el stock en tiempo real cuando múltiples alumnos canjean el mismo producto simultáneamente.
11. **Documentación:** [PLATFORM_READINESS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/PLATFORM_READINESS.md).
12. **Decisiones Vinculadas:** Los canjes generan un cupón con código para entrega en mostrador físico.
13. **Acciones para Terminar:** Agregar función atómica SQL para decremento de inventario de recompensas (`decrement_inventory_stock`).

### F-12: Colectas Grupales de Cumpleaños ("Vaquitas") y Regalos Sociales
1. **Nombre:** Red Social de Regalos y Birthday Pools.
2. **Objetivo/Beneficio:** Permitir a compañeros y familias organizar regalos compartidos de cumpleaños y enviarse detalles de cafetería sin manejar efectivo.
3. **Roles Involucrados:** `STUDENT`, `PARENT`.
4. **Estado de Implementación:** **Implementado sin verificar**.
5. **Ubicación del Código:** [BirthdayGifts.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/BirthdayGifts.tsx), [birthdayService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/birthdayService.ts), [supabasePool.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabasePool.ts), [supabaseSocial.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/supabaseSocial.ts).
6. **Rama y Commit:** `main`, commit `6c0adaa` ("feat: Implementar Fase 1 completa del Sistema de Red Social de Regalos MeCard").
7. **APIs/Tablas:** Tablas `birthday_pools`, `pool_contributions`, `gifts`, `pool_refunds`, `pool_point_conversions`.
8. **Interfaz Funcional:** Sí, lista de próximos cumpleaños en los siguientes 30 días, barra de recaudación, aportación voluntaria y dedicatoria.
9. **Pruebas Disponibles:** Validación de conversión de fondos en scripts [scripts/run-refund-conversion.mjs](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/scripts/run-refund-conversion.mjs).
10. **Errores/Limitaciones:** **Vulnerabilidad de Privacidad P0 detectada**: en `supabaseSocial.ts:L15`, la consulta de búsqueda expone el `balance` de otros alumnos.
11. **Documentación:** [PHASE1_REFUND_POLICY_SPEC.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/PHASE1_REFUND_POLICY_SPEC.md).
12. **Decisiones Vinculadas:** Conversión a puntos después de 30 días post-cumpleaños si la vaquita no es redimida.
13. **Acciones para Terminar:** Remover inmediatamente el campo `balance` de la consulta en `supabaseSocial.ts` y validar RLS.

---

## 5. Módulo: Inteligencia Artificial (Google Gemini)

### F-13: Asesoría Financiera y Nutricional con Gemini AI
1. **Nombre:** Suite de Micro-servicios IA para Alumnos, Padres y Negocio.
2. **Objetivo/Beneficio:** Generar recomendaciones automáticas: venta sugerida en POS, análisis de ventas semanales, detección de patrones de gasto familiar y retos nutricionales.
3. **Roles Involucrados:** `STUDENT`, `PARENT`, `POS_OPERATOR`, `SUPER_ADMIN`.
4. **Estado de Implementación:** **Implementado sin verificar** (con riesgo crítico de seguridad).
5. **Ubicación del Código:** [src/services/geminiService.ts](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/services/geminiService.ts).
6. **Rama y Commit:** `main`, commits `2ff2358` ("feat: Integración de AI Gemini en Parent y Student Portals") y `ec5aa8f`.
7. **APIs/Tablas:** SDK oficial `@google/genai` (versión 1.3.0), modelos `gemini-3-flash-preview` y `gemini-3-pro-preview`.
8. **Interfaz Funcional:** Sí, integrado en el POS (botón "Sugerencia IA"), en el dashboard del alumno ("Reto del día") y en analítica del Super Admin.
9. **Pruebas Disponibles:** Pruebas con fallbacks seguros en caso de fallo de red o ausencia de API key.
10. **Errores/Limitaciones:** **Riesgo Crítico P0**: La API key `VITE_GEMINI_API_KEY` se lee en el navegador cliente (`import.meta.env.VITE_GEMINI_API_KEY`). Si un atacante inspecciona el bundle, puede extraer la clave y generar costos no autorizados.
11. **Documentación:** [docs/project/DECISIONS.md:L57-L60](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/project/DECISIONS.md#L57-L60).
12. **Decisiones Vinculadas:** Decisión registrada en `DECISIONS.md`: "Mover llamadas a Gemini API a Edge Functions de Supabase para que la API key no quede expuesta en el cliente (riesgo XSS)".
13. **Acciones para Terminar:** Crear una Supabase Edge Function (`/functions/v1/gemini-proxy`) que custodie la API key en el servidor.

---

## 6. Módulo: Gestión de Proveedores y Órdenes de Compra (Trabajo Abandonado)

### F-14: Gestión de Proveedores y Catálogo de Abastecimiento
1. **Nombre:** Supplier Management & Purchase Orders.
2. **Objetivo/Beneficio:** Permitir a los concesionarios dar de alta proveedores de alimentos/bebidas y generar órdenes de compra vinculadas al inventario escolar.
3. **Roles Involucrados:** `UNIT_MANAGER`, `SCHOOL_ADMIN`.
4. **Estado de Implementación:** **Obsoleto / Abandonado en rama `origin/staging`**.
5. **Ubicación del Código:** Rama `origin/staging`: `components/SupplierManagementView.tsx`, `services/supplierService.ts`, `services/purchaseOrderService.ts`, migraciones `supabase/migrations/003_add_supplier_management.sql` y `004_add_purchase_orders.sql`.
6. **Rama y Commit:** `origin/staging`, commit `45da9e1` ("feat: implement supplier management and purchase order modules").
7. **APIs/Tablas:** Tablas `suppliers`, `purchase_orders`, `purchase_order_items`.
8. **Interfaz Funcional:** Sí, modal de alta de proveedor, tabla con datos de contacto, RFC, condiciones de crédito y generación de PDF/orden.
9. **Pruebas Disponibles:** Ninguna automatizada.
10. **Errores/Limitaciones:** No existe en la rama `main` ni en la carpeta `src/`.
11. **Documentación:** [docs/COMPLETION_REPORT_ABC.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/COMPLETION_REPORT_ABC.md) en rama `staging`.
12. **Decisiones Vinculadas:** Nunca se tomó una decisión explícita de descartarlo; fue omitido por omisión al reestructurar la carpeta `src/`.
13. **Acciones para Terminar:** Evaluar en P2 si se rescata e incorpora formalmente dentro de `src/components/Concessionaire/`.
