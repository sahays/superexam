import { db, collection } from "@/lib/db/firebase";
import { SystemPrompt, CustomPrompt } from "@/lib/types";

export async function getSystemPrompts(): Promise<SystemPrompt[]> {
  try {
    const snapshot = await db.collection(collection('system-prompts')).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SystemPrompt));
  } catch (error) {
    console.error("Error fetching system prompts:", error);
    return [];
  }
}

export async function getSystemPrompt(id: string): Promise<SystemPrompt | null> {
  try {
    const doc = await db.collection(collection('system-prompts')).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as SystemPrompt;
    }
    return null;
  } catch (error) {
    console.error("Error fetching system prompt:", error);
    return null;
  }
}

export async function getCustomPrompts(): Promise<CustomPrompt[]> {
  try {
    const snapshot = await db.collection(collection('custom-prompts')).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomPrompt));
  } catch (error) {
    console.error("Error fetching custom prompts:", error);
    return [];
  }
}

export async function getCustomPrompt(id: string): Promise<CustomPrompt | null> {
  try {
    const doc = await db.collection(collection('custom-prompts')).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as CustomPrompt;
    }
    return null;
  } catch (error) {
    console.error("Error fetching custom prompt:", error);
    return null;
  }
}
