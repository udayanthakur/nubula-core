/**
 * IP Filtering Middleware
 * Manages blacklists, whitelists, and real-time IP banning
 */

const securityConfig = require('../config/security');
const { getClientIP } = require('./rateLimit');

// Dynamic blacklist (runtime additions)
const dynamicBlacklist = new Set();

// Temporary bans with expiration
const temporaryBans = new Map();

/**
 * Check if IP is in private network range
 */
function isPrivateIP(ip) {
    // IPv4 private ranges
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^127\./,
        /^0\./,
        /^169\.254\./,
    ];

    return privateRanges.some(range => range.test(ip));
}

/**
 * Check if IP is whitelisted
 */
function isWhitelisted(ip) {
    return securityConfig.ipFilter.whitelist.includes(ip);
}

/**
 * Check if IP is blacklisted (static or dynamic)
 */
function isBlacklisted(ip) {
    // Check static blacklist
    if (securityConfig.ipFilter.blacklist.includes(ip)) {
        return true;
    }

    // Check dynamic blacklist
    if (dynamicBlacklist.has(ip)) {
        return true;
    }

    // Check temporary bans
    const ban = temporaryBans.get(ip);
    if (ban) {
        if (Date.now() < ban.expiresAt) {
            return true;
        } else {
            // Ban expired, remove it
            temporaryBans.delete(ip);
        }
    }

    return false;
}

/**
 * IP filtering middleware
 */
function ipFilter(req, res, next) {
    if (!securityConfig.ipFilter.enabled) {
        return next();
    }

    const clientIP = getClientIP(req);

    // Always allow whitelisted IPs
    if (isWhitelisted(clientIP)) {
        return next();
    }

    // Block blacklisted IPs
    if (isBlacklisted(clientIP)) {
        if (securityConfig.logging.logBlocked) {
            console.log(`🛡️  [IP FILTER] Blocked blacklisted IP: ${clientIP}`);
        }

        return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied.',
        });
    }

    // Optionally block private networks (for production)
    if (securityConfig.ipFilter.blockPrivateNetworks && isPrivateIP(clientIP)) {
        if (securityConfig.logging.logBlocked) {
            console.log(`🛡️  [IP FILTER] Blocked private network IP: ${clientIP}`);
        }

        return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied.',
        });
    }

    next();
}

/**
 * Add IP to dynamic blacklist
 */
function addToBlacklist(ip) {
    dynamicBlacklist.add(ip);
    console.log(`🛡️  [IP FILTER] Added ${ip} to blacklist`);
}

/**
 * Remove IP from dynamic blacklist
 */
function removeFromBlacklist(ip) {
    dynamicBlacklist.delete(ip);
    console.log(`🛡️  [IP FILTER] Removed ${ip} from blacklist`);
}

/**
 * Temporarily ban an IP
 */
function temporaryBan(ip, durationMs = 60 * 60 * 1000, reason = 'Suspicious activity') {
    temporaryBans.set(ip, {
        bannedAt: Date.now(),
        expiresAt: Date.now() + durationMs,
        reason,
    });
    console.log(`🛡️  [IP FILTER] Temporarily banned ${ip} for ${durationMs / 1000}s - ${reason}`);
}

/**
 * Get current filter statistics
 */
function getStats() {
    return {
        whitelistCount: securityConfig.ipFilter.whitelist.length,
        staticBlacklistCount: securityConfig.ipFilter.blacklist.length,
        dynamicBlacklistCount: dynamicBlacklist.size,
        temporaryBansCount: temporaryBans.size,
        temporaryBans: Array.from(temporaryBans.entries()).map(([ip, data]) => ({
            ip,
            ...data,
            expiresIn: Math.max(0, data.expiresAt - Date.now()),
        })),
    };
}

/**
 * Clear all temporary bans
 */
function clearTemporaryBans() {
    const count = temporaryBans.size;
    temporaryBans.clear();
    console.log(`🛡️  [IP FILTER] Cleared ${count} temporary bans`);
}

module.exports = {
    ipFilter,
    addToBlacklist,
    removeFromBlacklist,
    temporaryBan,
    getStats,
    clearTemporaryBans,
    isWhitelisted,
    isBlacklisted,
};
