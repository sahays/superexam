'use server';

import { db, collection } from "@/lib/db/firebase";
import { SystemPrompt, CustomPrompt } from "@/lib/types";
import { revalidatePath } from "next/cache";

// Get All Prompts (for client components)
export async function getAllPrompts() {
  try {
    const [systemSnapshot, customSnapshot] = await Promise.all([
      db.collection(collection('system-prompts')).orderBy('createdAt', 'desc').get(),
      db.collection(collection('custom-prompts')).orderBy('createdAt', 'desc').get()
    ]);

    const systemPrompts: SystemPrompt[] = systemSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SystemPrompt));

    const customPrompts: CustomPrompt[] = customSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CustomPrompt));

    return { success: true, systemPrompts, customPrompts };
  } catch (error) {
    console.error('Get all prompts error:', error);
    return { error: 'Failed to fetch prompts' };
  }
}

// System Prompts
export async function createSystemPrompt(name: string, content: string) {
  try {
    if (!name || !content) {
      return { error: 'Name and content are required' };
    }

    const docRef = db.collection(collection('system-prompts')).doc();
    const now = Date.now();

    const newPrompt: SystemPrompt = {
      id: docRef.id,
      name,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newPrompt);

    revalidatePath('/prompts');
    return { success: true, data: newPrompt, id: docRef.id };
  } catch (error) {
    console.error('Create system prompt error:', error);
    return { error: 'Failed to create system prompt' };
  }
}

export async function updateSystemPrompt(id: string, data: { name?: string; content?: string }) {
  try {
    if (!id) {
      return { error: 'ID is required' };
    }

    const docRef = db.collection(collection('system-prompts')).doc(id);
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    await docRef.update(updateData);

    revalidatePath('/prompts');
    return { success: true };
  } catch (error) {
    console.error('Update system prompt error:', error);
    return { error: 'Failed to update system prompt' };
  }
}

export async function deleteSystemPrompt(id: string) {
  try {
    if (!id) {
      return { error: 'ID is required' };
    }

    await db.collection(collection('system-prompts')).doc(id).delete();

    revalidatePath('/prompts');
    return { success: true };
  } catch (error) {
    console.error('Delete system prompt error:', error);
    return { error: 'Failed to delete system prompt' };
  }
}

// Custom Prompts
export async function createCustomPrompt(name: string, content: string) {
  try {
    if (!name || !content) {
      return { error: 'Name and content are required' };
    }

    const docRef = db.collection(collection('custom-prompts')).doc();
    const now = Date.now();

    const newPrompt: CustomPrompt = {
      id: docRef.id,
      name,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(newPrompt);

    revalidatePath('/prompts');
    return { success: true, data: newPrompt, id: docRef.id };
  } catch (error) {
    console.error('Create custom prompt error:', error);
    return { error: 'Failed to create custom prompt' };
  }
}

export async function updateCustomPrompt(id: string, data: { name?: string; content?: string }) {
  try {
    if (!id) {
      return { error: 'ID is required' };
    }

    const docRef = db.collection(collection('custom-prompts')).doc(id);
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    await docRef.update(updateData);

    revalidatePath('/prompts');
    return { success: true };
  } catch (error) {
    console.error('Update custom prompt error:', error);
    return { error: 'Failed to update custom prompt' };
  }
}

export async function deleteCustomPrompt(id: string) {
  try {
    if (!id) {
      return { error: 'ID is required' };
    }

    await db.collection(collection('custom-prompts')).doc(id).delete();

    revalidatePath('/prompts');
    return { success: true };
  } catch (error) {
    console.error('Delete custom prompt error:', error);
    return { error: 'Failed to delete custom prompt' };
  }
}
