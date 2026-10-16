# MeCard — Contexto Maestro y Auditoría Integral del Proyecto

> **Fecha de corte de auditoría:** Octubre 2026 (Análisis de base de código: commits Enero – Abril 2026)  
> **Repositorio analizado:** `https://github.com/frcb79/Mecard-1.0.git`  
> **Rama auditada:** `main` (commit `86a62c3`) comparada con `origin/staging` (commit `62db4a5`)  
> **Destinatario principal:** Propietario del Proyecto & ChatGPT GPT-6 (Coordinador Estratégico y de Producto)

---

## 🎯 Propósito de este Compendio Documental

Este compendio documental consolida la **Auditoría Integral y Recuperación del Contexto Maestro** de la plataforma tecnológica escolar y fintech **MeCard**. 

Ha sido elaborado por un equipo senior multidisciplinario (CTO, Full-Stack, Product Manager, EdTech, Fintech/Pagos, Seguridad/Privacidad, DevOps/QA, Estrategia Comercial y Arquitectura Documental) mediante un barrido exhaustivo, no destructivo y verificable de la totalidad del código fuente, historial de versiones de Git, esquemas de bases de datos, especificaciones de negocio y documentación histórica existente en el workspace.

Su objetivo es entregar a **ChatGPT GPT-6** y al propietario del proyecto una fuente única de verdad para la toma de decisiones, evitando investigaciones redundantes, retrabajos, duplicidades y consumo innecesario de tokens.

---

## 📚 Índice General de Documentos

| Archivo | Título | Descripción y Alcance |
|---|---|---|
| [00_RESUMEN_EJECUTIVO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/00_RESUMEN_EJECUTIVO.md) | **Resumen Ejecutivo** | Fotografía global de MeCard: visión, estado actual real, respuestas precisas a las 12 preguntas de dirección y semáforo general. |
| [01_VISION_Y_MODELO_NEGOCIO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/01_VISION_Y_MODELO_NEGOCIO.md) | **Visión y Modelo de Negocio** | Estrategia, segmentos (colegio, familia, alumno, concesionario), monetización (Modelos A, B, C), float financiero, breakage y análisis de la hipótesis de reducción de comisiones. |
| [02_MAPA_FUNCIONAL.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/02_MAPA_FUNCIONAL.md) | **Mapa Funcional de la Plataforma** | Inventario exhaustivo de los 6 roles, catálogo de las 53 rutas navegables, procesos de negocio y recorridos de usuario punta a punta. |
| [03_MATRIZ_FUNCIONALIDADES.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/03_MATRIZ_FUNCIONALIDADES.md) | **Matriz de Estado Real de Funcionalidades** | Matriz granular (13 campos por funcionalidad) clasificando qué está verificado, en mock, parcial o pendiente. |
| [04_ARQUITECTURA_TECNICA.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/04_ARQUITECTURA_TECNICA.md) | **Arquitectura Técnica y de Datos** | Stack tecnológico detallado, diagramas Mermaid de capas, flujo de datos, concurrencia atómica, multi-tenancy y despliegues. |
| [05_GITHUB_HISTORIAL_Y_RAMAS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/05_GITHUB_HISTORIAL_Y_RAMAS.md) | **Historial de GitHub, Ramas y Trabajo Abandonado** | Auditoría forense de Git: análisis de los 35 commits abandonados en `origin/staging` (módulo de proveedores y órdenes de compra), branches de Dependabot y evolución histórica. |
| [06_INTEGRACIONES_Y_DATOS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/06_INTEGRACIONES_Y_DATOS.md) | **Integraciones, Servicios y Base de Datos** | Catálogo de las 52 tablas Supabase, 11 funciones RPC atómicas, integración con STP/CLABE, Google Gemini AI y pasarelas de pago. |
| [07_AUDITORIA_SEGURIDAD_Y_QA.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/07_AUDITORIA_SEGURIDAD_Y_QA.md) | **Seguridad, Privacidad y Control de Calidad** | Hallazgos de seguridad (CRIT resueltos y pendientes), vulnerabilidad de fuga de saldo en amigos, protección de datos de menores (LFPDPPP) y estado de pruebas. |
| [08_DECISIONES_Y_CONTRADICCIONES.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/08_DECISIONES_Y_CONTRADICCIONES.md) | **Registro de Decisiones y Detección de Contradicciones** | Bitácora cronológica de acuerdos y detección de 7 contradicciones críticas (proyecto residual PETER, archivos raíz duplicados, _phase2 sin consolidar, etc.). |
| [09_BACKLOG_CONSOLIDADO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/09_BACKLOG_CONSOLIDADO.md) | **Backlog Consolidado y Deuda Técnica** | Inventario estructurado de pendientes clasificados rigurosamente en P0 (bloqueantes), P1 (lanzamiento), P2 (mejoras) y P3 (futuro). |
| [10_ROADMAP_PROPUESTO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/10_ROADMAP_PROPUESTO.md) | **Roadmap Operativo de Continuidad** | Plan pragmático en 4 fases sin fechas ni presupuestos ficticios: estabilización, pilotaje en colegio real, pagos reales y escalamiento. |
| [11_FUENTES_Y_TRAZABILIDAD.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/11_FUENTES_Y_TRAZABILIDAD.md) | **Índice de Fuentes, Archivos y Trazabilidad** | Directorio completo de evidencias citables con rutas absolutas, líneas de código y hashes de commit. |
| [12_CONTEXTO_PARA_GPT6.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/12_CONTEXTO_PARA_GPT6.md) | **Documento Maestro de Transferencia para GPT-6** | Documento autónomo de alta densidad para iniciar conversaciones estratégicas en ChatGPT manteniendo 100% del contexto. |
| [13_PROTOCOLO_NUEVAS_CONVERSACIONES_IA.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/13_PROTOCOLO_NUEVAS_CONVERSACIONES_IA.md) | **Protocolo de Ingesta para IAs Externas** | Procedimiento estandarizado para integrar transcripciones y resúmenes futuros de Gemini, Claude u otras IAs sin romper la trazabilidad. |

---

## 🔍 Reglas de Navegación y Lectura

1. **Para visión estratégica inmediata:** Comience por [00_RESUMEN_EJECUTIVO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/00_RESUMEN_EJECUTIVO.md).
2. **Para alimentar una nueva sesión de ChatGPT:** Copie y pegue directamente el contenido de [12_CONTEXTO_PARA_GPT6.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/12_CONTEXTO_PARA_GPT6.md).
3. **Para decisiones comerciales y financieras:** Revise [01_VISION_Y_MODELO_NEGOCIO.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/01_VISION_Y_MODELO_NEGOCIO.md) y la simulación en [CommercialSimulator.tsx](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/src/components/SuperAdmin/CommercialSimulator.tsx).
4. **Para auditoría técnica de código:** Consulte [03_MATRIZ_FUNCIONALIDADES.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/03_MATRIZ_FUNCIONALIDADES.md) y [05_GITHUB_HISTORIAL_Y_RAMAS.md](file:///c:/Users/Usuario1/FRCB/Mecard-main-clean/docs/contexto-maestro-mecard/05_GITHUB_HISTORIAL_Y_RAMAS.md).
