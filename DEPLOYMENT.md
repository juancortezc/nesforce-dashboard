# 🚀 Deployment - Nesforce Dashboard

## Producción Actual

**URL**: https://lala4-377416.rj.r.appspot.com
**Proyecto**: `lala4-377416`
**Región**: `us-central1`

## Deploy Rápido

```bash
npm run build
gcloud app deploy --project=lala4-377416 --quiet
```

## Configuración

### app.yaml
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

### .env.yaml (credenciales)
```yaml
env_variables:
  NODE_ENV: "production"
  GOOGLE_APPLICATION_CREDENTIALS: '{"type":"service_account"...}'
```

## Comandos Útiles

```bash
# Ver logs
gcloud app logs tail -s default

# Ver versiones
gcloud app versions list

# Abrir app
gcloud app browse

# Ver instancias
gcloud app instances list
```

## Monitoreo

- **Dashboard**: https://console.cloud.google.com/appengine?project=lala4-377416
- **Logs**: https://console.cloud.google.com/logs?project=lala4-377416
- **BigQuery**: https://console.cloud.google.com/bigquery?project=lala4-377416

## Rollback

```bash
# Listar versiones
gcloud app versions list

# Promover versión anterior
gcloud app versions migrate VERSION_ID
```

## Troubleshooting

### Error de build
```bash
gcloud app logs read --level=error
```

### Error de conexión BigQuery
- Verificar `.env.yaml` tiene credenciales
- Verificar permisos del service account

### Out of memory
Cambiar en `app.yaml`:
```yaml
instance_class: F4  # En lugar de F2
```
