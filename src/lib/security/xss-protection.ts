/**
 * Simple HTML entity encoder (no external dependencies)
 */
function encodeHtmlEntities(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Strip HTML tags using regex (safe for server-side)
 */
function stripHtmlTags(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses a simple whitelist approach without external dependencies
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty) return '';

    // For now, strip all HTML for maximum security
    return stripHtmlTags(dirty);
}

/**
 * Sanitize text content (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
    if (!dirty) return '';
    return stripHtmlTags(dirty);
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return encodeHtmlEntities(unsafe);
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
