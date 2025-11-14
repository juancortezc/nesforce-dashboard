# Nesforce Dashboard

Dashboard de analítica para Nesforce conectado a BigQuery.

## 🌐 Producción

**URL**: https://lala4-377416.rj.r.appspot.com

## 📦 Stack

- Next.js 15 + TypeScript
- BigQuery (`lala4-377416.lala4`)
- Tailwind CSS
- Google App Engine

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
lib/bigquery.ts          # Cliente BigQuery
pages/api/               # APIs
  ├── test-connection.ts
  ├── results.ts
  └── transactions.ts
pages/dashboard.tsx      # Dashboard principal
components/              # Componentes React
```

## 🔌 APIs

```
GET /api/test-connection
GET /api/results?limit=100
GET /api/transactions?limit=100
```

## 🚀 Deployment

```bash
npm run build
gcloud app deploy --project=lala4-377416
```

Ver logs:
```bash
gcloud app logs tail -s default
```

## 📝 Crear Nueva API

```typescript
// pages/api/mi-api.ts
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req, res) {
  const query = `SELECT * FROM ${TABLES.RESULTS} LIMIT 100`;
  const data = await executeQuery(query);
  res.json({ success: true, data });
}
```

## ⚠️ Notas

- No usar `program_id` (dataset exclusivo)
- Puerto: `3004`
- BigQuery location: `southamerica-east1`
- `.env` no se sube a git
