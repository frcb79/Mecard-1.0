# Skill: Operations — meCard

## Objetivo

Asegurar continuidad operativa de la plataforma con procedimientos claros para incidentes, soporte y cambios en producción.

## Cuándo consultar este skill

- Al definir on-call, soporte o escalación de incidentes.
- Al diseñar runbooks de flujo crítico (pagos, recargas, auth).
- Al operar despliegues con riesgo de impacto a usuarios.

## Operación mínima requerida

- Dueño operativo por dominio crítico (Auth, POS, Wallet, Rewards).
- Canales y tiempos de escalación definidos.
- Runbook por incidente recurrente.
- Seguimiento postmortem para incidentes severos.

## Checkpoints operativos

- [ ] Existe runbook para fallas de checkout y recarga.
- [ ] Existe runbook para degradación de autenticación.
- [ ] Existe runbook para caída parcial de servicios externos.
- [ ] Se define criterio de incidente Sev1/Sev2/Sev3.
- [ ] Se define objetivo de recuperación (RTO) por flujo crítico.
- [ ] Se define objetivo de pérdida aceptable (RPO) cuando aplique.

## Protocolo de incidente

1. Detectar y clasificar severidad.
2. Contener impacto (feature flag, rollback, limitación temporal).
3. Restaurar servicio.
4. Comunicar estado a stakeholders.
5. Ejecutar postmortem sin culpables.
6. Crear acciones preventivas con owner y fecha.

## Métricas operativas

- MTTA (tiempo de detección y asignación).
- MTTR (tiempo de recuperación).
- Tasa de incidentes por módulo.
- Reapertura de incidentes (calidad de remediación).

## Referencias clave

- `docs/project/ERROR_LOG.md`
- `docs/skills/devops/README.md`
- `docs/skills/security/README.md`

## Historial

- [2026-03-27] Skill operativo inicial con protocolo de incidentes y runbooks mínimos.
