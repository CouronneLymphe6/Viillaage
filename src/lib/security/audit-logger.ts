import { prisma } from '@/lib/prisma';

/**
 * Audit logging for security events
 */

export enum AuditEventType {
    // Authentication events
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    LOGOUT = 'LOGOUT',
    REGISTER = 'REGISTER',

    // Authorization events
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
    ADMIN_ACCESS = 'ADMIN_ACCESS',

    // Content events
    ALERT_CREATED = 'ALERT_CREATED',
    ALERT_DELETED = 'ALERT_DELETED',
    MESSAGE_CREATED = 'MESSAGE_CREATED',
    EVENT_CREATED = 'EVENT_CREATED',
    LISTING_CREATED = 'LISTING_CREATED',

    // Security events
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    CSRF_VIOLATION = 'CSRF_VIOLATION',
    XSS_ATTEMPT = 'XSS_ATTEMPT',
    INVALID_INPUT = 'INVALID_INPUT',

    // File events
    FILE_UPLOAD = 'FILE_UPLOAD',
    FILE_UPLOAD_REJECTED = 'FILE_UPLOAD_REJECTED',

    // Profile events
    PROFILE_UPDATED = 'PROFILE_UPDATED',
    PASSWORD_CHANGED = 'PASSWORD_CHANGED',
}

export interface AuditLogEntry {
    eventType: AuditEventType;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    metadata?: Record<string, any>;
    errorMessage?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    const timestamp = new Date().toISOString();

    const logData = {
        timestamp,
        eventType: entry.eventType,
        userId: entry.userId || 'anonymous',
        ipAddress: entry.ipAddress || 'unknown',
        userAgent: entry.userAgent || 'unknown',
        success: entry.success,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        errorMessage: entry.errorMessage || null,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[AUDIT]', logData);
    }

    // In production, you would send this to a logging service
    // Examples: Winston, Pino, CloudWatch, Datadog, etc.

    // For now, we'll just log to console
    // TODO: Implement proper logging service integration
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
    eventType: AuditEventType,
    email: string,
    success: boolean,
    ipAddress?: string,
    errorMessage?: string
): Promise<void> {
    await logAuditEvent({
        eventType,
        userId: email,
        ipAddress,
        success,
        errorMessage,
        metadata: { email }
    });
}

/**
 * Log security violation
 */
export async function logSecurityViolation(
    eventType: AuditEventType,
    userId: string | undefined,
    ipAddress: string,
    details: Record<string, any>
): Promise<void> {
    await logAuditEvent({
        eventType,
        userId,
        ipAddress,
        success: false,
        metadata: details
    });
}

/**
 * Log content creation
 */
export async function logContentCreation(
    eventType: AuditEventType,
    userId: string,
    contentId: string,
    ipAddress?: string
): Promise<void> {
    await logAuditEvent({
        eventType,
        userId,
        ipAddress,
        success: true,
        metadata: { contentId }
    });
}

/**
 * Log file upload
 */
export async function logFileUpload(
    userId: string,
    filename: string,
    fileSize: number,
    mimeType: string,
    success: boolean,
    ipAddress?: string,
    errorMessage?: string
): Promise<void> {
    await logAuditEvent({
        eventType: success ? AuditEventType.FILE_UPLOAD : AuditEventType.FILE_UPLOAD_REJECTED,
        userId,
        ipAddress,
        success,
        errorMessage,
        metadata: {
            filename,
            fileSize,
            mimeType
        }
    });
}

/**
 * Extract IP address from request headers
 */
export function getIpAddress(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(headers: Headers): string {
    return headers.get('user-agent') || 'unknown';
}
