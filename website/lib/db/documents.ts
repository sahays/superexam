import { db } from "@/lib/db/firebase";
import { Document } from "@/lib/types";

export async function getDocuments(): Promise<Document[]> {
  try {
    const snapshot = await db.collection('documents')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as Document);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}
