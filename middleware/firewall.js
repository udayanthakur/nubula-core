/**
 * Unified Firewall Middleware for Nebula Core
 * Orchestrates all security layers: IP filtering, rate limiting, and malware detection
 */

const { ipFilter, getStats: getIPStats } = require('./ipFilter');
const { rateLimit, getStats: getRateLimitStats } = require('./rateLimit');
const { malwareDetector, getStats: getMalwareStats } = require('./malwareDetector');
const securityConfig = require('../config/security');

// Track overall firewall statistics
const firewallStats = {
    totalRequests: 0,
    blockedRequests: 0,
    startTime: Date.now(),
};

/**
 * Log security event
 */
function logSecurityEvent(type, message, details = {}) {
    if (securityConfig.logging.enabled) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [FIREWALL:${type}] ${message}`, details);
    }
}

/**
 * Main firewall middleware - combines all security layers
 */
function firewall(req, res, next) {
    firewallStats.totalRequests++;

    // Add security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    });

    // Track if request was blocked
    const originalSend = res.send;
    res.send = function (body) {
        if (res.statusCode >= 400) {
            firewallStats.blockedRequests++;
        }
        return originalSend.call(this, body);
    };

    // Layer 1: IP Filtering
    ipFilter(req, res, (err) => {
        if (err || res.headersSent) return;

        // Layer 2: Rate Limiting
        rateLimit(req, res, (err) => {
            if (err || res.headersSent) return;

            // Layer 3: Malware Detection
            malwareDetector(req, res, next);
        });
    });
}

/**
 * Get comprehensive firewall statistics
 */
function getStats() {
    const uptime = Date.now() - firewallStats.startTime;

    return {
        uptime: {
            ms: uptime,
            formatted: formatUptime(uptime),
        },
        requests: {
            total: firewallStats.totalRequests,
            blocked: firewallStats.blockedRequests,
            allowed: firewallStats.totalRequests - firewallStats.blockedRequests,
            blockRate: firewallStats.totalRequests > 0
                ? ((firewallStats.blockedRequests / firewallStats.totalRequests) * 100).toFixed(2) + '%'
                : '0%',
        },
        ipFilter: getIPStats(),
        rateLimit: getRateLimitStats(),
        malwareDetection: getMalwareStats(),
    };
}

/**
 * Format uptime to human readable string
 */
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Initialize firewall and log status
 */
function init() {
    console.log('\n' + '='.repeat(50));
    console.log('🛡️  NEBULA CORE FIREWALL INITIALIZED');
    console.log('='.repeat(50));
    console.log('   ├─ IP Filtering: ' + (securityConfig.ipFilter.enabled ? '✅ Enabled' : '❌ Disabled'));
    console.log('   ├─ Rate Limiting: ✅ Enabled');
    console.log('   │  ├─ General: ' + securityConfig.rateLimit.general.maxRequests + ' req/' + (securityConfig.rateLimit.general.windowMs / 60000) + 'min');
    console.log('   │  ├─ Auth: ' + securityConfig.rateLimit.auth.maxRequests + ' req/' + (securityConfig.rateLimit.auth.windowMs / 60000) + 'min');
    console.log('   │  └─ API: ' + securityConfig.rateLimit.api.maxRequests + ' req/' + (securityConfig.rateLimit.api.windowMs / 60000) + 'min');
    console.log('   ├─ Malware Detection: ✅ Enabled');
    console.log('   │  ├─ SQL Injection: ' + securityConfig.malwarePatterns.sqlInjection.length + ' patterns');
    console.log('   │  ├─ XSS: ' + securityConfig.malwarePatterns.xss.length + ' patterns');
    console.log('   │  ├─ Path Traversal: ' + securityConfig.malwarePatterns.pathTraversal.length + ' patterns');
    console.log('   │  └─ Command Injection: ' + securityConfig.malwarePatterns.commandInjection.length + ' patterns');
    console.log('   └─ Security Headers: ✅ Enabled');
    console.log('='.repeat(50) + '\n');
}

// Initialize on load
init();

module.exports = {
    firewall,
    getStats,
    logSecurityEvent,
};
