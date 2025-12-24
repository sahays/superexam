'use server';

import { db, collection } from "@/lib/db/firebase";
import { Document, Question } from "@/lib/types";
import { revalidatePath, unstable_noStore } from "next/cache";
import { Storage } from "@google-cloud/storage";
import { generateQuestionsFromPDF } from "@/lib/services/ai";
import { GoogleAuth } from "google-auth-library";
import { withRateLimit, RateLimitPresets } from "@/lib/utils/server-action-limiter";

// Initialize GCS
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'superexam-uploads';

// Initialize Google Auth
const auth = new GoogleAuth();

// Internal implementation (not exported)
async function uploadDocumentInternal(formData: FormData) {
  unstable_noStore();
  try {
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return { error: 'No file provided' };
    }

    if (!name || !name.trim()) {
      return { error: 'Document name is required' };
    }

    // 1. Save File to GCS
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    try {
      await storage.bucket(bucketName).file(uniqueFilename).save(buffer);
    } catch (gcsError) {
      console.error('GCS Upload Error:', gcsError);
      return { error: 'Failed to upload file to storage.' };
    }

    // 2. Create Document Record
    const docRef = db.collection(collection('documents')).doc();
    const docId = docRef.id;
    const now = Date.now();

    const newDoc: Document = {
      id: docId,
      title: name.trim(), // Use the provided name instead of filename
      status: 'uploaded', // New status: waiting for processing
      questionCount: 0,
      createdAt: now,
      filePath: uniqueFilename
    };

    await docRef.set(newDoc);

    revalidatePath('/documents');
    return { success: true, message: 'Document uploaded successfully', docId };

  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Internal server error during upload.' };
  }
}

// Export with rate limiting (10 requests per minute)
export const uploadDocument = withRateLimit(
  RateLimitPresets.document,
  uploadDocumentInternal
)

// Internal implementation (not exported)
async function processDocumentInternal(docId: string, systemPromptId: string, customPromptId: string) {
  unstable_noStore();
  try {
    // 1. Verify document exists
    const docRef = db.collection(collection('documents')).doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { error: 'Document not found' };
    }

    const docData = docSnap.data() as Document & { filePath?: string };
    if (!docData.filePath) {
      return { error: 'File path missing for this document.' };
    }

    // 2. Verify prompts exist
    const [systemPromptSnap, customPromptSnap] = await Promise.all([
      db.collection(collection('system-prompts')).doc(systemPromptId).get(),
      db.collection(collection('custom-prompts')).doc(customPromptId).get()
    ]);

    if (!systemPromptSnap.exists || !customPromptSnap.exists) {
      return { error: 'One or both prompts not found' };
    }

    // 3. Update status to processing immediately
    await docRef.update({
      status: 'processing',
      currentStep: 'Queuing...',
      progress: 0
    });
    
    // 4. Call Python processing service
    const processingServiceUrl = process.env.PROCESSING_SERVICE_URL || 'http://localhost:8000';
    const requestBody = {
      doc_id: docId,
      system_prompt_id: systemPromptId,
      custom_prompt_id: customPromptId
    };

    let jobId;

    // Use Google Auth for remote services, plain fetch for localhost
    if (processingServiceUrl.includes('localhost')) {
        const response = await fetch(`${processingServiceUrl}/jobs/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Processing service returned ${response.status}`);
        }
        const data = await response.json();
        jobId = data.job_id;
    } else {
        // Authenticated request for Cloud Run
        console.log(`Authenticating with service: ${processingServiceUrl}`);
        const client = await auth.getIdTokenClient(processingServiceUrl);
        const response = await client.request({
            url: `${processingServiceUrl}/jobs/process`,
            method: 'POST',
            data: requestBody
        });
        const data = response.data as any;
        jobId = data.job_id;
    }

    console.log(`Processing job ${jobId} created for document ${docId}`);

    revalidatePath('/documents');
    return { success: true, message: 'Processing started', jobId: jobId };

  } catch (error) {
    console.error('Processing error:', error);

    // Update status to failed
    try {
      await db.collection(collection('documents')).doc(docId).update({
        status: 'failed',
        error: 'Failed to start processing',
        currentStep: undefined,
        progress: undefined
      });
      revalidatePath('/documents');
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    return { error: 'Failed to start processing. Please try again.' };
  }
}

