# Skills de UX/UI

## Objetivo
- Garantizar experiencias de usuario claras en flujos de pagos y recompensas.
- Reducir fricción en tareas críticas por rol.
- Asegurar consistencia visual y feedback de estado en toda la plataforma.

## Cuándo consultar este skill
- Al crear o modificar flujos de onboarding, login, wallet, pago, reembolso o rewards.
- Al introducir nuevos roles o permisos con impacto en navegación.
- Al rediseñar componentes de alto uso.

## Checkpoints
- [ ] Flujos de onboarding y wallet.
- [ ] Accesibilidad WCAG 2.1.
- [ ] mobile-first, microinteracciones y feedback de estado.
- [ ] Estados `loading`, `empty`, `error` definidos por cada vista.
- [ ] Mensajes de error accionables y comprensibles para usuarios no técnicos.
- [ ] Jerarquía visual clara para tareas principales del rol.

## Flujos críticos por rol
- STUDENT: consulta de saldo, compra en POS, canje de recompensa.
- PARENT: recarga, límites, permisos, notificaciones.
- POS_OPERATOR/CASHIER: cobro rápido, validación de saldo, confirmación y ticket.
- SCHOOL_ADMIN/SUPER_ADMIN: configuración, monitoreo y resolución de incidencias.

## Métricas UX sugeridas
- Tiempo al primer cobro exitoso (POS).
- Tasa de abandono en recarga/reembolso.
- Errores de formulario por flujo y rol.
- NPS o satisfacción por módulo crítico.

## Criterios de calidad de interacción
- [ ] Una acción principal visible por pantalla.
- [ ] Confirmación inmediata tras operaciones de dinero.
- [ ] Prevención de errores en entradas sensibles (monto, CLABE, límites).
- [ ] Navegación consistente entre módulos del mismo rol.

## Referencias clave
- `docs/skills/accessibility/README.md`
- `docs/skills/design/README.md`
- `docs/project/PROJECT_BRAIN.md`

## Historial
- [YYYY-MM-DD] Ajuste de UI para pantalla de saldo insuficiente.
