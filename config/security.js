/**
 * Security Configuration for Nebula Core
 * Central configuration for firewall, rate limiting, and malware detection
 */

module.exports = {
    // Rate limiting configuration
    rateLimit: {
        // General request rate limiting
        general: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100, // Max 100 requests per window
        },
        // Stricter limits for authentication endpoints
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5, // Max 5 login/signup attempts per window
        },
        // API endpoint limits
        api: {
            windowMs: 1 * 60 * 1000, // 1 minute
            maxRequests: 30, // Max 30 API calls per minute
        },
    },

    // IP filtering configuration
    ipFilter: {
        // Enable/disable IP filtering
        enabled: true,
        // Whitelisted IPs (always allowed)
        whitelist: [
            '127.0.0.1',
            '::1',
            'localhost',
        ],
        // Blacklisted IPs (always blocked)
        blacklist: [],
        // Block private network access (for production)
        blockPrivateNetworks: false,
    },

    // Malware detection patterns
    malwarePatterns: {
        // SQL Injection patterns
        sqlInjection: [
            /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
            /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
            /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
            /((\%27)|(\'))union/i,
            /exec(\s|\+)+(s|x)p\w+/i,
            /UNION(\s+)SELECT/i,
            /INSERT(\s+)INTO/i,
            /DELETE(\s+)FROM/i,
            /DROP(\s+)TABLE/i,
            /UPDATE(\s+)\w+(\s+)SET/i,
            /SELECT(\s+).*(\s+)FROM/i,
        ],
        // XSS (Cross-Site Scripting) patterns
        xss: [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /<link/gi,
            /expression\s*\(/gi,
            /vbscript:/gi,
        ],
        // Path traversal patterns
        pathTraversal: [
            /\.\.\//g,
            /\.\.\\\\?/g,
            /%2e%2e%2f/gi,
            /%2e%2e\//gi,
            /\.%2e\//gi,
            /%2e\.\//gi,
            /\.\.%5c/gi,
            /%252e%252e%255c/gi,
        ],
        // Command injection patterns
        commandInjection: [
            /;\s*ls/i,
            /;\s*cat/i,
            /;\s*rm/i,
            /;\s*wget/i,
            /;\s*curl/i,
            /\|\s*cat/i,
            /`.*`/,
            /\$\(.*\)/,
            /;\s*echo/i,
            /\|\s*sh/i,
            /\|\s*bash/i,
        ],
    },

    // Request size limits
    requestLimits: {
        maxBodySize: 10 * 1024, // 10KB max body size
        maxUrlLength: 2048, // Max URL length
        maxHeaderSize: 8192, // 8KB max header size
    },

    // Suspicious headers to check
    suspiciousHeaders: [
        'x-forwarded-host',
        'x-original-url',
        'x-rewrite-url',
    ],

    // Logging configuration
    logging: {
        enabled: true,
        logBlocked: true,
        logSuspicious: true,
    },
};
