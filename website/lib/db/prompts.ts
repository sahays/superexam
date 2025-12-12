import { db } from "./firebase";
import { SystemPrompt, CustomPrompt } from "@/lib/types";

// System Prompts
export async function getSystemPrompts(): Promise<SystemPrompt[]> {
  try {
    const snapshot = await db.collection('system-prompts').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemPrompt));
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return [];
  }
}

export async function getSystemPrompt(id: string): Promise<SystemPrompt | null> {
  try {
    const doc = await db.collection('system-prompts').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as SystemPrompt;
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    return null;
  }
}

// Custom Prompts
export async function getCustomPrompts(): Promise<CustomPrompt[]> {
  try {
    const snapshot = await db.collection('custom-prompts').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomPrompt));
  } catch (error) {
    console.error('Error fetching custom prompts:', error);
    return [];
  }
}

export async function getCustomPrompt(id: string): Promise<CustomPrompt | null> {
  try {
    const doc = await db.collection('custom-prompts').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as CustomPrompt;
  } catch (error) {
    console.error('Error fetching custom prompt:', error);
    return null;
  }
}
