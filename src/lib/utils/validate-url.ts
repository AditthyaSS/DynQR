/**
 * Validates if a string is a valid HTTP/HTTPS URL
 */
export function validateUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

/**
 * Normalizes a URL by adding https:// if no protocol is provided
 */
export function normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`
    }
    return url
}
