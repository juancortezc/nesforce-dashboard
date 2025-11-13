# 🚀 Guía de Deployment - Nesforce Dashboard

## Deployment en Google App Engine

Esta guía detalla el proceso completo para hacer deploy del dashboard Nesforce en Google App Engine, igual que Nutriexpertos.

## 📋 Pre-requisitos

1. **Google Cloud CLI** instalado
2. **Proyecto de Google Cloud**: `lala4-377416`
3. **Service Account** con permisos de BigQuery
4. **Credenciales JSON** del service account

## 🔧 Configuración Inicial

### 1. Instalar Google Cloud CLI (si no está instalado)

```bash
# macOS
brew install google-cloud-sdk

# Verificar instalación
gcloud --version
```

### 2. Autenticación

```bash
# Login a Google Cloud
gcloud auth login

# Configurar proyecto
gcloud config set project lala4-377416

# Verificar configuración
gcloud config list
```

### 3. Habilitar APIs Necesarias

```bash
# Habilitar App Engine API
gcloud services enable appengine.googleapis.com

# Habilitar BigQuery API (probablemente ya está habilitada)
gcloud services enable bigquery.googleapis.com
```

## 🔑 Configuración de Variables de Entorno

### Opción 1: Configurar en Google Cloud Console (Recomendado)

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona proyecto `lala4-377416`
3. Ve a **App Engine** → **Settings** → **Environment Variables**
4. Agrega variable:
   - **Name**: `GOOGLE_APPLICATION_CREDENTIALS`
   - **Value**: `{"type":"service_account","project_id":"lala4-377416",...}` (JSON completo)

### Opción 2: Usar archivo app.yaml

Edita `app.yaml` y agrega:

```yaml
env_variables:
  NODE_ENV: "production"
  GOOGLE_APPLICATION_CREDENTIALS: '{"type":"service_account",...}'
```

**⚠️ ADVERTENCIA**: NO commitees credenciales al repositorio si usas esta opción.

## 📦 Preparar el Proyecto para Deploy

### 1. Build Local (Opcional, para verificar)

```bash
cd nesforce
npm run build
```

### 2. Verificar archivos de configuración

Asegúrate de tener estos archivos:

- ✅ `app.yaml` - Configuración de App Engine
- ✅ `.gcloudignore` - Archivos a ignorar en deploy
- ✅ `package.json` - Con script de build
- ✅ `next.config.js` - Configuración de Next.js

## 🚀 Deploy a Google App Engine

### 1. Deploy Completo

```bash
cd nesforce
gcloud app deploy --project=lala4-377416
```

El CLI te preguntará:
- Región (si es primera vez): Selecciona `southamerica-east1` o la más cercana
- Confirmación: Escribe `Y`

### 2. Deploy Específico con Versión

```bash
gcloud app deploy --project=lala4-377416 --version=v1
```

### 3. Deploy sin Promover (Testing)

```bash
# Deploy sin hacer la versión activa
gcloud app deploy --no-promote --version=test
```

## 🔍 Verificar Deployment

### 1. Ver la URL de la Aplicación

```bash
gcloud app browse --project=lala4-377416
```

### 2. Ver Versiones

```bash
gcloud app versions list --project=lala4-377416
```

### 3. Ver Logs en Tiempo Real

```bash
gcloud app logs tail -s default --project=lala4-377416
```

### 4. Ver Servicios

```bash
gcloud app services list --project=lala4-377416
```

## 📊 Monitoreo y Debugging

### Ver Logs Históricos

```bash
# Últimas 100 líneas
gcloud app logs read --limit=100 --project=lala4-377416

# Filtrar por severidad
gcloud app logs read --level=error --project=lala4-377416
```

### Ver Métricas en Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. **App Engine** → **Dashboard**
3. Revisa:
   - Requests
   - Latency
   - Memory usage
   - Errors

## 🔄 Actualizar la Aplicación

### 1. Hacer Cambios en el Código

```bash
# Edita archivos...
# Test local
npm run dev
```

### 2. Deploy Nueva Versión

```bash
# Build (App Engine lo hace automáticamente, pero puedes verificar)
npm run build

# Deploy
gcloud app deploy --project=lala4-377416
```

