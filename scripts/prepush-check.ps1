Write-Host "[prepush] Starting local verification..." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

if (-not (Test-Path "package.json")) {
  throw "[prepush] package.json not found. Run this script from project root."
}

Write-Host "[prepush] 1/4 npm ci --legacy-peer-deps" -ForegroundColor Yellow
npm.cmd ci --legacy-peer-deps

Write-Host "[prepush] 2/4 npm run test -- --run" -ForegroundColor Yellow
npm.cmd run test -- --run

Write-Host "[prepush] 3/4 npm run build" -ForegroundColor Yellow
npm.cmd run build

Write-Host "[prepush] 4/4 npm run type-check" -ForegroundColor Yellow
npm.cmd run type-check

Write-Host "[prepush] OK: local verification finished." -ForegroundColor Green