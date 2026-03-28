# Skills de Arquitectura

## Objetivo
- Definir patrones de dominio, límites (bounded contexts) y contratos entre módulos.
- Asegurar escalabilidad de transacciones y aislamiento multi-tenant en todo cambio.
- Reducir deuda técnica mediante decisiones explícitas de evolución.

## Cuándo consultar este skill
- Al crear un nuevo módulo de negocio o integrar un proveedor externo.
- Al mover lógica entre UI, servicios, hooks o edge functions.
- Al modificar contratos de datos o rutas entre capas.

## Principios de arquitectura para meCard
- Multi-tenant first: todo modelo y consulta relevante debe respetar aislamiento por `school_id`/`tenant_id`.
- Dominio fuera de UI: componentes no deben contener reglas de negocio críticas.
- Contratos tipados: payloads y respuestas deben tener tipos y validación explícita.
- Evolución incremental: priorizar cambios compatibles hacia atrás cuando haya consumidores activos.
- Single source of truth: no duplicar lógica de negocio en capas paralelas.

## Checkpoints de diseño
- [ ] Identificar bounded context principal del cambio (Auth, POS, Rewards, Parent Portal, School Admin, Super Admin).
- [ ] Definir entidades/agregados afectados y sus invariantes.
- [ ] Declarar entradas/salidas del módulo (tipos, validaciones y errores esperados).
- [ ] Confirmar que la lógica de negocio queda en servicios/hooks, no en componentes UI.
- [ ] Confirmar estrategia de migración si hay cambios de esquema o contratos.
- [ ] Evaluar impacto en performance de consultas y eventos de observabilidad.

## Checklist de implementación
- [ ] Tipos estrictos sin `any` ni cast inseguros.
- [ ] Validaciones de borde en entradas externas (formularios, API, storage, webhooks).
- [ ] Tratamiento de estados `loading`, `error`, `empty` en vistas afectadas.
- [ ] Tests mínimos: unit para lógica pura e integración para rutas críticas afectadas.

## Señales de alerta
- Lógica de permisos o saldos calculada en más de un lugar.
- Nuevas dependencias entre dominios sin contrato documentado.
- Cambios de esquema sin plan de rollback o sin script reproducible.
- Servicios que acceden a múltiples dominios sin responsabilidad clara.

## Referencias clave
- `docs/project/PROJECT_BRAIN.md`
- `docs/project/DECISIONS.md`
- `docs/project/ERROR_LOG.md`
- `docs/skills/security/README.md`
- `docs/skills/performance/README.md`

## Historial
- [YYYY-MM-DD] Implementación inicial del módulo de transacciones.
