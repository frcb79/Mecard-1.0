# Skill: Reporting & Analytics — meCard

## Objetivo

Definir estrategia integral de reportes, dashboards y métricas por rol para habilitar decisiones operativas en tiempo real y auditoría completa.

Este skill establece:
- Qué reportes cada rol puede ver
- Qué datos en tiempo real vs. agregados
- Cómo se calcula cada KPI
- Auditoría y trazabilidad de transacciones

## Cuándo consultar este skill

- Al diseñar nuevo dashboard o reporte.
- Al agregar nueva métrica o KPI a seguimiento.
- Al integrar datos de terceros (Supabase, IA, FinTech).
- Cuando hay discrepancia entre realidad y números reportados.

---

## Principios de Reportes en meCard

1. Source of Truth única: cada métrica calcula desde Supabase, nunca desde memoria o estadísticas derivadas.
2. Datos en tiempo real donde importa: transacciones, saldos, alertas. Reportes consolidados pueden ser diarios/semanales.
3. Auditoría completa: toda mutación (recarga, reembolso, cierre de caja) registrada con timestamp, actor, monto, resultado.
4. Acceso por tenant: SCHOOL_ADMIN solo ve su escuela. SUPER_ADMIN ve todas, con filtros.
5. Performance: queries optimizadas para p95 <= 2s. Agregaciones pesadas pueden ejecutarse nocturnas.

---

## SUPER_ADMIN — Reportes de Negocio Global

### Dashboard Ejecutivo (Real-time)

Métricas principales:
- Escuelas activas: escuelas con >= 1 transacción en últimos 30 días
- Estudiantes registrados: total y por escuela
- Volumen de transacciones: count + sum hoy, semana, mes
- Tasa de cobranza: collected/charged por período
- Dinero en circulación: suma de balances
- Comisión de plataforma: acumulado YTD

### Reporte: Operación de Escuelas (Daily)

Por escuela:
- Nombre, director, contacto
- Alumnos total y activos
- Saldo total en plataforma
- Transacciones hoy: count, monto, tasa de éxito
- Reembolsos pendientes/procesados
- Incidentes: fallos POS, saldos negativos, límites excedidos

Acciones:
- Descargar CSV
- Bloquear escuela de emergencia
- Ajuste manual de saldo (con justificación)
- Disparar reporte custom

### Reporte: Settlement & Reconciliation (Weekly)

Por escuela:
- Período, ingresos, gastos, saldo neto
- Método de pago (SPEI)
- Estado: pendiente, procesado, confirmado
- Alertas: monto > umbral, reembolsos altos, chargebacks

### Reporte: Rewards & Engagement

- Puntos emitidos y canjeados
- Tasa de activación
- Top rewards más canjeados
- Costo promedio de reward para plataforma

### Reporte: Anomalías & Riesgo (Real-time)

Alertas automáticas:
- Saldo negativo
- Transacción rechazada por RLS
- Tasa de fallos POS > 10% hora
- Reembolso manual solicitado
- Acceso cruzado detectado en logs

---

## SCHOOL_ADMIN — Reportes de Gestión Local

### Dashboard Operativo (Real-time)

Visibilidad:
- Saldo total en plataforma de su escuela
- Transacciones hoy: count, monto, éxito rate
- Reembolsos pendientes
- Estudiantes sin saldo
- Top compradores del día
- Alertas locales

### Reporte: Transacciones por Estudiante (Daily)

Por estudiante:
- Nombre, ID, saldo actual
- Transacciones del día
- Saldo al inicio vs final
- Límites y permisos activos

Descargables:
- CSV
- JSON

### Reporte: Cobranza & Reembolsos (Weekly)

Resumen:
- Cobrado, reembolsado, neto
- Estudiantes con reembolso y motivos
- Comparativo vs semana previa

Acciones:
- Autorizar/rechazar reembolso pendiente
- Generar comprobante para padres

### Reporte: Padres & Recargas (Monthly)

Por padre:
- Email, estudiantes asociados
- Recargas: count, monto, última fecha
- Status: activo, bloqueado, consentimiento pendiente

### Reporte: Asistencia & Viajes (Weekly)

Por estudiante:
- Asistencia semanal
- Viajes autorizados y estatus
- Alertas de salida sin permiso/límite

---

## Datos requeridos en todo reporte

Cabecera estándar:
- Reporte
- Escuela/scope
- Período
- Generado por
- Timestamp
- Versión

Auditoría y seguridad:
- Todo reporte descargado registra actor, fecha, filtros
- Cambio manual de saldo registra before/after + justificación
- Reembolso registra solicitante, aprobador, monto, razón, resultado

---

## Queries críticas a implementar

1. KPI Global Super Admin
2. Dashboard School Admin por school_id
3. Historial de transacciones por estudiante
4. Settlement semanal por escuela
5. Alertas de anomalías en tiempo real

---

## Checkpoints antes de implementar

- [ ] Tabla activity_log: actor, action, table_name, before_data, after_data, timestamp, school_id
- [ ] RLS en todas las queries por school_id cuando aplica
- [ ] Índices en created_at, school_id, student_id
- [ ] Estrategia cache vs live para reportes
- [ ] Webhook/alerta para anomalías críticas
- [ ] Política de retención de auditoría

---

## Referencias

- docs/skills/data/README.md
- docs/skills/performance/README.md
- docs/skills/security/README.md
- docs/project/DECISIONS.md

## Historial

- [2026-03-27] Skill creado para cubrir reporting completo de SCHOOL_ADMIN y SUPER_ADMIN.

