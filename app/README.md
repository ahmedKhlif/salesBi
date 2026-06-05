# SalesLens BI

SalesLens BI is the new full-stack demonstration platform for the existing SSAS cube project in this repository.

## Architecture

`Source DB -> SSIS ETL -> SQL Server DW -> SSAS Cube -> NestJS API -> Next.js Dashboard`

## Workspace

- `web/`: Next.js App Router frontend
- `api/`: NestJS analytics backend
- `packages/contracts/`: shared frontend/backend contracts

The SSAS multidimensional project and deployment scripts remain at the repository root.

## Run

From `app/`:

```powershell
npm run dev:api
npm run dev:web
```

Or directly:

```powershell
cd api
npm run start:dev

cd ../web
npm run dev
```

## Environment

Frontend:

- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

Backend:

- `PORT=3001`
- `CUBE_ADAPTER=mock` or `CUBE_ADAPTER=ssas`
- `CUBE_MODE=...` is still accepted for backward compatibility
- `SSAS_SERVER=KAYTA\AHMED`
- `SSAS_DATABASE=SalesAnalysisCube`
- `SSAS_CUBE=SalesAnalysisCube`
- `SSAS_ADOMD_PATH=...`
- `WAREHOUSE_SQL_SERVER=KAYTA` optional
- `WAREHOUSE_SQL_DATABASE=bi` optional

If `WAREHOUSE_SQL_SERVER` and `WAREHOUSE_SQL_DATABASE` are not set, the API reads the relational source connection from `../SalesAnalysisCube/Bi.ds` and uses that for live data mode.

## Features

- Executive KPI overview
- Product, customer, sales rep, time, calendar, explorer, reports, and settings pages
- Global filter bar shared across routes
- Mock-first analytics API shaped for the real cube
- Real-data mode backed by the live warehouse behind the cube
- SSAS adapter and MDX template scaffolding for the next cube-query step
- CSV, Excel, and PDF export helpers

## Build

```powershell
cd api
npm run build

cd ../web
npm run build
```
