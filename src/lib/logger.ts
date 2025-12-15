/**
 * Environment-aware logger utility
 * Logs only in development, silent in production
 * Prevents sensitive data exposure in production logs
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
    private log(level: LogLevel, ...args: any[]) {
        if (isDevelopment) {
            console[level](...args);
        }
        // In production, only log errors to console (for monitoring services)
        else if (level === 'error') {
            console.error(...args);
        }
    }

    /**
     * Debug logging - only in development
     */
    debug(...args: any[]) {
        this.log('debug', '[DEBUG]', ...args);
    }

    /**
     * Info logging - only in development
     */
    info(...args: any[]) {
        this.log('info', '[INFO]', ...args);
    }

    /**
     * Warning logging - only in development
     */
    warn(...args: any[]) {
        this.log('warn', '[WARN]', ...args);
    }

    /**
     * Error logging - always logged (for monitoring)
     */
    error(...args: any[]) {
        this.log('error', '[ERROR]', ...args);
    }

    /**
     * General logging - only in development
     */
    general(...args: any[]) {
        this.log('log', ...args);
    }
}

export const logger = new Logger();

// Convenience exports
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
