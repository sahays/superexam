'use server';

import { db } from "@/lib/db/firebase";
import { extractTextFromPDF } from "@/lib/services/pdf";
import { generateQuestionsFromText } from "@/lib/services/ai";
import { Document, Question } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text
    const text = await extractTextFromPDF(buffer);
    if (!text || text.length < 50) {
      return { error: 'Could not extract enough text from this PDF.' };
    }

    // 3. Create Document Record (Initial Status)
    const docRef = db.collection('documents').doc();
    const docId = docRef.id;
    const now = Date.now();

    const newDoc: Document = {
      id: docId,
      title: file.name,
      status: 'processing',
      questionCount: 0,
      createdAt: now,
    };

    await docRef.set(newDoc);
    
    // 4. Generate Questions (AI)
    // In a real production app, this might be a background job. 
    // For this prototype, we await it to provide immediate feedback.
    let questions: Question[] = [];
    try {
      questions = await generateQuestionsFromText(text, 5); // Generate 5 questions by default
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
    return { success: true, message: 'Document processed successfully', docId };

  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Internal server error during upload.' };
  }
}

export async function deleteDocument(docId: string) {
  try {
    await db.collection('documents').doc(docId).delete();
    // Note: Subcollections in Firestore are not automatically deleted. 
    // For a prototype, this is acceptable. For production, use a recursive delete.
    revalidatePath('/documents');
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: 'Failed to delete document' };
  }
}
