import type { QRCode } from '@/lib/types/database.types'

export type ExpiryReason = 'manual' | 'scan_limit' | 'time_expired' | null

export interface QRExpiryStatus {
    isExpired: boolean
    reason: ExpiryReason
    shouldUseFallback: boolean
    fallbackUrl: string | null
}

/**
 * Check if a QR code has expired based on its lifespan settings.
 * Order of checks:
 * 1. Manual disable (is_active = false)
 * 2. Time expiry (expires_at has passed)
 * 3. Scan limit reached (scan_count >= max_scans)
 * 
 * @param qrCode The QR code to check
 * @returns Expiry status with reason and fallback info
 */
export function checkQRExpiry(qrCode: QRCode): QRExpiryStatus {
    // Check 1: Manual disable
    if (!qrCode.is_active) {
        return {
            isExpired: true,
            reason: 'manual',
            shouldUseFallback: false, // Manual disable doesn't use fallback
            fallbackUrl: null,
        }
    }

    // Check 2: Time expiry (handle undefined for backward compatibility with old DBs)
    if (qrCode.expires_at != null) {
        const expiryDate = new Date(qrCode.expires_at)
        const now = new Date()
        if (now > expiryDate) {
            const fallbackUrl = qrCode.fallback_url ?? null
            return {
                isExpired: true,
                reason: 'time_expired',
                shouldUseFallback: !!fallbackUrl,
                fallbackUrl: fallbackUrl,
            }
        }
    }

    // Check 3: Scan limit reached (handle undefined for backward compatibility)
    if (qrCode.max_scans != null && qrCode.scan_count >= qrCode.max_scans) {
        const fallbackUrl = qrCode.fallback_url ?? null
        return {
            isExpired: true,
            reason: 'scan_limit',
            shouldUseFallback: !!fallbackUrl,
            fallbackUrl: fallbackUrl,
        }
    }

    // Not expired
    return {
        isExpired: false,
        reason: null,
        shouldUseFallback: false,
        fallbackUrl: null,
    }
}

/**
 * Get a human-readable message for the expiry reason
 */
export function getExpiryMessage(reason: ExpiryReason): string {
    switch (reason) {
        case 'manual':
            return 'This QR code has been deactivated by its owner.'
        case 'scan_limit':
            return 'This QR code has reached its maximum scan limit.'
        case 'time_expired':
            return 'This QR code has expired.'
        default:
            return 'This QR code is no longer available.'
    }
}

/**
 * Check remaining scans for a QR code
 * Returns null if no limit set
 */
export function getRemainingScans(qrCode: QRCode): number | null {
    if (qrCode.max_scans === null) return null
    return Math.max(0, qrCode.max_scans - qrCode.scan_count)
}

/**
 * Check time until expiry
 * Returns null if no expiry set, or milliseconds until expiry (negative if expired)
 */
export function getTimeUntilExpiry(qrCode: QRCode): number | null {
    if (!qrCode.expires_at) return null
    const expiryDate = new Date(qrCode.expires_at)
    const now = new Date()
    return expiryDate.getTime() - now.getTime()
}
