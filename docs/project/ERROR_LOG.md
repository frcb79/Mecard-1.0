# ERROR LOG — meCard

## Incidentes y lecciones

### [YYYY-MM-DD] - Error de validación de tipo en transacción
- Contexto: error en `src/services/transactions` con campo `amount` optional.
- Causa raíz: falta de esquema Zod en payloads externos.
- Acción correctiva: agregar validación Zod y test de casos límite.
- Prevención: incluir item en checklist PR: "validación de entradas".

### [2026-03-19] - Checkout fallido por error de red
- Contexto: `POST /api/payments` retorna 502 en picos de carga.
- Causa raíz: timeout bajo en el servicio externo + falta retry.
- Acción correctiva: agregar retry con backoff en llamada a proveedor y circuit breaker.
- Prevención: tests de integración de circuit breaker y alertas en Sentry.
