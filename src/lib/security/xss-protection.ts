import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration DOMPurify pour sanitizer le HTML
 */
const purifyConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, purifyConfig);
}

/**
 * Sanitize text content (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(unsafe: string): string {
    if (!unsafe) return '';

    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
        'about:'
    ];

    for (const protocol of dangerousProtocols) {
        if (trimmed.startsWith(protocol)) {
            return '';
        }
    }

    return url;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T;

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key as keyof T] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            sanitized[key as keyof T] = value.map(item =>
                typeof item === 'string' ? sanitizeText(item) :
                    typeof item === 'object' ? sanitizeObject(item) :
                        item
            ) as T[keyof T];
        } else {
            sanitized[key as keyof T] = value;
        }
    }

    return sanitized;
}

/**
 * Check if content contains potential XSS patterns
 */
export function containsXssPattern(content: string): boolean {
    if (!content) return false;

    const xssPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi, // onclick, onerror, etc.
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\(/gi,
        /expression\(/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(content));
}

/**
 * Sanitize user-generated content for display
 */
export function sanitizeUserContent(content: string, allowHtml: boolean = false): string {
    if (!content) return '';

    // First check for XSS patterns
    if (containsXssPattern(content)) {
        // Strip all HTML if XSS detected
        return sanitizeText(content);
    }

    // Sanitize based on allowHtml flag
    return allowHtml ? sanitizeHtml(content) : sanitizeText(content);
}
