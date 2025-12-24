import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

/**
 * Global Middleware for SuperExam
 *
 * Provides:
 * 1. Authentication checks (access code verification)
 * 2. Bot detection and blocking
 * 3. Global rate limiting
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/documents',
  '/prompts',
  '/exams',
  '/admin'
];

// Routes that should skip bot protection (for legitimate bots)
const BOT_ALLOWED_ROUTES = [
  '/api/health',
  '/_next',
  '/favicon.ico'
];

/**
 * Simple bot detection based on user-agent
 */
function detectBotFromUserAgent(userAgent: string | null): {
  isBot: boolean;
  isAllowed: boolean;
  reason?: string;
} {
  if (!userAgent) {
    return { isBot: true, isAllowed: false, reason: 'Missing user-agent' };
  }

  const ua = userAgent.toLowerCase();

  // Allowed bots (search engines, social media)
  const allowedBots = [
    'googlebot',
    'bingbot',
    'slackbot',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'whatsapp',
    'discordbot'
  ];

  for (const bot of allowedBots) {
    if (ua.includes(bot)) {
      return { isBot: true, isAllowed: true, reason: `Allowed bot: ${bot}` };
    }
  }

  // Blocked bots and automation tools
  const blockedPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'java',
    'go-http',
    'axios',
    'scrapy',
    'headless',
    'phantom',
    'selenium',
    'puppeteer',
    'playwright'
  ];

  for (const pattern of blockedPatterns) {
    if (ua.includes(pattern)) {
      return { isBot: true, isAllowed: false, reason: `Blocked pattern: ${pattern}` };
    }
  }

  return { isBot: false, isAllowed: true };
}

/**
 * Check if request looks suspicious
 */
function isSuspiciousRequest(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
} {
  const headers = request.headers;

  // Missing common browser headers
  const acceptLanguage = headers.get('accept-language');
  const accept = headers.get('accept');

  if (!acceptLanguage) {
    return { suspicious: true, reason: 'Missing accept-language header' };
  }

  if (!accept) {
    return { suspicious: true, reason: 'Missing accept header' };
  }

  // Suspicious user agent patterns
  const userAgent = headers.get('user-agent') || '';
  if (userAgent.length < 20 && userAgent.length > 0) {
    return { suspicious: true, reason: 'Unusually short user-agent' };
  }

  return { suspicious: false };
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.includes('.') // Skip files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Bot detection (skip for allowed routes)
  const shouldCheckBots = !BOT_ALLOWED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (shouldCheckBots) {
    const userAgent = request.headers.get('user-agent');
    const botCheck = detectBotFromUserAgent(userAgent);

    // Block bots that aren't allowed
    if (botCheck.isBot && !botCheck.isAllowed) {
      console.warn(`[Middleware] Blocked bot: ${botCheck.reason}, Path: ${pathname}`);
      return new NextResponse('Automated requests are not allowed', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Check for suspicious requests
    const suspiciousCheck = isSuspiciousRequest(request);
    if (suspiciousCheck.suspicious) {
      console.warn(
        `[Middleware] Suspicious request: ${suspiciousCheck.reason}, Path: ${pathname}`
      );
      // Log but don't block (to avoid false positives)
      // Could enable blocking in production after monitoring
    }
  }

  // Authentication check for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      // Redirect to access code page
      const url = request.nextUrl.clone();
      url.pathname = '/access-code';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      // Invalid or expired token - redirect to access code page
      const url = request.nextUrl.clone();
      url.pathname = '/access-code';
      url.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(url);

      // Clear invalid token
      response.cookies.delete('access-token');
      return response;
    }

    // Token is valid - add user info to headers for Server Actions
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-code', payload.code);
    requestHeaders.set('x-user-is-admin', payload.isAdmin ? 'true' : 'false');

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return NextResponse.next();
}

/**
 * Configure which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
  ]
};
