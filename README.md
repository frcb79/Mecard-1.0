<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yGcB3ezNGIW-2qbZ8WQWvceAidxehHSv

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Set environment variables in `.env.local` (see `.env.example`)
3. Run la app:
   `npm run dev`
4. Open http://localhost:5173

### Environment notes

- If `VITE_REQUIRE_SUPABASE=false` (default), the app can run in mock/fallback mode.
- If `VITE_REQUIRE_SUPABASE=true`, startup will fail fast unless `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are valid.

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test -- --run

# View test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Type Checking

```bash
npm run type-check
```

## Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Setting up Vercel automated deployment
- GitHub Actions CI/CD pipeline
- Environment variables configuration
- Manual deployment instructions

The project uses automatic deployment to Vercel on push to main branch.

## Documentación viva del proyecto

- `docs/project/PROJECT_BRAIN.md` — Estado actual, sprint goals, próximos hitos.
- `docs/project/DECISIONS.md` — Decisiones de arquitectura y diseño.
- `docs/project/ERROR_LOG.md` — Incidentes, causas raíz y lecciones.
- `docs/project/CHANGELOG.md` — Registro de cambios release/sprint.
- `docs/skills/README.md` — Skills por dominio y centro de consultas.
- `.github/copilot-instructions.md` — Reglas de codificación para Copilot.
- `.cursor/rules/main.mdc` — Reglas de desarrollo para editor cuando está instalado Cursor.

