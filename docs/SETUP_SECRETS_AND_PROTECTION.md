**Configurar Secrets y Protección de Branches**

Este documento explica cómo añadir los secretos necesarios y aplicar protección a `main` y `staging` usando la CLI de GitHub (`gh`). Requiere que tengas permisos de admin en el repositorio y `gh` autenticado.

1) Preparar `gh` (si no lo tienes):

```bash
gh auth login
```

2) Añadir secrets (repo-level). Ejecuta desde tu máquina local y reemplaza los valores:

```bash
# Supabase
gh secret set SUPABASE_URL --body "https://your-project-url.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-anon-key"

# Gemini (opcional)
gh secret set GEMINI_API_KEY --body "your_gemini_api_key"

# Vercel (si usas despliegue automático)
gh secret set VERCEL_TOKEN --body "your_vercel_token"
gh secret set VERCEL_PROJECT_ID --body "your_vercel_project_id"
gh secret set VERCEL_ORG_ID --body "your_vercel_org_id"
```

3) (Opcional) Crear Environment-specific secrets en GitHub (staging/production):

```bash
# Crear environment staging
gh api repos/{owner}/{repo}/environments -f name=staging
gh secret set SUPABASE_URL -b "https://staging-url.supabase.co" --env staging
# Repite para production
gh api repos/{owner}/{repo}/environments -f name=production
gh secret set SUPABASE_URL -b "https://prod-url.supabase.co" --env production
```

4) Proteger branch `main` y `staging` (requiere admin). Reemplaza `{owner}` y `{repo}`.

```bash
# Payload de ejemplo para protección (requiere PR reviews y status checks)
cat > protection.json <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Build & Typecheck"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
JSON

# Aplicar a main
gh api --method PUT /repos/{owner}/{repo}/branches/main/protection --input protection.json

# Aplicar a staging (puedes relajar `enforce_admins` si quieres)
gh api --method PUT /repos/{owner}/{repo}/branches/staging/protection --input protection.json

rm protection.json
```

Notas importantes:
- `contexts` debe coincidir con el nombre exacto del status check que aparece en la PR (ej. el job de CI). Ajusta el nombre si la verificación tiene otro label.
- `require_code_owner_reviews` hará que se solicite aprobación de los listados en `CODEOWNERS`.
- Si no tienes admin rights, ejecuta estos pasos con la persona que administre el repositorio.

5) Verificación manual (UI):
- Ve a Settings → Branches → Branch protection rules y valida que las reglas están activas.

Si quieres, puedo generar un script automatizado que reemplace `{owner}`/`{repo}` con los valores reales y lo ejecute si me proporcionas un token con permisos de admin. No ejecutaré nada sin tu OK.
