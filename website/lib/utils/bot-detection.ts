/**
 * Bot Detection Utilities
 *
 * Server-side bot detection to protect against automated abuse
 */

import { headers } from 'next/headers';

// Known bot user-agents
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'java', 'go-http-client', 'axios', 'http', 'scrapy', 'httpclient',
  'headless', 'phantom', 'selenium', 'puppeteer', 'playwright',
  'slurp', 'baiduspider', 'yandexbot', 'duckduckbot', 'facebookexternalhit'
];

// Legitimate bots we want to allow (search engines, social media preview)
const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slackbot', 'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'whatsapp', 'discordbot', 'telegrambot'
];

// Suspicious patterns in user agents
const SUSPICIOUS_PATTERNS = [
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /bot\s*$/i,
  /crawler/i,
  /^python/i,
  /^java\//i,
  /curl\//i,
  /wget\//i
];

export interface BotDetectionResult {
  isBot: boolean;
  isSuspicious: boolean;
  reason?: string;
  confidence: 'low' | 'medium' | 'high';
  allowBot?: boolean; // true if it's an allowed bot (like Googlebot)
}

/**
 * Analyze user agent for bot patterns
 */
function analyzeUserAgent(userAgent: string | null): BotDetectionResult {
  if (!userAgent) {
    return {
      isBot: true,
      isSuspicious: true,
      reason: 'Missing user-agent header',
      confidence: 'high'
    };
  }

  const ua = userAgent.toLowerCase();

  // Check for allowed bots first
  for (const allowedBot of ALLOWED_BOTS) {
    if (ua.includes(allowedBot)) {
      return {
        isBot: true,
        isSuspicious: false,
        reason: `Allowed bot: ${allowedBot}`,
        confidence: 'high',
        allowBot: true
      };
    }
  }

  // Check for known bot user agents
  for (const botAgent of BOT_USER_AGENTS) {
    if (ua.includes(botAgent)) {
      return {
        isBot: true,
        isSuspicious: true,
        reason: `Known bot user-agent: ${botAgent}`,
        confidence: 'high'
      };
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isBot: true,
        isSuspicious: true,
        reason: `Suspicious pattern in user-agent: ${pattern.source}`,
        confidence: 'medium'
      };
    }
  }

  // Check for unusually short user agents (likely custom/scripted)
  if (userAgent.length < 20) {
    return {
      isBot: false,
      isSuspicious: true,
      reason: 'Unusually short user-agent',
      confidence: 'low'
    };
  }

  // Legitimate user agent
  return {
    isBot: false,
    isSuspicious: false,
    confidence: 'low'
  };
}

/**
 * Check for missing standard browser headers
 */
function checkMissingHeaders(headersList: Headers): { missing: string[]; suspicious: boolean } {
  const standardHeaders = [
    'accept',
    'accept-language',
    'accept-encoding'
  ];

  const missing: string[] = [];

  for (const header of standardHeaders) {
    if (!headersList.has(header)) {
      missing.push(header);
    }
  }

  // Missing multiple standard headers is suspicious
  return {
    missing,
    suspicious: missing.length >= 2
  };
}

/**
 * Analyze referer header for suspicious patterns
 */
function analyzeReferer(referer: string | null, host: string | null): BotDetectionResult | null {
  // No referer is OK for direct navigation
  if (!referer) {
    return null;
  }

  // Referer should not be from obviously different domain for form submissions
  // But this is too strict for general use, so we just log it
  try {
    const refererUrl = new URL(referer);
    if (host && !referer.includes(host)) {
      return {
        isBot: false,
        isSuspicious: true,
        reason: 'Referer from different domain',
        confidence: 'low'
      };
    }
  } catch {
    // Invalid referer URL
    return {
      isBot: false,
      isSuspicious: true,
      reason: 'Invalid referer URL',
      confidence: 'low'
    };
  }

  return null;
}

/**
 * Main bot detection function
 * Returns comprehensive bot detection result
 */
export async function detectBot(): Promise<BotDetectionResult> {
  const headersList = await headers();

  const userAgent = headersList.get('user-agent');
  const referer = headersList.get('referer');
  const host = headersList.get('host');
  const acceptLanguage = headersList.get('accept-language');

  // Analyze user agent (most important signal)
  const uaResult = analyzeUserAgent(userAgent);

  // If it's an allowed bot, return immediately
  if (uaResult.allowBot) {
    return uaResult;
  }

  // If already identified as bot with high confidence, return
  if (uaResult.isBot && uaResult.confidence === 'high') {
    return uaResult;
  }

  // Check for missing headers
  const { missing, suspicious: headersSuspicious } = checkMissingHeaders(headersList);

  if (headersSuspicious) {
    return {
      isBot: true,
      isSuspicious: true,
      reason: `Missing standard headers: ${missing.join(', ')}`,
      confidence: 'medium'
    };
  }

  // Check for missing accept-language (most browsers send this)
  if (!acceptLanguage) {
    return {
      isBot: false,
      isSuspicious: true,
      reason: 'Missing accept-language header',
      confidence: 'low'
    };
  }

  // Analyze referer if present
  const refererResult = analyzeReferer(referer, host);
  if (refererResult && refererResult.isSuspicious) {
    return refererResult;
  }

  // If user agent analysis found something suspicious, return that
  if (uaResult.isSuspicious) {
    return uaResult;
  }

  // All checks passed
  return {
    isBot: false,
    isSuspicious: false,
    confidence: 'low'
  };
}

/**
 * Simple check - returns true if request should be blocked
 */
export async function shouldBlockRequest(): Promise<{ block: boolean; reason?: string }> {
  const result = await detectBot();

  // Block if it's a bot and not an allowed one
  if (result.isBot && !result.allowBot) {
    return { block: true, reason: result.reason };
  }

  // Block highly suspicious requests
  if (result.isSuspicious && result.confidence === 'high') {
    return { block: true, reason: result.reason };
  }

  return { block: false };
}

/**
 * Get client IP from headers (handles proxies)
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, first one is the client
    return forwarded.split(',')[0].trim();
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to unknown (NextJS will have the actual IP in request context)
  return 'unknown';
}
