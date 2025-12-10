# Nesforce Dashboard

Dashboard de analítica para Nesforce conectado a BigQuery.

## 🌐 Producción

**URL Cloud Run**: https://nesforce-dashboard-398007116762.us-central1.run.app
~~URL App Engine (deprecated)~~: https://lala4-377416.rj.r.appspot.com

## 📦 Stack

- Next.js 15 + TypeScript
- BigQuery (`lala4-377416.lala4`)
- Material-UI 6 + Tailwind CSS
- **Cloud Run** (us-central1)
- Docker (standalone build)

## 📊 Tablas BigQuery

- `nesforce_results` - Resultados
- `nestle_transactions` - Transacciones

## 🚀 Inicio Rápido

```bash
npm install
npm run dev  # http://localhost:3004
```

Configurar `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account"...}'
```

## 📁 Estructura

```
lib/bigquery.ts              # Cliente BigQuery
pages/api/                   # 33 APIs
  ├── test-connection.ts
  ├── results-filter-options.ts
  ├── points-*.ts            # APIs de puntos (3)
  ├── results-*.ts           # APIs de resultados (5)
  ├── comparatives-*.ts      # APIs de comparativos (4)
  ├── program28-*.ts         # APIs programa 28 (5)
  ├── transactions-*.ts      # APIs transacciones (5)
  └── achievement-*.ts       # APIs de logros (2)
pages/dashboard.tsx          # Dashboard principal
components/                  # Componentes React
  ├── PointsPage.tsx
  ├── ResultsAnalysisPage.tsx
  ├── ComparativesPage.tsx
  ├── Program28Page.tsx
  └── TransactionsPage.tsx
```

## 🔌 APIs

### Filtros
```
GET /api/results-filter-options?region=COSTA&segment=DSD
```
Retorna: `regions`, `segments`, `groups`, `positions`, `routes`, `kpis`

### Puntos
```
GET /api/points-monthly?region=COSTA&segment=DSD&position=Vendedor
GET /api/points-by-kpi?region=COSTA&kpi=Presupuesto
GET /api/achievement-by-month?region=COSTA
```

### Resultados
```
GET /api/results-by-group?region=COSTA&month=11&year=2025
GET /api/results-by-kpi?region=COSTA&segment=DSD
GET /api/results-by-segment?region=COSTA
```

### Comparativos
```
GET /api/comparatives-summary?region=COSTA
GET /api/comparatives-by-kpi?region=COSTA&kpi=Presupuesto
```

### Todos los endpoints aceptan el parámetro `region`

## 🚀 Deployment

### Cloud Run (Actual)

```bash
# Despliegue automático
./deploy-cloudrun.sh

# O manualmente:
gcloud builds submit --tag gcr.io/lala4-377416/nesforce-dashboard:latest .
gcloud run deploy nesforce-dashboard \
  --image gcr.io/lala4-377416/nesforce-dashboard:latest \
  --region us-central1 \
  --platform managed
```

Ver logs:
```bash
gcloud run logs read --service nesforce-dashboard --region us-central1
```

### Configuración

- **Dockerfile**: Build multi-stage optimizado
- **Puerto**: 8080 (Cloud Run estándar)
- **Región**: us-central1 (USA)
- **Memoria**: 1GB
- **CPU**: 1 vCPU
- **Escalado**: 0-10 instancias
- **Secrets**: `GOOGLE_APPLICATION_CREDENTIALS` desde Secret Manager

## 📝 Crear Nueva API con Filtros

```typescript
// pages/api/mi-api.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { region, segment, group, position } = req.query;

    // Build WHERE conditions
    const conditions: string[] = [];
    if (region) conditions.push(`group_region = '${region}'`);
    if (segment) conditions.push(`segment_name = '${segment}'`);
    if (group) conditions.push(`group_name = '${group}'`);
    if (position) conditions.push(`position_name = '${position}'`);

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT *
      FROM ${TABLES.RESULTS}
      ${whereClause}
      LIMIT 100
    `;

    const data = await executeQuery(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

## 🎯 Filtros Implementados

### Filtro de Región (NUEVO)

Todas las páginas ahora incluyen filtro por **Región**:
- ✅ PointsPage
- ✅ ResultsAnalysisPage
- ✅ ComparativesPage
- ✅ Program28Page
- ✅ TransactionsPage

**Campo BigQuery**: `group_region`

**Filtrado en cascada**:
1. **Región** → Filtra Segmentos y Distribuidores
2. **Segmento** → Filtra Distribuidores
3. **Distribuidor** → Filtro final

### Regiones Disponibles

Las regiones se obtienen dinámicamente de BigQuery:
```sql
SELECT DISTINCT group_region
FROM lala4-377416.lala4.nesforce_results
WHERE group_region IS NOT NULL
```

Ejemplos: COSTA, SIERRA, ORIENTE, etc.

## ⚠️ Notas

- No usar `program_id` (dataset exclusivo)
- Puerto desarrollo: `3004`
- Puerto producción: `8080`
- BigQuery location: `southamerica-east1`
- `.env` no se sube a git
- **Filtro de región disponible en todos los endpoints**
