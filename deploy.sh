#!/bin/bash

# Default values
UPGRADE_ONLY=true

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --full) UPGRADE_ONLY=false ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Source environment variables
echo "Loading environment variables from .env..."
set -a
source .env
set +a

# Validate required variables
REQUIRED_VARS=("PROJECT_ID" "REGION" "REPO_NAME" "IMAGE_TAG" "API_IMAGE" "WEBSITE_IMAGE" "PROCESSING_SERVICE_URL")
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "Error: Required variable $VAR is not set in .env"
        exit 1
    fi
done

echo "Starting deployment process..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Tag: $IMAGE_TAG"

echo "Configuring Docker authentication..."
# Method A: Standard (if running docker without sudo)
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Method B: Root/Sudo (if running docker with sudo)
gcloud auth print-access-token | sudo docker login -u oauth2accesstoken --password-stdin https://$REGION-docker.pkg.dev

# Build and Push Python Service
echo "Building Python Service (superexam-api)..."
sudo docker build --platform linux/amd64 --network=host -t $API_IMAGE ./processing-service || { echo "Python Service build failed"; exit 1; }

echo "Pushing Python Service image..."
sudo docker push $API_IMAGE || { echo "Python Service push failed"; exit 1; }

# Build and Push Website
echo "Building Website (superexam-website)..."
sudo docker build --platform linux/amd64 --network=host -t $WEBSITE_IMAGE ./website || { echo "Website build failed"; exit 1; }

echo "Pushing Website image..."
sudo docker push $WEBSITE_IMAGE || { echo "Website push failed"; exit 1; }

# Deploy/Update Cloud Run Services
if [ "$UPGRADE_ONLY" = true ]; then
    echo "Updating existing Cloud Run services (no env var changes)..."
    
    echo "Deploying Python Service..."
    gcloud run deploy superexam-api \
      --image $API_IMAGE \
      --region $REGION \
      --project $PROJECT_ID || { echo "Python Service deployment failed"; exit 1; }

    echo "Deploying Website..."
    gcloud run deploy superexam-website \
      --image $WEBSITE_IMAGE \
      --region $REGION \
      --project $PROJECT_ID || { echo "Website deployment failed"; exit 1; }
else
    echo "Full deployment (updating env vars)..."
    
    echo "Deploying Python Service..."
    gcloud run deploy superexam-api \
      --image $API_IMAGE \
      --platform managed \
      --region $REGION \
      --project $PROJECT_ID \
      --execution-environment=gen2 \
      --timeout=30m \
      --cpu 2 \
      --memory 2Gi \
      --allow-unauthenticated \
      --command "uvicorn" \
      --args "app.main:app,--host,0.0.0.0,--port,8080" \
      --set-env-vars "GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_COLLECTION_PREFIX=$FIRESTORE_COLLECTION_PREFIX,GCP_PROJECT_ID=$PROJECT_ID,GEMINI_MODEL=$GEMINI_MODEL" || { echo "Python Service deployment failed"; exit 1; }

    echo "Deploying Website..."
    gcloud run deploy superexam-website \
      --image $WEBSITE_IMAGE \
      --platform managed \
      --region $REGION \
      --project $PROJECT_ID \
      --execution-environment=gen2 \
      --timeout=30m \
      --allow-unauthenticated \
      --set-env-vars "PROCESSING_SERVICE_URL=$PROCESSING_SERVICE_URL,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_COLLECTION_PREFIX=$FIRESTORE_COLLECTION_PREFIX,GCP_PROJECT_ID=$PROJECT_ID,GEMINI_MODEL=$GEMINI_MODEL" || { echo "Website deployment failed"; exit 1; }
fi

echo "Deployment complete!"
