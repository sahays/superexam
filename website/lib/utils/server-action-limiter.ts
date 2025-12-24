/**
 * Server Action Rate Limiting Wrapper
 *
 * Provides rate limiting and bot protection for Next.js Server Actions
 */

import { checkRateLimit } from './rate-limit';
import { detectBot, getClientIp } from './bot-detection';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional key prefix for this action
   */
  keyPrefix?: string;

  /**
   * Whether to check for bots (default: true)
   */
  checkBots?: boolean;

  /**
   * Whether to allow legitimate bots like search engines (default: false)
   */
  allowLegitBots?: boolean;
}

export interface RateLimitResult<T> {
  success?: boolean;
  error?: string;
  data?: T;
}

/**
 * Wrapper function to add rate limiting to Server Actions
 *
 * @param config Rate limit configuration
 * @param action The actual Server Action function to wrap
 * @returns Wrapped function with rate limiting
 *
 * @example
 * ```ts
 * export const myAction = withRateLimit(
 *   { limit: 10, windowSeconds: 60, keyPrefix: 'my-action' },
 *   async (param: string) => {
 *     // Your action logic here
 *     return { success: true, data: 'result' };
 *   }
 * );
 * ```
 */
export function withRateLimit<TArgs extends any[], TReturn>(
  config: RateLimitConfig,
  action: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn | RateLimitResult<never>> {
  return async (...args: TArgs): Promise<TReturn | RateLimitResult<never>> => {
    try {
      // Get client IP
      const clientIp = await getClientIp();

      // Check for bots (if enabled)
      if (config.checkBots !== false) {
        const botResult = await detectBot();

        // Block bots unless they're allowed
        if (botResult.isBot && !botResult.allowBot) {
          console.warn(`[Rate Limit] Bot detected: ${botResult.reason}, IP: ${clientIp}`);
          return {
            success: false,
            error: 'Automated requests are not allowed'
          };
        }

        // Block if allowLegitBots is false and it's a bot
        if (!config.allowLegitBots && botResult.allowBot) {
          console.warn(`[Rate Limit] Legitimate bot blocked: ${botResult.reason}, IP: ${clientIp}`);
          return {
            success: false,
            error: 'Bot access not allowed for this action'
          };
        }

        // Block highly suspicious requests
        if (botResult.isSuspicious && botResult.confidence === 'high') {
          console.warn(`[Rate Limit] Suspicious request: ${botResult.reason}, IP: ${clientIp}`);
          return {
            success: false,
            error: 'Request blocked due to suspicious activity'
          };
        }
      }

      // Check rate limit
      const rateLimitKey = config.keyPrefix
        ? `rate_limit:action:${config.keyPrefix}:${clientIp}`
        : `rate_limit:action:${clientIp}`;

      const rateLimitCheck = await checkRateLimit(
        rateLimitKey,
        config.limit,
        config.windowSeconds
      );

      if (!rateLimitCheck.allowed) {
        const resetIn = rateLimitCheck.resetAt
          ? Math.ceil(rateLimitCheck.resetAt - Date.now() / 1000)
          : config.windowSeconds;

        console.warn(
          `[Rate Limit] Limit exceeded for ${config.keyPrefix || 'action'}, ` +
          `IP: ${clientIp}, Limit: ${config.limit}/${config.windowSeconds}s`
        );

        return {
          success: false,
          error: `Rate limit exceeded. Please try again in ${resetIn} seconds.`
        };
      }

      // Execute the actual action
      return await action(...args);

    } catch (error) {
      console.error('[Rate Limit] Unexpected error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimitPresets = {
  /**
   * For authentication actions (very strict)
   * 5 requests per 15 minutes
   */
  auth: {
    limit: 5,
    windowSeconds: 900, // 15 minutes
    keyPrefix: 'auth',
    checkBots: true,
    allowLegitBots: false
  },

  /**
   * For document upload/processing (strict)
   * 10 requests per minute
   */
  document: {
    limit: 10,
    windowSeconds: 60,
    keyPrefix: 'document',
    checkBots: true,
    allowLegitBots: false
  },

  /**
   * For prompt management (moderate)
   * 20 requests per minute
   */
  prompt: {
    limit: 20,
    windowSeconds: 60,
    keyPrefix: 'prompt',
    checkBots: true,
    allowLegitBots: false
  },

  /**
   * For exam actions (lenient)
   * 30 requests per minute
   */
  exam: {
    limit: 30,
    windowSeconds: 60,
    keyPrefix: 'exam',
    checkBots: true,
    allowLegitBots: false
  },

  /**
   * For read-only actions (very lenient)
   * 60 requests per minute
   */
  readOnly: {
    limit: 60,
    windowSeconds: 60,
    keyPrefix: 'read',
    checkBots: true,
    allowLegitBots: true // Allow search engines to read
  }
} as const;
