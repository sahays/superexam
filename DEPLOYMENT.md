# SuperExam Cloud Run Deployment Guide

This guide covers deploying all three components to Google Cloud Run:
1. **Website** (Next.js frontend)
2. **Processing Service API** (FastAPI)
3. **Worker** (Python background processor)

## Prerequisites

### 1. Install Google Cloud SDK
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and login
gcloud init
gcloud auth login
gcloud auth application-default login
```

### 2. Set Up Project
```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  redis.googleapis.com \
  firestore.googleapis.com
```

### 3. Create Artifact Registry
```bash
# Create Docker repository
gcloud artifacts repositories create superexam \
  --repository-format=docker \
  --location=us-central1 \
  --description="SuperExam Docker images"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## Infrastructure Setup

### 1. Deploy Redis (Cloud Memorystore)
```bash
# Create Redis instance
gcloud redis instances create superexam-redis \
  --size=1 \
  --region=us-central1 \
  --tier=basic \
  --redis-version=redis_7_0

# Get Redis host (save this for later)
gcloud redis instances describe superexam-redis \
  --region=us-central1 \
  --format="get(host)"
```

### 2. Set Up Firestore
```bash
# Create Firestore database (if not exists)
gcloud firestore databases create --location=us-central1

# Set up service account for Firestore access
gcloud iam service-accounts create superexam-service \
  --display-name="SuperExam Service Account"

# Grant Firestore access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:superexam-service@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

### 3. Create Secrets
```bash
# Store Gemini API key
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy=automatic

# Grant access to service account
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:superexam-service@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Component Deployment

### 1. Deploy Processing Service API

```bash
cd processing-service

# Build and push image
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/superexam/processing-api:latest

# Deploy to Cloud Run
gcloud run deploy superexam-processing-api \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/superexam/processing-api:latest \
  --platform managed \
  --region us-central1 \
  --service-account superexam-service@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars REDIS_HOST=<REDIS_IP>,REDIS_PORT=6379,REDIS_KEY_PREFIX=superexam:,FIRESTORE_COLLECTION_PREFIX=superexam- \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --vpc-connector projects/$PROJECT_ID/locations/us-central1/connectors/superexam-connector

# Get service URL
gcloud run services describe superexam-processing-api \
  --region us-central1 \
  --format="get(status.url)"
```

**Note**: Replace `<REDIS_IP>` with the Redis host from step 1.

### 2. Deploy Worker

```bash
cd processing-service

# Build and push worker image
gcloud builds submit \
  --config cloudbuild-worker.yaml \
  --substitutions=_IMAGE_TAG=latest

# Deploy as Cloud Run Job
gcloud run jobs create superexam-worker \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/superexam/worker:latest \
  --region us-central1 \
  --service-account superexam-service@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars REDIS_HOST=<REDIS_IP>,REDIS_PORT=6379,REDIS_KEY_PREFIX=superexam:,FIRESTORE_COLLECTION_PREFIX=superexam-,UPLOADS_DIR=/uploads \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --task-timeout 3600 \
  --max-retries 3 \
  --parallelism 3 \
  --vpc-connector projects/$PROJECT_ID/locations/us-central1/connectors/superexam-connector

# Execute the job (or set up Cloud Scheduler for continuous execution)
gcloud run jobs execute superexam-worker --region us-central1
```

### 3. Deploy Website

```bash
cd website

# Build and push image
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/superexam/website:latest

# Deploy to Cloud Run
gcloud run deploy superexam-website \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/superexam/website:latest \
  --platform managed \
  --region us-central1 \
  --service-account superexam-service@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars PROCESSING_SERVICE_URL=<PROCESSING_API_URL>,FIRESTORE_COLLECTION_PREFIX=superexam-,NEXT_PUBLIC_APP_URL=https://superexam.example.com \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 20 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60

# Get website URL
gcloud run services describe superexam-website \
  --region us-central1 \
  --format="get(status.url)"
```

## VPC Connector Setup (for Redis access)

Cloud Run services need a VPC connector to access Redis:

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create superexam-connector \
  --region us-central1 \
  --subnet-project $PROJECT_ID \
  --subnet default \
  --min-instances 2 \
  --max-instances 10 \
  --machine-type e2-micro
```

## File Storage Setup

For PDF uploads, you have two options:

### Option A: Cloud Storage (Recommended)
```bash
# Create bucket
gsutil mb -l us-central1 gs://$PROJECT_ID-uploads

# Grant access
gsutil iam ch \
  serviceAccount:superexam-service@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin \
  gs://$PROJECT_ID-uploads

