# Skills de DevOps

## Objetivo
- Garantizar pipelines de CI/CD, despliegues repetibles y observabilidad.
- Reducir fallos de deploy y acelerar rollback seguro.
- Mantener alineación de entornos local, CI, staging y producción.

## Cuándo consultar este skill
- Al modificar dependencias, workflows, scripts de build o configuración de Vercel/Supabase.
- Al introducir jobs de test, coverage, lint, seguridad o quality gates.
- Al definir estrategias de rollback y manejo de incidentes.

## Checkpoints de pipeline
- [ ] `npm ci` funciona local y en CI con el mismo lockfile.
- [ ] `type-check`, `test` y `build` ejecutan en cada PR a main.
- [ ] Variables de entorno están definidas por ambiente.
- [ ] Rama principal protegida con checks obligatorios.
- [ ] Dependabot configurado con límites y agrupación razonable.

## Checklist de release
- [ ] Lockfile sincronizado tras cambios de dependencias.
- [ ] Verificación previa: `npm run verify:deploy` (o equivalente del proyecto).
- [ ] Estrategia de rollback documentada para el cambio.
- [ ] Observabilidad activa para detectar regresiones post-release.

## Operación y monitoreo
- [ ] Alertas de error rate y falla de transacciones críticas.
- [ ] Logs estructurados y correlación por request/tenant cuando aplique.
- [ ] Métricas base: éxito de checkout, latencia endpoint crítico, tasa de errores auth.

## Riesgos comunes
- `package.json` y lockfile fuera de sincronía.
- Diferencias de versión de Node entre local/CI/Vercel.
- Deploy sin validar secretos o sin smoke test mínimo.

## Referencias clave
- `docs/project/ERROR_LOG.md`
- `docs/project/DECISIONS.md`
- `docs/skills/operations/README.md`
- `docs/skills/performance/README.md`

## Historial
- [YYYY-MM-DD] Pipeline inicial en `ci/system-tests`.
