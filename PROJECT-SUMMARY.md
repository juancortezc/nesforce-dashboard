# 📊 Nesforce Dashboard - Resumen del Proyecto

## Estado: ✅ DESPLEGADO EN PRODUCCIÓN

**URL**: https://lala4-377416.rj.r.appspot.com
**Fecha**: Noviembre 13, 2025
**Versión**: 20251113t173955

## Stack Técnico

- Next.js 15 + TypeScript
- BigQuery (Google Cloud)
- Tailwind CSS
- Google App Engine
- Proyecto: `lala4-377416`

## Tablas BigQuery

- `lala4.nesforce_results` - Resultados de Nesforce
- `lala4.nestle_transactions` - Transacciones de Nestle
- Dataset exclusivo (sin `program_id`)

## Arquitectura

```
pages/
├── api/
│   ├── test-connection.ts      # Test de conexión
│   ├── results.ts              # API nesforce_results
│   └── transactions.ts         # API nestle_transactions
├── dashboard.tsx               # Dashboard principal
└── index.tsx                   # Página de inicio

lib/
└── bigquery.ts                 # Cliente y utilidades BigQuery

components/                     # Componentes React (en desarrollo)
```

## APIs Disponibles

| Endpoint | Descripción |
|----------|-------------|
| `/api/test-connection` | Test de conexión a BigQuery |
| `/api/results` | Datos de nesforce_results |
| `/api/transactions` | Datos de nestle_transactions |

## Comandos

```bash
# Desarrollo
npm run dev              # Puerto 3004

# Build
npm run build

# Deploy
gcloud app deploy --project=lala4-377416 --quiet

# Logs
gcloud app logs tail -s default
```

## Configuración

### Variables de Entorno
- `.env` (local) - Credenciales para desarrollo
- `.env.yaml` (producción) - Credenciales para App Engine

### App Engine
- Runtime: Node.js 20
- Instance: F2 (512MB RAM)
- Scaling: Automático (0-10 instancias)
- Región: us-central1

## Características Completadas

✅ Conexión a BigQuery
✅ APIs funcionales
✅ UI de prueba
✅ Deployment en producción
✅ Logging y monitoreo
✅ Documentación completa

## Próximos Pasos

- [ ] Explorar estructura de tablas
- [ ] Diseñar queries personalizadas
- [ ] Implementar componentes de visualización
- [ ] Crear dashboard principal
- [ ] Agregar gráficos (Recharts)
- [ ] Implementar caché (SWR)

## Documentación

- [README.md](README.md) - Documentación general
- [QUICK-START.md](QUICK-START.md) - Inicio rápido
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de deployment

## Diferencias vs Nutriexpertos

| Aspecto | Nutriexpertos | Nesforce |
|---------|---------------|----------|
| Tablas | nestjsSnapItems, nestjsParticipants | nesforce_results, nestle_transactions |
| Program ID | Sí (33) | No |
| Puerto | 3003 | 3004 |
| Cloud SQL | Sí | No |
| Prisma | Sí | No |

## Monitoreo

- **App Engine**: https://console.cloud.google.com/appengine?project=lala4-377416
- **Logs**: https://console.cloud.google.com/logs?project=lala4-377416
- **BigQuery**: https://console.cloud.google.com/bigquery?project=lala4-377416

## Notas Técnicas

- BigQuery location: `southamerica-east1`
- No usar `program_id` en queries (dataset exclusivo)
- Credenciales compartidas con Nutriexpertos
- `.env` no se sube a git (incluido en `.gitignore`)
