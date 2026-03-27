# Deployment Guide - meCard

## Overview
This guide explains how to set up automated deployment to Vercel using GitHub Actions CI/CD pipeline.

## Prerequisites
- GitHub repository with push access
- Vercel account (https://vercel.com)
- Node.js 20+ locally for testing

## Quick Setup

### 1. Testing Locally
```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run tests
npm run test

# Preview build locally
npm run build
npm run preview
```

### 2. Setup Vercel Project
1. Go to https://vercel.com/dashboard
2. Import your GitHub repository (`frcb79/Mecard-1.0`)
3. Configure project settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Copy the following from Vercel project:
   - `VERCEL_ORG_ID` (Account ID in settings)
   - `VERCEL_PROJECT_ID` (Project ID after import)
   - `VERCEL_TOKEN` (Create a new token at https://vercel.com/account/tokens)

### 3. Configure GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_org_id>
VERCEL_PROJECT_ID=<your_project_id>
```

### 4. Environment Variables
If your project needs environment variables (e.g., Supabase keys), add them:

**In Vercel Dashboard:**
- Go to Project Settings → Environment Variables
- Add all required variables

**In GitHub (optional for CI):**
Add as secrets if needed for CI checks.

## CI/CD Pipeline

The `.github/workflows/deploy.yml` workflow:

1. **Triggers:**
   - On every push to `main` branch
   - On every pull request to `main` branch

2. **Build & Test Job:**
   - Checks out code
   - Installs dependencies
   - Runs TypeScript type checking
   - Runs Vitest tests
   - Builds the project

3. **Deploy Job (main branch only):**
   - Only runs if build-and-test succeeds
   - Deploys to Vercel production

## Running Tests Locally

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test -- --run

# View test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Troubleshooting

### "npm ci" fails with "package.json and package-lock.json are not in sync"
This is a lockfile drift issue.

Fix sequence:
1. `npm install --legacy-peer-deps`
2. `npm ci --legacy-peer-deps`
3. `npm run verify:deploy`
4. Commit updated `package-lock.json` (and `package.json` if changed)

Notes:
- Vercel uses `npm ci` (via `vercel.json`), so lockfile sync is mandatory.
- Keep Node version aligned with project policy (`20.x`) across local, CI and Vercel.

### "VERCEL_TOKEN not found"
Ensure you've added the secret to GitHub repository settings.

### "Deployment failed - build error"
Check the GitHub Actions logs:
1. Go to repository → Actions tab
2. Click the failed workflow
3. Expand the "Build" step for error details

### Tests failing in CI but passing locally
Ensure your test setup matches CI environment (Node.js 20, Linux runner). Check GitHub Actions logs for specific failures.

### Build output missing
Verify:
- `npm run build` succeeds locally
- `dist/` folder is created
- Vite config is correct

## Manual Deployment

If you need to deploy without GitHub Actions:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel deploy --prod
```

## Next Steps
- [ ] Set up Vercel project
- [ ] Add GitHub secrets
- [ ] Add environment variables to Vercel
- [ ] Push code to main branch
- [ ] Monitor first deployment in Actions tab

## Pre-Deploy Checklist (60 seconds)
1. `npm ci --legacy-peer-deps`
2. `npm run type-check`
3. `npm run test -- --run`
4. `npm run build`
5. Optional one-shot: `npm run verify:deploy`
