'use server';

import { db } from "@/lib/db/firebase";
import { Document, Question } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { generateQuestionsFromPDF } from "@/lib/services/ai";

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // 1. Save File to Local System
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, uniqueFilename);
    
    // Ensure directory exists (Node 10+ recursive) - actually we did this in shell, but good practice
    // await mkdir(uploadDir, { recursive: true }); 
    
    await writeFile(filePath, buffer);

    // 2. Create Document Record
    const docRef = db.collection('documents').doc();
    const docId = docRef.id;
    const now = Date.now();

    const newDoc: Document = {
      id: docId,
      title: file.name,
      status: 'uploaded', // New status: waiting for processing
      questionCount: 0,
      createdAt: now,
      // @ts-expect-error Adding filePath to doc even if not in shared type yet (or update type later)
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

export async function processDocument(docId: string, schemaContent: string) {
  try {
    // 1. Get Document Metadata
    const docRef = db.collection('documents').doc(docId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return { error: 'Document not found' };
    }

    const docData = docSnap.data() as Document & { filePath?: string };
    if (!docData.filePath) {
        return { error: 'File path missing for this document.' };
    }

    // 2. Read File
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, docData.filePath);
    const fileBuffer = await readFile(filePath);

    // 3. Update Status to Processing
    await docRef.update({ status: 'processing' });
    revalidatePath('/documents');

    // 4. Generate Questions (AI) with Schema
    let questions: Question[] = [];
    try {
      questions = await generateQuestionsFromPDF(fileBuffer, schemaContent);
    } catch (aiError) {
      console.error("AI Generation failed:", aiError);
      await docRef.update({ status: 'failed', error: 'AI generation failed' });
      return { error: 'AI generation failed. Please try again.' };
    }

    // 5. Save Questions and Update Document
    const batch = db.batch();

    // Update main document status
    batch.update(docRef, {
      status: 'ready',
      questionCount: questions.length
    });

    // Add questions to subcollection
    const questionsCollection = docRef.collection('questions');
    questions.forEach((q) => {
      const qRef = questionsCollection.doc(q.id);
      batch.set(qRef, q);
    });

    await batch.commit();

    revalidatePath('/documents');
    return { success: true, message: 'Document processed successfully' };

  } catch (error) {
    console.error('Processing error:', error);
    // Attempt to revert status if possible, or just leave as processing/failed
    return { error: 'Internal server error during processing.' };
  }
}

export async function deleteDocument(docId: string) {
  try {
    // Optional: Delete local file if we want to be clean
    await db.collection('documents').doc(docId).delete();
    revalidatePath('/documents');
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: 'Failed to delete document' };
  }
}
