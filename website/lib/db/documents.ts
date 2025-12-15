import { db, collection } from "@/lib/db/firebase";
import { Document } from "@/lib/types";
import { unstable_noStore } from "next/cache";

export async function getDocuments(): Promise<Document[]> {
  unstable_noStore(); // Prevent Next.js from caching this data
  try {
    const snapshot = await db.collection(collection('documents'))
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        ...data,
        id: doc.id,
        createdAt: data?.createdAt?.toMillis?.() ?? data?.createdAt ?? Date.now(),
        updatedAt: data?.updatedAt?.toMillis?.() ?? data?.updatedAt ?? Date.now(),
      } as Document;
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}
