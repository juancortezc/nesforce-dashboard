# 🚀 Quick Start - Nesforce Dashboard

## Producción

**URL**: https://lala4-377416.rj.r.appspot.com

## Local (3 pasos)

### 1. Instalar
```bash
npm install
```

### 2. Configurar `.env`
```env
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account"...}'
```

### 3. Ejecutar
```bash
npm run dev  # http://localhost:3004
```

## Verificar

1. Abrir http://localhost:3004
2. Click en "Probar Conexión a BigQuery"
3. Ver ✅ verde = Todo OK

## APIs Disponibles

```bash
curl http://localhost:3004/api/test-connection
curl http://localhost:3004/api/results?limit=10
curl http://localhost:3004/api/transactions?limit=10
```

## Crear Nueva API

```typescript
// pages/api/mi-api.ts
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(req, res) {
  const data = await executeQuery(`SELECT * FROM ${TABLES.RESULTS} LIMIT 100`);
  res.json({ success: true, data });
}
```

## Crear Nueva Página

```typescript
// pages/mi-dashboard.tsx
export default function MiDashboard() {
  return <div>Mi Dashboard</div>;
}
```

Acceder en: http://localhost:3004/mi-dashboard

## Deploy

```bash
npm run build
gcloud app deploy --project=lala4-377416 --quiet
```

## Stack

- Next.js 15 + TypeScript
- BigQuery: `lala4-377416.lala4`
- Tablas: `nesforce_results`, `nestle_transactions`
- Puerto: 3004

## Troubleshooting

**Error de credenciales**: Verificar `.env` existe y tiene JSON válido
**Puerto en uso**: Cambiar puerto en `package.json` -> `"dev": "next dev -p 3005"`
**Error BigQuery**: Verificar permisos del service account