# Update both services with:
# UPLOADS_BUCKET=gs://$PROJECT_ID-uploads
```

### Option B: Persistent Disk (Not recommended for Cloud Run)
Cloud Run is stateless, so use Cloud Storage instead.

## Continuous Worker Execution

Workers need to run continuously. Use Cloud Scheduler:

```bash
# Create a Cloud Scheduler job to keep worker running
gcloud scheduler jobs create http superexam-worker-trigger \
  --location us-central1 \
  --schedule "*/5 * * * *" \
  --uri "https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/superexam-worker:run" \
  --http-method POST \
  --oauth-service-account-email superexam-service@$PROJECT_ID.iam.gserviceaccount.com
```

## Environment Variables Reference

### Processing Service API
- `REDIS_HOST` - Redis instance IP
- `REDIS_PORT` - Redis port (6379)
- `REDIS_KEY_PREFIX` - "superexam:"
- `FIRESTORE_COLLECTION_PREFIX` - "superexam-"
- `GEMINI_API_KEY` - Secret
- `GEMINI_MODEL` - "gemini-1.5-flash"
- `UPLOADS_DIR` or `UPLOADS_BUCKET`

### Worker
- Same as API, plus:
- `WORKER_POLL_INTERVAL` - 1 (seconds)
- `MAX_RETRY_ATTEMPTS` - 3

### Website
- `PROCESSING_SERVICE_URL` - URL of processing API
- `FIRESTORE_COLLECTION_PREFIX` - "superexam-"
- `GEMINI_API_KEY` - Secret
- `NEXT_PUBLIC_APP_URL` - Your domain

## Monitoring & Logs

```bash
# View API logs
gcloud run services logs read superexam-processing-api \
  --region us-central1 \
  --limit 50

# View worker logs
gcloud run jobs executions logs read \
  --region us-central1 \
  --job superexam-worker

# View website logs
gcloud run services logs read superexam-website \
  --region us-central1 \
  --limit 50
```

## Scaling Configuration

### Auto-scaling settings:
- **Website**: 1-20 instances (handles traffic spikes)
- **API**: 1-10 instances (handles processing requests)
- **Worker**: 3 parallel tasks (processes jobs concurrently)

### Adjust based on load:
```bash
# Update API scaling
gcloud run services update superexam-processing-api \
  --region us-central1 \
  --min-instances 2 \
  --max-instances 20

# Update worker parallelism
gcloud run jobs update superexam-worker \
  --region us-central1 \
  --parallelism 5
```

## Cost Optimization

1. **Use minimum instances = 0** for development (slower cold starts)
2. **Use Cloud Storage** instead of persistent disks
3. **Set appropriate timeouts** to avoid unnecessary billing
4. **Use Redis Basic tier** for development
5. **Monitor with Cloud Monitoring** to optimize resource allocation

## Deployment Script

Save this as `deploy.sh`:
```bash
#!/bin/bash
set -e

PROJECT_ID="your-project-id"
REGION="us-central1"
REDIS_HOST="<your-redis-ip>"
API_URL=""

echo "Deploying Processing API..."
cd processing-service
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/superexam/processing-api:latest
gcloud run deploy superexam-processing-api \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/superexam/processing-api:latest \
  --region $REGION \
  --set-env-vars REDIS_HOST=$REDIS_HOST \
  --quiet

API_URL=$(gcloud run services describe superexam-processing-api --region $REGION --format="get(status.url)")
echo "API deployed: $API_URL"

echo "Deploying Website..."
cd ../website
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/superexam/website:latest
gcloud run deploy superexam-website \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/superexam/website:latest \
  --region $REGION \
  --set-env-vars PROCESSING_SERVICE_URL=$API_URL \
  --quiet

WEBSITE_URL=$(gcloud run services describe superexam-website --region $REGION --format="get(status.url)")
echo "Website deployed: $WEBSITE_URL"

echo "Deploying Worker..."
cd ../processing-service
gcloud run jobs execute superexam-worker --region $REGION

echo "Deployment complete!"
```

## Troubleshooting

### Redis Connection Issues
- Ensure VPC connector is properly configured
- Check Redis IP and port
- Verify firewall rules allow Cloud Run → Redis

### Firestore Permission Errors
- Verify service account has `roles/datastore.user`
- Check that service account is attached to Cloud Run services

### File Upload Failures
- Ensure Cloud Storage bucket exists
- Verify service account has write permissions
- Check UPLOADS_BUCKET environment variable

### Worker Not Processing
- Check if Cloud Scheduler job is running
- Verify Redis connectivity
- Check worker logs for errors

## Production Checklist

- [ ] Enable Cloud Armor for DDoS protection
- [ ] Set up Cloud CDN for static assets
- [ ] Configure custom domain with SSL
- [ ] Set up Cloud Monitoring alerts
- [ ] Enable Cloud Logging retention
- [ ] Configure backup strategy for Firestore
- [ ] Set up staging environment
- [ ] Configure CI/CD pipeline (Cloud Build triggers)
- [ ] Review IAM permissions (principle of least privilege)
- [ ] Enable VPC Service Controls for security
