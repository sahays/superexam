import { db, collection } from "@/lib/db/firebase";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Check if a request is allowed under rate limit using Firestore.
 *
 * @param key - Unique key for the rate limit (e.g., "rate_limit:explain:minute:192.168.1.1")
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Object with allowed status and optional reset time
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; resetAt?: number }> {
  const docRef = db.collection(collection('rate_limits')).doc(key);

  try {
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      const now = Date.now() / 1000; // Convert to seconds

      if (!snapshot.exists) {
        // First request - create new limit document
        transaction.set(docRef, {
          count: 1,
          resetAt: now + windowSeconds,
        });
        return { allowed: true, resetAt: now + windowSeconds };
      }

      const data = snapshot.data();
      if (!data) {
        return { allowed: false };
      }

      const resetAt = data.resetAt || 0;

      if (now > resetAt) {
        // Window expired - reset
        transaction.set(docRef, {
          count: 1,
          resetAt: now + windowSeconds,
        });
        return { allowed: true, resetAt: now + windowSeconds };
      }

      const currentCount = data.count || 0;

      if (currentCount >= limit) {
        // Limit exceeded
        return { allowed: false, resetAt };
      }

      // Increment count
      transaction.update(docRef, {
        count: FieldValue.increment(1),
      });

      return { allowed: true, resetAt };
    });
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true };
  }
}
