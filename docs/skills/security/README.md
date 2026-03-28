# Skills de Seguridad

## Objetivo
- Proteger datos de estudiantes y transacciones.
- Cumplir RLS + validación exhaustiva en frontend, backend y base de datos.
- Prevenir exposición de secretos, abuso de permisos y fugas entre tenants.

## Cuándo consultar este skill
- Al tocar autenticación, autorización, transacciones, recargas, reembolsos o rewards.
- Al integrar APIs externas o IA generativa.
- Al introducir nuevas variables de entorno o secretos.

## Principios de seguridad para meCard
- Default deny: si no existe permiso explícito, negar acceso.
- Tenant isolation by design: nunca confiar en filtros enviados por el cliente.
- Secret zero in client: llaves sensibles solo en entorno seguro (Edge Functions/servidor).
- Defense in depth: validación en UI, servicio y capa de datos.
- Auditabilidad: eventos de seguridad y transacciones deben ser rastreables.

## Checkpoints
- [ ] Validar tenant_id en todas consultas.
- [ ] No exponer keys, usar env vars seguro.
- [ ] Escaneo SAST y secrets en CI.
- [ ] Revisar políticas RLS al modificar tablas o vistas.
- [ ] Verificar idempotencia en operaciones de pago/reembolso.
- [ ] Sanitizar y validar toda entrada externa con esquema estricto.
- [ ] Definir rate limiting y estrategia anti abuso para endpoints sensibles.

## Threat model mínimo por cambio
- [ ] Activos afectados: dinero, PII de menores, permisos, historial financiero.
- [ ] Actor de amenaza principal: usuario malicioso autenticado, externo no autenticado, insider.
- [ ] Vectores posibles: escalación de privilegios, bypass RLS, replay, inyección, fuga de secretos.
- [ ] Controles implementados: permisos, validación, auditoría, alertas, tests.
- [ ] Riesgo residual aceptado y dueño del riesgo.

## Checklist de release seguro
- [ ] Variables de entorno validadas para entorno objetivo.
- [ ] `npm run build` y `npm run type-check` sin errores.
- [ ] Tests de seguridad/regresión para flujo afectado.
- [ ] Sin `console.log` con datos sensibles.
- [ ] Documentación actualizada en `DECISIONS` o `ERROR_LOG` si aplica.

## Referencias clave
- `SECURITY_FIXES_PHASE1.sql`
- `SECURITY_IMPLEMENTATION_REPORT.md`
- `docs/project/DECISIONS.md`
- `docs/project/ERROR_LOG.md`
- `docs/skills/legal/README.md`

## Historial
- [YYYY-MM-DD] Revisión de acceso al endpoint de recarga.
