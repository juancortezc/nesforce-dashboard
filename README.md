# Nesforce Dashboard

Dashboard de analítica para Nesforce conectado a BigQuery con datos de `nesforce_results` y `nestle_transactions`.

## 📦 Repositorio

- **GitHub**: [https://github.com/juancortezc/nesforce-dashboard](https://github.com/juancortezc/nesforce-dashboard)
- **Directorio Local**: `/Users/jac/Apps/nestle/nesforce`

## 🚀 Stack Técnico

- **Framework**: Next.js 15 con Pages Router
- **Lenguaje**: TypeScript
- **Base de datos**: BigQuery (Google Cloud)
- **Estilos**: Tailwind CSS
- **Deployment**: Google App Engine
- **Data Fetching**: SWR (opcional, para implementar)
- **Gráficos**: Recharts (opcional, para implementar)

## 📊 Arquitectura de Datos

### Proyecto BigQuery
- **Project ID**: `lala4-377416`
- **Dataset**: `lala4`
- **Ubicación**: `southamerica-east1`

### Tablas Principales
1. **nesforce_results**: Datos de resultados de Nesforce
2. **nestle_transactions**: Datos de transacciones de Nestle

**Nota**: Este dataset NO usa program_id, es exclusivo para Nesforce.

## 🛠️ Configuración Inicial

### 1. Instalar Dependencias

```bash
cd nesforce
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tus credenciales de BigQuery:

```env
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"lala4-377416",...}
```

**Importante**: Las credenciales deben ser un JSON string completo del service account de Google Cloud.

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3004](http://localhost:3004)

## 🧪 Probar Conexión

Una vez configuradas las credenciales, visita la página principal y haz clic en "Probar Conexión a BigQuery" para verificar:

- ✅ Conexión a BigQuery exitosa
- ✅ Acceso a tabla `nesforce_results`
- ✅ Acceso a tabla `nestle_transactions`
- ✅ Lectura de columnas y datos de muestra

## 📁 Estructura del Proyecto

```
nesforce/
├── lib/
│   └── bigquery.ts          # Cliente y utilidades de BigQuery
├── pages/
│   ├── api/
│   │   ├── test-connection.ts   # API de prueba de conexión
│   │   ├── results.ts           # API para nesforce_results
│   │   └── transactions.ts      # API para nestle_transactions
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx             # Página principal
├── components/               # Componentes React (vacío, listo para usar)
├── utils/                    # Utilidades (vacío, listo para usar)
├── styles/
│   └── globals.css
├── public/                   # Archivos estáticos
├── .env.example             # Ejemplo de variables de entorno
├── app.yaml                 # Configuración para Google App Engine
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔌 APIs Disponibles

### 1. Test de Conexión
```
GET /api/test-connection
```
Verifica la conexión a BigQuery y retorna información sobre las tablas.

### 2. Obtener Results
```
GET /api/results?limit=100
```
Obtiene datos de la tabla `nesforce_results`.

### 3. Obtener Transactions
```
GET /api/transactions?limit=100
```
Obtiene datos de la tabla `nestle_transactions`.

## 🚢 Deployment en Google App Engine

### 1. Configurar Google Cloud CLI

```bash
# Login
gcloud auth login

# Configurar proyecto
gcloud config set project lala4-377416
```

### 2. Configurar Variables de Entorno en Google Cloud

Las credenciales de BigQuery deben configurarse como variables de entorno en Google Cloud Console:

1. Ve a Google Cloud Console → App Engine → Settings → Environment Variables
2. Agrega la variable `GOOGLE_APPLICATION_CREDENTIALS` con el JSON completo

### 3. Build y Deploy

```bash
# Build de producción
npm run build

# Deploy a Google App Engine
gcloud app deploy --project=lala4-377416
```

### 4. Ver Logs

```bash
gcloud app logs tail -s default
```

## 📝 Desarrollo de Nuevas Funcionalidades

### Crear una Nueva API

1. Crea un archivo en `pages/api/`:

```typescript
// pages/api/mi-nueva-api.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery, TABLES } from '@/lib/bigquery';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = `
      SELECT *
      FROM ${TABLES.RESULTS}
      WHERE condicion = @param
      LIMIT 100
    `;

    const results = await executeQuery(query, { param: 'valor' });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

### Crear una Nueva Página

1. Crea un archivo en `pages/`:

```typescript
// pages/mi-dashboard.tsx
import Head from 'next/head';

export default function MiDashboard() {
  return (
    <>
      <Head>
        <title>Mi Dashboard - Nesforce</title>
      </Head>
      <main>
        <h1>Mi Dashboard</h1>
      </main>
    </>
  );
}
```

## 🔍 Utilidades de BigQuery

El archivo `lib/bigquery.ts` incluye:

- **`getBigQueryClient()`**: Obtiene el cliente singleton de BigQuery
- **`executeQuery(query, params)`**: Ejecuta queries con parámetros
- **`detectTableColumns(tableName)`**: Detecta columnas de una tabla
- **`toNumber(value)`**: Convierte valores a número o null
- **`toString(value)`**: Convierte valores a string o null
- **`BigQueryService.testConnection()`**: Test de conexión
- **`BigQueryService.getResults()`**: Obtiene datos de nesforce_results
- **`BigQueryService.getTransactions()`**: Obtiene datos de nestle_transactions
- **`BigQueryService.getTableSchema()`**: Obtiene el esquema de una tabla

## 📚 Próximos Pasos

1. **Explorar las Tablas**: Usa la API de test para ver qué columnas están disponibles
2. **Crear Queries Personalizadas**: Desarrolla APIs específicas según tus necesidades
3. **Diseñar el Dashboard**: Crea vistas y visualizaciones personalizadas
4. **Implementar Componentes**: Usa Recharts o tu librería preferida para gráficos
5. **Agregar SWR**: Implementa caché y revalidación automática de datos

## 🎨 Personalización de Estilos

El proyecto usa Tailwind CSS. Puedes personalizar los colores y estilos en:

- `tailwind.config.js`: Configuración de tema
- `styles/globals.css`: Estilos globales

## ⚠️ Notas Importantes

- **Sin Program ID**: A diferencia de Nutriexpertos, este dataset NO tiene program_id
- **Credenciales**: Nunca commitees el archivo `.env` al repositorio
- **Port**: El proyecto usa el puerto 3004 por defecto
- **BigQuery Location**: Las queries deben especificar `location: 'southamerica-east1'`

## 🤝 Soporte

Para preguntas o problemas:
1. Verifica que las credenciales estén correctamente configuradas
2. Revisa los logs de la aplicación
3. Usa la API `/api/test-connection` para diagnosticar

---

**Generado con Claude Code** 🤖
