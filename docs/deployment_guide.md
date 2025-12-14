# SuperExam Cloud Run Deployment Guide

This guide details the commands to build and deploy the SuperExam services to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Project** created.
2.  **Artifact Registry Repository** created (format: `docker`).
3.  **GCS Bucket** created (for PDF storage).
4.  **Firestore** database created.
5.  **gcloud CLI** installed and authenticated.

## 1. Setup Environment Variables

Copy and paste these into your terminal (adjust values as needed). 
**Note:** Ensure you are in the project root directory.

```bash
# Source variables from .env if available
source .env

# Or manually export them:
# Project Configuration
export PROJECT_ID="your-project-id" # e.g., random-poc-479104
export REGION="asia-south1"
export REPO_NAME="superexam-repo"

# Infrastructure Config
export GCS_BUCKET_NAME="superexam-uploads"
export FIRESTORE_COLLECTION_PREFIX="superexam-"

# Secrets
export GEMINI_API_KEY="your-gemini-api-key"

# Image Tags
export IMAGE_TAG="v1"
export API_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/api:$IMAGE_TAG"
export WEBSITE_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/website:$IMAGE_TAG"
```

## 2. Authentication & Setup

Ensure you are authenticated with an account that has **Artifact Registry Administrator** permissions.

```bash
# 1. Login to gcloud (if not already logged in)
gcloud auth login --update-adc

# 2. Set the project
gcloud config set project $PROJECT_ID

# 3. Create Artifact Registry Repository (if it doesn't exist)
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="SuperExam Repository" \
    --project=$PROJECT_ID

# 4. Authenticate Docker (Choose ONE method)

# Method A: Standard (if running docker without sudo)
gcloud auth configure-docker $REGION-docker.pkg.dev

# Method B: Root/Sudo (if running docker with sudo)
gcloud auth print-access-token | sudo docker login -u oauth2accesstoken --password-stdin https://$REGION-docker.pkg.dev
```

## 3. Build and Push Images

We will build two images: one for the Python backend (Processing Service) and one for the Next.js frontend.

**Troubleshooting:**
*   **DNS Issues:** If `pip install` or `npm install` fails with network errors, add `--network=host` to the build command.
*   **Architecture:** If building on ARM (M1/M2/M3 Mac) for Cloud Run (x86), add `--platform linux/amd64`.

### A. Python Service (Processing API)

```bash
# Build (using host network to avoid DNS issues, and amd64 for Cloud Run compatibility)
sudo docker build --platform linux/amd64 --network=host -t $API_IMAGE ./processing-service

# Push
sudo docker push $API_IMAGE
```

### B. Website (Next.js)

**Requirements:**
*   `website/next.config.ts` must include `output: 'standalone'`.
*   `website/Dockerfile` must use Node 20+ (e.g., `FROM node:22-alpine`).

```bash
# Build
sudo docker build --platform linux/amd64 --network=host -t $WEBSITE_IMAGE ./website

# Push
sudo docker push $WEBSITE_IMAGE
```

## 4. Deploy Services

We deploy in this order: Processing Service -> Website (since Website needs API URL).

### A. Deploy Processing Service (Backend)

This service handles the API requests and executes background processing tasks.

```bash
gcloud run deploy superexam-api \
  --image $API_IMAGE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --command "uvicorn" \
  --args "app.main:app,--host,0.0.0.0,--port,8080" \
  --set-env-vars "GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_COLLECTION_PREFIX=$FIRESTORE_COLLECTION_PREFIX"
```

**Note:** Capture the Service URL from the output (e.g., `https://superexam-api-xyz.run.app`).
Export it for the website deployment:

```bash
export PROCESSING_SERVICE_URL="https://superexam-api-xyz.run.app"
```

### B. Deploy Website Service (Frontend)

```bash
gcloud run deploy superexam-website \
  --image $WEBSITE_IMAGE \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars "PROCESSING_SERVICE_URL=$PROCESSING_SERVICE_URL,GCS_BUCKET_NAME=$GCS_BUCKET_NAME,GEMINI_API_KEY=$GEMINI_API_KEY,FIRESTORE_COLLECTION_PREFIX=$FIRESTORE_COLLECTION_PREFIX"
```

## 5. Verification

1.  Visit the **Website URL** provided by the final deployment command.
2.  Upload a document. It should save to your **GCS Bucket**.
3.  Click "Process". The **Website** calls the **Processing Service API**, which triggers the job in the background (using `BackgroundTasks`).
4.  The **Processing Service** executes the job, reads from GCS, calls Gemini, and updates Firestore.
5.  Watch the logs:
    ```bash
    gcloud beta run services logs tail superexam-api --project $PROJECT_ID
    ```
