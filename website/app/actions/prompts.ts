'use server';

import { db, collection } from "@/lib/db/firebase";
import { SystemPrompt, CustomPrompt } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { withRateLimit, RateLimitPresets } from "@/lib/utils/server-action-limiter";

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

// System Prompts - Internal implementation
async function createSystemPromptInternal(name: string, content: string) {
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

// Export with rate limiting
export const createSystemPrompt = withRateLimit(
  RateLimitPresets.prompt,
  createSystemPromptInternal
)

// Internal implementation
async function updateSystemPromptInternal(id: string, data: { name?: string; content?: string }) {
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

// Export with rate limiting
export const updateSystemPrompt = withRateLimit(
  RateLimitPresets.prompt,
  updateSystemPromptInternal
)

// Internal implementation
async function deleteSystemPromptInternal(id: string) {
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

// Export with rate limiting
export const deleteSystemPrompt = withRateLimit(
  RateLimitPresets.prompt,
  deleteSystemPromptInternal
)

// Custom Prompts - Internal implementation
async function createCustomPromptInternal(name: string, content: string) {
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

// Export with rate limiting
export const createCustomPrompt = withRateLimit(
  RateLimitPresets.prompt,
  createCustomPromptInternal
)

// Internal implementation
async function updateCustomPromptInternal(id: string, data: { name?: string; content?: string }) {
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

// Export with rate limiting
export const updateCustomPrompt = withRateLimit(
  RateLimitPresets.prompt,
  updateCustomPromptInternal
)

// Internal implementation
async function deleteCustomPromptInternal(id: string) {
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

// Export with rate limiting
export const deleteCustomPrompt = withRateLimit(
  RateLimitPresets.prompt,
  deleteCustomPromptInternal
)
