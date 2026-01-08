/**
 * QR Contrast Utilities
 * Ensures QR codes maintain sufficient contrast for scannability
 */

/**
 * Calculate relative luminance of a hex color
 * Based on WCAG 2.0 formula
 */
function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        const sRGB = c / 255
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio in range 1-21
 */
export function getContrastRatio(foreground: string, background: string): number {
    const lum1 = getLuminance(foreground)
    const lum2 = getLuminance(background)
    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if two colors have minimum contrast for QR scannability
 * Requires at least 3:1 contrast ratio
 */
export function hasMinimumContrast(foreground: string, background: string): boolean {
    const ratio = getContrastRatio(foreground, background)
    return ratio >= 3
}

/**
 * Default safe colors for QR codes
 */
export const SAFE_DEFAULTS = {
    foreground: '#000000',
    background: '#ffffff',
} as const
