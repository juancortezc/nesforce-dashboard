#!/bin/bash
# Script de despliegue de Nesforce a Cloud Run
# Región: us-central1 (USA)

set -e

# Configuración
PROJECT_ID="lala4-377416"
SERVICE_NAME="nesforce-dashboard"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "=========================================="
echo "  Despliegue de Nesforce a Cloud Run"
echo "=========================================="
echo ""
echo "Proyecto: ${PROJECT_ID}"
echo "Servicio: ${SERVICE_NAME}"
echo "Región: ${REGION}"
echo ""

# Verificar que gcloud esté configurado
echo "1. Verificando configuración de gcloud..."
gcloud config set project ${PROJECT_ID}

# Habilitar APIs necesarias
echo ""
echo "2. Habilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build de la imagen
echo ""
echo "3. Construyendo imagen Docker..."
gcloud builds submit --tag ${IMAGE_NAME}:latest .

# Desplegar a Cloud Run
echo ""
echo "4. Desplegando a Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --region ${REGION} \
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

echo ""
echo "=========================================="
echo "  Despliegue completado!"
echo "=========================================="
echo ""

# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo "URL del servicio: ${SERVICE_URL}"
echo ""
echo "Para ver logs:"
echo "  gcloud run logs read --service ${SERVICE_NAME} --region ${REGION}"
