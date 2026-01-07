**Entornos: Staging y Production**

- Objetivo: mantener dos entornos separados para pruebas (`staging`) y para usuarios finales (`production` / `main`).
- Branching:
  - `main` -> código listo para producción. Solo se mergea con aprobación del propietario.
  - `staging` -> integración de feature branches para pruebas; despliegue automático a staging.
  - Feature branches -> crear PR hacia `staging`.

- Flujo recomendado:
  1. Crear feature branch: `feature/xyz`.
  2. Hacer PR hacia `staging`. CI corre (build + typecheck). Desplegará a Vercel staging si está configurado.
  3. QA / pruebas en `staging`. Una vez aprobado por el propietario, crear PR desde `staging` hacia `main` o merge directo con aprobación.
  4. CI en `main` ejecuta build y despliega a producción si `VERCEL_TOKEN` está en `secrets`.

- Variables de entorno / secretos necesarios (setear en Vercel o GitHub Secrets):
  - `SUPABASE_URL` — URL del proyecto Supabase.
  - `SUPABASE_ANON_KEY` — key pública.
  - `GEMINI_API_KEY` — (si se usa Gemini pro)
  - `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID` — para despliegues automáticos.

- Policy de cambios (tu requisito):
  - Ningún cambio en `main` ni merges importantes se harán sin aprobación explícita del propietario.
  - Los cambios pueden probarse en `staging` vía PR. El propietario valida y aprueba el merge a `main`.

- Cómo configurar localmente:
  1. Copia `.env.example` a `.env.local` y completa variables.
  2. Instala dependencias: `npm install`.
  3. Ejecuta: `npm run dev`.
