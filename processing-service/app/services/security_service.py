import logging
import time
from typing import Optional
from redis import Redis

logger = logging.getLogger(__name__)


class SecurityService:
    """Security service for bot detection and IP blocking"""

    def __init__(self, redis_client: Redis, key_prefix: str = "superexam"):
        self.redis = redis_client
        self.key_prefix = key_prefix

        # Bot user agents (common scrapers and bots)
        self.blocked_user_agents = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python-requests', 'scrapy', 'headless', 'phantomjs',
            'selenium', 'webdriver'
        ]

        # Allowed user agents (legitimate clients)
        self.allowed_user_agents = [
            'mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera',
            'postman', 'insomnia'  # API testing tools
        ]

    def is_bot(self, user_agent: Optional[str]) -> bool:
        """
        Detect if request is from a bot based on User-Agent

        Returns True if bot detected, False if legitimate
        """
        if not user_agent:
            logger.warning("Request with missing User-Agent header")
            return True  # No user agent = suspicious

        user_agent_lower = user_agent.lower()

        # Check against blocked patterns
        for blocked in self.blocked_user_agents:
            if blocked in user_agent_lower:
                logger.warning(f"Blocked bot detected: {user_agent}")
                return True

        # Check if it matches any allowed pattern
        for allowed in self.allowed_user_agents:
            if allowed in user_agent_lower:
                return False

        # Unknown user agent - treat as suspicious
        logger.warning(f"Unknown User-Agent: {user_agent}")
        return True

    def is_ip_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked"""
        key = f"{self.key_prefix}:blocked_ip:{ip}"
        return self.redis.exists(key) > 0

    def block_ip(self, ip: str, duration_seconds: int = 3600, reason: str = "Rate limit exceeded"):
        """
        Block an IP address temporarily

        Args:
            ip: IP address to block
            duration_seconds: How long to block (default 1 hour)
            reason: Reason for blocking
        """
        key = f"{self.key_prefix}:blocked_ip:{ip}"
        self.redis.setex(
            key,
            duration_seconds,
            f"{reason}|{int(time.time())}"
        )
        logger.warning(f"Blocked IP {ip} for {duration_seconds}s: {reason}")

    def unblock_ip(self, ip: str):
        """Manually unblock an IP address"""
        key = f"{self.key_prefix}:blocked_ip:{ip}"
        self.redis.delete(key)
        logger.info(f"Unblocked IP {ip}")

    def get_block_info(self, ip: str) -> Optional[dict]:
        """Get information about a blocked IP"""
        key = f"{self.key_prefix}:blocked_ip:{ip}"
        data = self.redis.get(key)

        if not data:
            return None

        reason, blocked_at = data.decode().split('|', 1)
        ttl = self.redis.ttl(key)

        return {
            "ip": ip,
            "reason": reason,
            "blocked_at": int(blocked_at),
            "expires_in": ttl
        }

    def track_request(self, ip: str, endpoint: str):
        """
        Track request patterns for bot detection

        Increments request counter and checks for suspicious patterns
        """
        key = f"{self.key_prefix}:request_count:{ip}:{endpoint}"
        count = self.redis.incr(key)

        # Set expiration on first request
        if count == 1:
            self.redis.expire(key, 60)  # Reset counter every minute

        # Check for suspicious patterns (e.g., > 100 requests per minute)
        if count > 100:
            logger.warning(f"Suspicious activity from {ip}: {count} requests to {endpoint}")
            self.block_ip(ip, 3600, "Suspicious request pattern")
            return True

        return False

    def validate_request_headers(self, headers: dict) -> tuple[bool, str]:
        """
        Validate request headers for bot detection

        Returns (is_valid, error_message)
        """
        # Check for User-Agent
        user_agent = headers.get('user-agent')
        if not user_agent:
            return False, "Missing User-Agent header"

        # Check if it's a bot
        if self.is_bot(user_agent):
            return False, "Bot detected - User-Agent blocked"

        # Check for basic browser headers (legitimate requests usually have these)
        # Note: API clients like Postman might not have all of these, so we're lenient
        has_accept = headers.get('accept')
        if not has_accept:
            logger.warning("Request missing Accept header")

        return True, ""

    def check_rate_limit_violations(self, ip: str) -> int:
        """
        Check how many times an IP has hit rate limits

        Returns count of violations
        """
        key = f"{self.key_prefix}:rate_limit_violations:{ip}"
        count = self.redis.get(key)
        return int(count) if count else 0

    def record_rate_limit_violation(self, ip: str):
        """
        Record a rate limit violation

        After 5 violations, block the IP
        """
        key = f"{self.key_prefix}:rate_limit_violations:{ip}"
        count = self.redis.incr(key)

        # Set expiration (reset violations counter after 1 hour)
        if count == 1:
            self.redis.expire(key, 3600)

        logger.warning(f"Rate limit violation #{count} from IP {ip}")

        # Block IP after 5 violations
        if count >= 5:
            self.block_ip(ip, 3600, "Repeated rate limit violations")
            logger.error(f"IP {ip} blocked due to {count} rate limit violations")


# Create singleton instance (will be initialized with Redis from redis_service)
security_service: Optional[SecurityService] = None


def init_security_service(redis_client: Redis, key_prefix: str = "superexam"):
    """Initialize the security service with Redis client"""
    global security_service
    security_service = SecurityService(redis_client, key_prefix)
    logger.info("Security service initialized")