### 3. Rollback a Versión Anterior (si hay problemas)

```bash
# Listar versiones
gcloud app versions list --project=lala4-377416

# Promover versión anterior
gcloud app versions migrate v1 --project=lala4-377416
```

## ⚙️ Configuración de app.yaml

El archivo `app.yaml` actual:

```yaml
runtime: nodejs20
instance_class: F2

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.65

env_variables:
  NODE_ENV: "production"
```

### Opciones de Escalamiento

**Automatic Scaling (Actual)**:
- `min_instances: 0` - Escala a cero cuando no hay tráfico
- `max_instances: 10` - Máximo 10 instancias simultáneas
- `target_cpu_utilization: 0.65` - Escala cuando CPU > 65%

**Basic Scaling (Alternativa)**:
```yaml
basic_scaling:
  max_instances: 5
  idle_timeout: 10m
```

**Manual Scaling**:
```yaml
manual_scaling:
  instances: 2
```

### Instance Classes

- `F1` - 256MB RAM (básico, más barato)
- `F2` - 512MB RAM (actual, recomendado)
- `F4` - 1GB RAM
- `F4_1G` - 2GB RAM

## 💰 Optimización de Costos

### 1. Usar Automatic Scaling con min_instances: 0

Esto permite que la app escale a cero cuando no hay tráfico.

### 2. Configurar Timeouts

```yaml
env_variables:
  TIMEOUT: "30s"
```

### 3. Monitorear Uso

```bash
# Ver instancias activas
gcloud app instances list --project=lala4-377416
```

## 🔐 Seguridad

### 1. Restringir Acceso (Opcional)

Si necesitas autenticación, agrega en `app.yaml`:

```yaml
handlers:
- url: /.*
  script: auto
  secure: always
  login: required
```

### 2. IAM y Permisos

El service account debe tener estos roles:
- **BigQuery Data Viewer**
- **BigQuery Job User**

Verificar:
```bash
gcloud projects get-iam-policy lala4-377416 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:*"
```

## 🧪 Testing en Producción

### 1. Probar URL de Producción

```bash
# Obtener URL
URL=$(gcloud app browse --project=lala4-377416 2>&1 | grep -o 'https://[^ ]*')

# Test de conexión
curl "${URL}/api/test-connection"
```

### 2. Verificar Respuesta

Debe retornar:
```json
{
  "success": true,
  "message": "Conexión exitosa a BigQuery",
  "data": {...}
}
```

## 📝 Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] Build local exitoso (`npm run build`)
- [ ] Test local funcional (`npm run dev`)
- [ ] Credenciales de BigQuery válidas
- [ ] `app.yaml` configurado correctamente
- [ ] `.gcloudignore` actualizado
- [ ] Proyecto de Google Cloud correcto

## 📝 Checklist Post-Deploy

- [ ] URL de producción accesible
- [ ] Test de conexión exitoso
- [ ] Logs sin errores críticos
- [ ] APIs funcionando correctamente
- [ ] Monitoreo configurado

## 🆘 Troubleshooting

### Error: "BUILD FAILED"

```bash
# Verificar logs
gcloud app logs read --level=error --project=lala4-377416

# Verificar Node version
node --version  # Debe ser compatible con runtime: nodejs20
```

### Error: "Cannot connect to BigQuery"

1. Verificar variables de entorno en Cloud Console
2. Verificar permisos del service account
3. Revisar logs: `gcloud app logs tail`

### Error: "Out of memory"

Aumentar instance class en `app.yaml`:
```yaml
instance_class: F4  # En lugar de F2
```

## 🔗 URLs Útiles

- **Cloud Console**: https://console.cloud.google.com
- **App Engine Dashboard**: https://console.cloud.google.com/appengine?project=lala4-377416
- **BigQuery Console**: https://console.cloud.google.com/bigquery?project=lala4-377416
- **Logs Viewer**: https://console.cloud.google.com/logs?project=lala4-377416

---

**¡Deployment exitoso! 🎉**

Tu aplicación estará disponible en:
```
https://lala4-377416.appspot.com
```

O en un dominio custom si lo configuraste.
