/**
 * Rate Limiting Middleware for DDoS Protection
 * Tracks request counts per IP and blocks excessive requests
 */

const securityConfig = require('../config/security');

// In-memory storage for rate limiting
const requestCounts = new Map();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Get client IP address from request
 */
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown'
    );
}

/**
 * Get the appropriate rate limit config based on the path
 */
function getRateLimitConfig(path) {
    if (path.startsWith('/api/auth')) {
        return securityConfig.rateLimit.auth;
    }
    if (path.startsWith('/api')) {
        return securityConfig.rateLimit.api;
    }
    return securityConfig.rateLimit.general;
}

/**
 * Clean up expired entries from the rate limit map
 */
function cleanupExpired() {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now > data.windowEnd) {
            requestCounts.delete(key);
        }
    }
}

// Run cleanup periodically
setInterval(cleanupExpired, CLEANUP_INTERVAL);

/**
 * Rate limiting middleware
 */
function rateLimit(req, res, next) {
    const clientIP = getClientIP(req);
    const path = req.path;
    const config = getRateLimitConfig(path);

    const now = Date.now();
    const key = `${clientIP}:${path.startsWith('/api/auth') ? 'auth' : path.startsWith('/api') ? 'api' : 'general'}`;

    let record = requestCounts.get(key);

    if (!record || now > record.windowEnd) {
        // Create new window
        record = {
            count: 1,
            windowStart: now,
            windowEnd: now + config.windowMs,
        };
        requestCounts.set(key, record);
    } else {
        // Increment counter
        record.count++;
    }

    // Check if limit exceeded
    if (record.count > config.maxRequests) {
        const retryAfter = Math.ceil((record.windowEnd - now) / 1000);

        if (securityConfig.logging.logBlocked) {
            console.log(`🛡️  [RATE LIMIT] Blocked ${clientIP} - ${record.count}/${config.maxRequests} requests on ${path}`);
        }

        res.set('Retry-After', retryAfter);
        res.set('X-RateLimit-Limit', config.maxRequests);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', Math.ceil(record.windowEnd / 1000));

        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: retryAfter,
        });
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', config.maxRequests);
    res.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - record.count));
    res.set('X-RateLimit-Reset', Math.ceil(record.windowEnd / 1000));

    next();
}

/**
 * Get current rate limit statistics
 */
function getStats() {
    const stats = {
        totalTracked: requestCounts.size,
        entries: [],
    };

    for (const [key, data] of requestCounts.entries()) {
        stats.entries.push({
            key,
            count: data.count,
            windowEnd: new Date(data.windowEnd).toISOString(),
        });
    }

    return stats;
}

/**
 * Manually block an IP for a duration
 */
function blockIP(ip, durationMs = 60 * 60 * 1000) {
    const key = `${ip}:blocked`;
    requestCounts.set(key, {
        count: Infinity,
        windowStart: Date.now(),
        windowEnd: Date.now() + durationMs,
    });
}

module.exports = {
    rateLimit,
    getStats,
    blockIP,
    getClientIP,
};
