/**
 * Logger Utility for Nebula Core
 * Production-ready logging with levels and formatting
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

// Default to INFO in production, DEBUG in development
const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    green: '\x1b[32m',
};

function formatTimestamp() {
    return new Date().toISOString();
}

function formatMessage(level, emoji, color, message, meta = {}) {
    const timestamp = colors.gray + formatTimestamp() + colors.reset;
    const levelStr = color + `[${level}]` + colors.reset;
    const metaStr = Object.keys(meta).length > 0 ? colors.gray + ' ' + JSON.stringify(meta) + colors.reset : '';

    return `${timestamp} ${emoji} ${levelStr} ${message}${metaStr}`;
}

const logger = {
    error: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.ERROR) {
            console.error(formatMessage('ERROR', '❌', colors.red, message, meta));
        }
    },

    warn: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.WARN) {
            console.warn(formatMessage('WARN', '⚠️', colors.yellow, message, meta));
        }
    },

    info: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.INFO) {
            console.log(formatMessage('INFO', 'ℹ️', colors.blue, message, meta));
        }
    },

    debug: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.DEBUG) {
            console.log(formatMessage('DEBUG', '🔍', colors.cyan, message, meta));
        }
    },

    success: (message, meta = {}) => {
        if (currentLevel >= LOG_LEVELS.INFO) {
            console.log(formatMessage('SUCCESS', '✅', colors.green, message, meta));
        }
    },

    security: (type, message, meta = {}) => {
        const timestamp = formatTimestamp();
        console.log(`${colors.gray}${timestamp}${colors.reset} 🛡️  ${colors.yellow}[SECURITY:${type}]${colors.reset} ${message}`,
            Object.keys(meta).length > 0 ? meta : '');
    },

    // Pretty banner for startup
    banner: (lines) => {
        console.log('\n' + '='.repeat(50));
        lines.forEach(line => console.log(line));
        console.log('='.repeat(50) + '\n');
    },
};

module.exports = logger;
