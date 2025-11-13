# 🚀 Quick Start - Nesforce Dashboard

## Resumen del Boilerplate

✅ **Boilerplate completo** para dashboard Nesforce basado en la arquitectura de Nutriexpertos.

### ✨ Lo que está incluido:

- ✅ Estructura de carpetas completa (lib, pages, components, utils, styles)
- ✅ Configuración de Next.js 15 + TypeScript
- ✅ Capa de transporte BigQuery (`lib/bigquery.ts`)
- ✅ Conexión a tablas: `nesforce_results` y `nestle_transactions`
- ✅ 3 APIs de ejemplo (test-connection, results, transactions)
- ✅ Página principal con UI de prueba de conexión
- ✅ Configuración para deployment en Google App Engine
- ✅ Documentación completa (README.md, DEPLOYMENT.md)

## 🏃 Inicio Rápido (5 minutos)

### 1. Instalar dependencias

```bash
cd nesforce
npm install
```

### 2. Configurar credenciales

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tus credenciales de BigQuery
# nano .env  o  code .env
```

En `.env`, reemplaza con tus credenciales reales:

```env
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"lala4-377416",...}
```

### 3. Ejecutar

```bash
npm run dev
```

### 4. Probar

Abre tu navegador en [http://localhost:3004](http://localhost:3004)

Haz clic en **"Probar Conexión a BigQuery"**

Si ves ✅ verde: **¡Todo funciona!**

## 📊 Arquitectura

### Conexión BigQuery

```
lib/bigquery.ts
├── getBigQueryClient()        # Cliente singleton
├── executeQuery()             # Ejecutar queries con params
├── detectTableColumns()       # Detectar columnas
└── BigQueryService            # Métodos útiles
    ├── getResults()
    ├── getTransactions()
    └── testConnection()
```

### APIs Disponibles

```
GET /api/test-connection       # Test completo de conexión
GET /api/results?limit=100     # Datos de nesforce_results
GET /api/transactions?limit=100 # Datos de nestle_transactions
```

### Configuración BigQuery

- **Proyecto**: `lala4-377416`
- **Dataset**: `lala4`
- **Location**: `southamerica-east1`
- **Tablas**: `nesforce_results`, `nestle_transactions`
- **Sin program_id** (dataset exclusivo)

## 🎨 Próximos Pasos

### 1. Explorar las Tablas

Usa el test de conexión para ver qué columnas están disponibles en cada tabla.

### 2. Crear tu Primera Query Personalizada

Crea un nuevo archivo `pages/api/mi-query.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = `
      SELECT column1, column2, COUNT(*) as count
      FROM ${TABLES.RESULTS}
      GROUP BY column1, column2
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

### 3. Crear tu Primera Vista

Crea `pages/mi-dashboard.tsx`:

```typescript
import Head from 'next/head';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MiDashboard() {
  const { data, error } = useSWR('/api/mi-query', fetcher);

  if (error) return <div>Error al cargar datos</div>;
  if (!data) return <div>Cargando...</div>;

  return (
    <>
      <Head>
        <title>Mi Dashboard - Nesforce</title>
      </Head>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Mi Dashboard</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </main>
    </>
  );
}
```

### 4. Agregar Componentes

Crea componentes reutilizables en `components/`:

```typescript
// components/DataTable.tsx
export default function DataTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        {/* Tu tabla aquí */}
      </table>
    </div>
  );
}
```

## 🚀 Deploy a Producción

### Quick Deploy

```bash
# Build
npm run build

# Deploy a Google App Engine
gcloud app deploy --project=lala4-377416
```

Ver guía completa en [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 Documentación Completa

- **[README.md](./README.md)** - Documentación general del proyecto
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment
- **[.env.example](./.env.example)** - Ejemplo de variables de entorno

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Puerto 3004

# Build
npm run build        # Build de producción

# Start production
npm start            # Puerto 3004

# Lint
npm run lint

# Deploy
gcloud app deploy --project=lala4-377416
```

## 🔍 Troubleshooting

### ❌ Error: "GOOGLE_APPLICATION_CREDENTIALS is required"

→ No configuraste el archivo `.env`
→ Copia `.env.example` a `.env` y agrega tus credenciales

### ❌ Error: "Cannot connect to BigQuery"

→ Verifica que las credenciales JSON sean válidas
→ Verifica que el service account tenga permisos de BigQuery

### ❌ Puerto 3004 en uso

```bash
# Cambiar puerto en package.json
"dev": "next dev -p 3005"
```

## 💡 Tips

1. **Usa SWR** para caché automático de datos
2. **Usa Recharts** para gráficos (ya está en package.json)
3. **Crea componentes reutilizables** en `/components`
4. **Lee los logs** con `gcloud app logs tail` en producción
5. **Revisa ejemplos** en el proyecto nutriexpertos

## 📊 Diferencias con Nutriexpertos

| Característica | Nutriexpertos | Nesforce |
|----------------|---------------|----------|
| Tables | nestjsSnapItems, nestjsParticipants | nesforce_results, nestle_transactions |
| Program ID | Sí (33) | No (dataset exclusivo) |
| Puerto | 3003 | 3004 |
| Filtros automáticos | program_id, is_test, year | Sin filtros predefinidos |

## ✅ Checklist de Inicio

- [ ] npm install ejecutado
- [ ] .env creado con credenciales
- [ ] npm run dev funciona
- [ ] Test de conexión exitoso
- [ ] APIs responden correctamente
- [ ] Listo para desarrollar tu dashboard

---

**¡Todo listo para empezar a desarrollar! 🎉**

Si tienes dudas, revisa:
1. README.md (documentación general)
2. DEPLOYMENT.md (deployment en producción)
3. Proyecto nutriexpertos (para ejemplos)
