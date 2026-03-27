# ERROR LOG — meCard

## Incidentes y lecciones

### [2026-03-26] - Deploy fallido en Vercel por lockfile desincronizado
- Contexto: Vercel falló durante `npm ci` con mensajes `Missing: ... from lock file`.
- Causa raíz: `package.json` y `package-lock.json` estaban fuera de sincronía; se actualizaron dependencias sin regenerar lock.
- Acción correctiva: regenerar lock con `npm install --legacy-peer-deps`, validar con `npm ci --legacy-peer-deps`, commit de `package-lock.json`.
- Prevención:
	- ejecutar `npm run verify:deploy` antes de push a `main`.
	- no fusionar cambios de dependencias sin `package-lock.json` actualizado.
	- alinear Node 20 en local/CI/Vercel.

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
