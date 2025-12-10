# Despliegue de Nesforce en Cloud Run

> **Estado**: ✅ Desplegado en producción
> **URL**: https://nesforce-dashboard-398007116762.us-central1.run.app
> **Última versión**: v2.0 (2025-12-09)

## Últimos Cambios

### v2.0 - Filtro de Región (2025-12-09)
- ✅ Filtro de región agregado a todas las páginas (5 componentes)
- ✅ Filtrado en cascada: Región → Segmento → Distribuidor
- ✅ 20+ APIs actualizadas para soportar filtro `region`
- ✅ Campo BigQuery: `group_region`
- ✅ Interfaz actualizada con 6 filtros por fila

## Requisitos Previos

1. Google Cloud CLI instalado y configurado
2. Proyecto GCP: `lala4-377416`
3. Credenciales de service account con permisos de BigQuery

## Configuración Inicial (Una sola vez)

### 1. Configurar proyecto
```bash
gcloud config set project lala4-377416
```

### 2. Habilitar APIs necesarias
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 3. Crear Secret con credenciales de BigQuery

Primero, crea un archivo temporal con las credenciales JSON:

```bash
# Opción A: Crear desde archivo existente
gcloud secrets create nesforce-bigquery-credentials \
  --data-file=/ruta/a/tu/credentials.json

# Opción B: Crear desde variable de entorno
echo $GOOGLE_APPLICATION_CREDENTIALS | gcloud secrets create nesforce-bigquery-credentials --data-file=-
```

### 4. Dar permisos al Service Account de Cloud Run

```bash
# Obtener el service account de Cloud Run
PROJECT_NUMBER=$(gcloud projects describe lala4-377416 --format='value(projectNumber)')

# Dar acceso al secret
gcloud secrets add-iam-policy-binding nesforce-bigquery-credentials \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Despliegue

### Opción 1: Script automático
```bash
./deploy-cloudrun.sh
```

### Opción 2: Comandos manuales

```bash
# Build de la imagen
gcloud builds submit --tag gcr.io/lala4-377416/nesforce-dashboard:latest .

# Desplegar a Cloud Run
gcloud run deploy nesforce-dashboard \
  --image gcr.io/lala4-377416/nesforce-dashboard:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60s \
  --concurrency 100 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --update-secrets "GOOGLE_APPLICATION_CREDENTIALS=nesforce-bigquery-credentials:latest"
```

### Opción 3: Cloud Build CI/CD
```bash
gcloud builds submit --config=cloudbuild.yaml
```

## Verificación

### Ver URL del servicio
```bash
gcloud run services describe nesforce-dashboard --region us-central1 --format 'value(status.url)'
```

### Ver logs
```bash
gcloud run logs read --service nesforce-dashboard --region us-central1
```

### Test de conexión
```bash
curl https://[TU-URL]/api/test-connection
```

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Run (us-central1)                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Nesforce Dashboard (Next.js)              │   │
│  │                                                     │   │
│  │  - 31 API endpoints                                 │   │
│  │  - SSR React components                             │   │
│  │  - Puerto 8080                                      │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BigQuery (southamerica-east1)                  │
│                                                             │
│  Dataset: lala4-377416.lala4                                │
│  Tablas:                                                    │
│    - nesforce_results                                       │
│    - nestle_transactions                                    │
│    - nestjsRequests                                         │
└─────────────────────────────────────────────────────────────┘
```

## Variables de Entorno

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `NODE_ENV` | Ambiente | `production` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Credenciales GCP (JSON) | Secret Manager |
| `PORT` | Puerto (automático) | `8080` |

## Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS is required"
- Verificar que el secret esté creado correctamente
- Verificar permisos del service account

### Error: BigQuery permission denied
- El service account necesita rol `BigQuery Data Viewer`
- El service account necesita rol `BigQuery Job User`

### Error: Container failed to start
- Verificar logs: `gcloud run logs read --service nesforce-dashboard --region us-central1`
- Verificar que el build sea exitoso

## Diferencias con App Engine

| Característica | App Engine | Cloud Run |
|----------------|------------|-----------|
| Región | `us-central1` | `us-central1` |
| Escalado | Automático F2 | Automático (0-10) |
| Memoria | 512MB | 1GB |
| Timeout | 60s | 60s |
| Contenedor | Gestionado | Docker |
| Secrets | .env.yaml | Secret Manager |
