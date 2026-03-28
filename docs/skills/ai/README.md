# Skill: AI — meCard

## Objetivo

Usar IA de forma segura y medible para mejorar experiencia y eficiencia operativa, sin comprometer datos sensibles ni cumplimiento.

## Cuándo consultar este skill

- Al crear funciones con LLM (recomendaciones, análisis, asistentes).
- Al enviar datos de usuario a proveedores externos.
- Al evaluar costo/beneficio de features basadas en IA.

## Principios de IA responsable

- Privacidad por diseño: minimizar datos enviados a proveedores.
- Seguridad por defecto: secretos fuera del cliente.
- Trazabilidad: registrar prompts/versiones/resultados para auditoría.
- Calidad medible: evaluar precisión y utilidad con métricas reales.
- Fallback seguro: si IA falla, la app mantiene operación básica.

## Checkpoints de implementación

- [ ] Caso de uso y objetivo de negocio definidos.
- [ ] Datos permitidos/prohibidos documentados para prompt.
- [ ] Prompt y salida validados con esquema estricto.
- [ ] Manejo de errores y timeout implementados.
- [ ] Costo estimado por uso monitoreado.
- [ ] Riesgo de alucinación mitigado (reglas, verificaciones, límites).

## Seguridad específica

- [ ] API keys solo en backend/edge functions.
- [ ] Nunca enviar PII de menores sin base legal y controles.
- [ ] Sanitizar entradas para evitar prompt injection básico.
- [ ] Registrar decisiones críticas sin almacenar secretos.

## QA mínimo para features de IA

- [ ] Set de pruebas con casos nominales y adversariales.
- [ ] Evaluación de calidad por rol afectado.
- [ ] Comparación contra baseline no-IA.

## Referencias clave

- `docs/project/DECISIONS.md`
- `docs/skills/security/README.md`
- `docs/skills/legal/README.md`
- `docs/skills/data/README.md`

## Historial

- [2026-03-27] Skill de IA creado con foco en seguridad, calidad y costo.
