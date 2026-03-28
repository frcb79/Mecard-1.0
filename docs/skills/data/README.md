# Skill: Data — meCard

## Objetivo

Definir gobierno de datos para consistencia, trazabilidad y calidad de métricas de negocio y operación.

## Cuándo consultar este skill

- Al crear/modificar tablas, columnas o relaciones.
- Al definir eventos de negocio o dashboards.
- Al construir reportes financieros o de uso.

## Principios de datos

- Definiciones canónicas: cada métrica tiene una sola definición oficial.
- Integridad primero: evitar duplicados y estados inválidos.
- Auditoría: operaciones financieras deben ser trazables.
- Calidad medible: detectar datos faltantes, inconsistentes o fuera de rango.

## Checkpoints de modelado

- [ ] Entidad y cardinalidad documentadas.
- [ ] Reglas de validación y defaults definidos.
- [ ] Campos de auditoría incluidos cuando aplica.
- [ ] Estrategia de migración y compatibilidad de datos definida.
- [ ] Impacto en reportes existentes evaluado.

## Checkpoints de analítica

- [ ] Evento de negocio definido (nombre, payload, owner).
- [ ] KPI asociado y periodo de medición definidos.
- [ ] Fuente de verdad del KPI documentada.
- [ ] Validación de calidad de datos incluida en QA.

## Métricas críticas sugeridas

- Volumen y éxito de transacciones por escuela.
- Recargas y reembolsos por periodo.
- Activación por rol y retención semanal.
- Uso de rewards y costo por beneficio.

## Referencias clave

- `SUPABASE_SCHEMA.sql`
- `docs/project/DECISIONS.md`
- `docs/skills/performance/README.md`

## Historial

- [2026-03-27] Skill de data creado para gobernar métricas y trazabilidad.
