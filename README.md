# SalesAnalysisCube + SalesLens BI

This repository now contains two layers:

- The original SSAS multidimensional cube project at the repository root
- A new full-stack BI application in [app](C:/Users/Asus%20TUF/source/repos/SalesAnalysisCube/app)

## Repository Structure

- `SalesAnalysisCube/`: SSAS cube model
- `deploy-ssas.ps1`: cube deployment and processing
- `diagnose-ssas-process.ps1`: SSAS troubleshooting helper
- `app/web`: Next.js dashboard
- `app/api`: NestJS analytics API
- `app/packages/contracts`: shared contracts

## BI Architecture

`Source DB -> SSIS -> Data Warehouse -> SSAS Cube -> NestJS API -> Next.js Dashboard`

## SalesLens BI

The new application under `app/` includes:

- Executive overview dashboard
- Products, customers, sales reps, time analysis, calendar, explorer, reports, and settings routes
- Global filter bar shared across pages
- Mock-first backend aligned to the cube dimensions and measures
- Live warehouse mode for real project data plus SSAS/MDX-ready scaffolding
- CSV, Excel, and PDF export helpers

See [app/README.md](C:/Users/Asus%20TUF/source/repos/SalesAnalysisCube/app/README.md) for the full app-specific setup.

## SSAS Deployment

Deploy and process the cube:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-ssas.ps1
```

## Current Environment

Root `.env` is already configured for this machine:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
CUBE_ADAPTER=ssas
SSAS_SERVER=KAYTA\AHMED
SSAS_DATABASE=SalesAnalysisCube
SSAS_CUBE=SalesAnalysisCube
```

When `CUBE_ADAPTER=ssas`, the Nest API now serves live BI data from the SQL warehouse behind the cube. By default it discovers the warehouse connection from `SalesAnalysisCube/Bi.ds`, and you can override that with `WAREHOUSE_SQL_SERVER` and `WAREHOUSE_SQL_DATABASE` if needed.