// Export with rate limiting (10 requests per minute)
export const processDocument = withRateLimit(
  RateLimitPresets.document,
  processDocumentInternal
)

export async function getDocumentStatus(docId: string) {
  unstable_noStore();
  try {
    const docRef = db.collection(collection('documents')).doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { error: 'Document not found' };
    }

    const data = docSnap.data() as any;

    // Convert Firestore Timestamp to plain number/date
    const document = {
      ...data,
      id: docSnap.id,
      createdAt: data?.createdAt?.toMillis?.() ?? data?.createdAt ?? Date.now(),
      updatedAt: data?.updatedAt?.toMillis?.() ?? data?.updatedAt ?? Date.now(),
    } as Document;

    return { success: true, document };
  } catch (error) {
    console.error('Get document status error:', error);
    return { error: 'Failed to fetch document status' };
  }
}

// Internal implementation (not exported)
async function deleteDocumentInternal(docId: string) {
  unstable_noStore();
  try {
    // 1. Get document to find file path
    const docRef = db.collection(collection('documents')).doc(docId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const docData = docSnap.data() as Document & { filePath?: string };

      // 2. Delete the file from GCS
      if (docData.filePath) {
        try {
          await storage.bucket(bucketName).file(docData.filePath).delete();
          console.log(`Deleted GCS file: ${docData.filePath}`);
        } catch (gcsError) {
          console.error('Failed to delete GCS file:', gcsError);
          // Continue with document deletion even if file deletion fails
        }
      }

      // 3. Delete questions subcollection
      const questionsSnapshot = await docRef.collection('questions').get();
      const batch = db.batch();
      questionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // 4. Delete the document from Firestore
    await docRef.delete();
    revalidatePath('/documents');
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: 'Failed to delete document' };
  }
}

// Export with rate limiting (10 requests per minute)
export const deleteDocument = withRateLimit(
  RateLimitPresets.document,
  deleteDocumentInternal
)

export async function getDocumentDetails(docId: string) {
  unstable_noStore();
  try {
    const docRef = db.collection(collection('documents')).doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { error: 'Document not found' };
    }

    const data = docSnap.data() as any;
    const document = {
      ...data,
      id: docSnap.id,
      createdAt: data?.createdAt?.toMillis?.() ?? data?.createdAt ?? Date.now(),
      updatedAt: data?.updatedAt?.toMillis?.() ?? data?.updatedAt ?? Date.now(),
    } as Document & { systemPromptId?: string; customPromptId?: string; schema?: string };

    // Fetch prompts if they exist
    let systemPrompt = null;
    let customPrompt = null;

    if (document.systemPromptId) {
      const systemPromptSnap = await db.collection(collection('system-prompts')).doc(document.systemPromptId).get();
      if (systemPromptSnap.exists) {
        const promptData = systemPromptSnap.data() as any;
        systemPrompt = {
          ...promptData,
          id: systemPromptSnap.id,
          createdAt: promptData?.createdAt?.toMillis?.() ?? promptData?.createdAt ?? Date.now(),
          updatedAt: promptData?.updatedAt?.toMillis?.() ?? promptData?.updatedAt ?? Date.now(),
        };
      }
    }

    if (document.customPromptId) {
      const customPromptSnap = await db.collection(collection('custom-prompts')).doc(document.customPromptId).get();
      if (customPromptSnap.exists) {
        const promptData = customPromptSnap.data() as any;
        customPrompt = {
          ...promptData,
          id: customPromptSnap.id,
          createdAt: promptData?.createdAt?.toMillis?.() ?? promptData?.createdAt ?? Date.now(),
          updatedAt: promptData?.updatedAt?.toMillis?.() ?? promptData?.updatedAt ?? Date.now(),
        };
      }
    }

    // Fetch questions
    const questionsSnapshot = await docRef.collection('questions').get();
    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { 
      success: true,
      document,
      systemPrompt,
      customPrompt,
      questions
    };
  } catch (error) {
    console.error('Get document details error:', error);
    return { error: 'Failed to fetch document details' };
  }
}
