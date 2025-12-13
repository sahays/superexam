# SuperExam Cloud Run Deployment Guide

This guide details the commands to build and deploy the SuperExam services to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Project** created.
2.  **Artifact Registry Repository** created (format: `docker`).
3.  **GCS Bucket** created (for PDF storage).
4.  **Memorystore (Redis)** instance created (in the same region/VPC).
5.  **gcloud CLI** installed and authenticated.

## 1. Setup Environment Variables

Copy and paste these into your terminal (adjust values as needed):

```bash
# Project Configuration
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export REPO_NAME="superexam-repo"  # Artifact Registry Repo Name

# Infrastructure Config (You must create these first)
export GCS_BUCKET_NAME="superexam-uploads-prod"
export REDIS_HOST="10.0.0.5"       # IP of your Memorystore instance
export REDIS_PORT="6379"

# Secrets
export GEMINI_API_KEY="your-gemini-api-key"

# Image Tags
export IMAGE_TAG="v1"
export API_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/api:$IMAGE_TAG"
export WEBSITE_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/website:$IMAGE_TAG"
```

## 2. Build and Push Images

We will build two images: one for the Python backend (shared by API and Worker) and one for the Next.js frontend.

```bash
# Configure Docker to use gcloud credentials
gcloud auth configure-docker $REGION-docker.pkg.dev

# 1. Build & Push Python Service (API + Worker)
# Run from project root
docker build --platform linux/amd64 -t $API_IMAGE ./processing-service
docker push $API_IMAGE

# 2. Build & Push Website
# Run from project root
docker build --platform linux/amd64 -t $WEBSITE_IMAGE ./website
docker push $WEBSITE_IMAGE
```

## 3. Deploy Services

We deploy in this order: API -> Worker -> Website (since Website needs API URL).

### A. Deploy API Service (Backend)

```bash
gcloud run deploy superexam-api \
  --image $API_IMAGE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --command "uvicorn" \
  --args "app.main:app,--host,0.0.0.0,--port,8080" \
  --set-env-vars "REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY"
```

**Note:** Capture the Service URL from the output (e.g., `https://superexam-api-xyz.run.app`).
Export it for the website deployment:

```bash
export PROCESSING_SERVICE_URL="https://superexam-api-xyz.run.app"
```

### B. Deploy Worker Service (Background Processor)

**Critical:** This service must have CPU always allocated (`--no-cpu-throttling`) because it polls Redis and doesn't receive HTTP requests.

```bash
gcloud run deploy superexam-worker \
  --image $API_IMAGE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --no-allow-unauthenticated \
  --min-instances 1 \
  --max-instances 5 \
  --no-cpu-throttling \
  --command "python" \
  --args "-m,app.worker" \
  --set-env-vars "REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY"
```

### C. Deploy Website Service (Frontend)

```bash
gcloud run deploy superexam-website \
  --image $WEBSITE_IMAGE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "PROCESSING_SERVICE_URL=$PROCESSING_SERVICE_URL,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY"
```

## 4. Verification

1.  Visit the **Website URL** provided by the final deployment command.
2.  Upload a document. It should save to your **GCS Bucket**.
3.  Click "Process". The **Website** calls the **API**, which queues a job in **Redis**.
4.  The **Worker** picks up the job, calls Gemini, and updates Firestore.
5.  Watch the logs:
    ```bash
    gcloud beta run services logs tail superexam-worker --project $PROJECT_ID
    ```
