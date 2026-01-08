'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { hasMinimumContrast, SAFE_DEFAULTS } from '@/lib/utils/qr-contrast'

export type QRPattern = 'square' | 'rounded' | 'dots'

export interface QRCustomization {
    foregroundColor: string
    backgroundColor: string
    pattern: QRPattern
}

export const DEFAULT_QR_CUSTOMIZATION: QRCustomization = {
    foregroundColor: SAFE_DEFAULTS.foreground,
    backgroundColor: SAFE_DEFAULTS.background,
    pattern: 'square',
}

interface UseQRCustomizationReturn {
    customization: QRCustomization
    setForegroundColor: (color: string) => void
    setBackgroundColor: (color: string) => void
    setPattern: (pattern: QRPattern) => void
    resetToDefaults: () => void
    hasLowContrast: boolean
    generatePreview: (url: string) => Promise<string | null>
    isGenerating: boolean
}

export function useQRCustomization(): UseQRCustomizationReturn {
    const [customization, setCustomization] = useState<QRCustomization>(DEFAULT_QR_CUSTOMIZATION)
    const [isGenerating, setIsGenerating] = useState(false)
    const qrCodeRef = useRef<unknown>(null)

    const hasLowContrast = !hasMinimumContrast(
        customization.foregroundColor,
        customization.backgroundColor
    )

    const setForegroundColor = useCallback((color: string) => {
        setCustomization((prev) => ({ ...prev, foregroundColor: color }))
    }, [])

    const setBackgroundColor = useCallback((color: string) => {
        setCustomization((prev) => ({ ...prev, backgroundColor: color }))
    }, [])

    const setPattern = useCallback((pattern: QRPattern) => {
        setCustomization((prev) => ({ ...prev, pattern: pattern }))
    }, [])

    const resetToDefaults = useCallback(() => {
        setCustomization(DEFAULT_QR_CUSTOMIZATION)
    }, [])

    // Helper to map pattern to qr-code-styling dot type
    const getDotsType = (pattern: QRPattern): 'square' | 'rounded' | 'dots' => {
        return pattern
    }

    const generatePreview = useCallback(async (url: string): Promise<string | null> => {
        if (!url) return null

        setIsGenerating(true)
        try {
            // Dynamically import qr-code-styling (browser only)
            const QRCodeStyling = (await import('qr-code-styling')).default

            // Use safe defaults if contrast is low
            const safeColors = hasLowContrast
                ? SAFE_DEFAULTS
                : { foreground: customization.foregroundColor, background: customization.backgroundColor }

            const qrCode = new QRCodeStyling({
                width: 200,
                height: 200,
                data: url,
                margin: 8,
                dotsOptions: {
                    color: safeColors.foreground,
                    type: getDotsType(customization.pattern),
                },
                backgroundOptions: {
                    color: safeColors.background,
                },
                cornersSquareOptions: {
                    color: safeColors.foreground,
                    type: customization.pattern === 'dots' ? 'dot' : customization.pattern === 'rounded' ? 'extra-rounded' : 'square',
                },
                cornersDotOptions: {
                    color: safeColors.foreground,
                    type: customization.pattern === 'dots' ? 'dot' : 'square',
                },
            })

            qrCodeRef.current = qrCode

            const rawData = await qrCode.getRawData('png')
            if (!rawData) return null

            // Convert to Blob - handle both Blob and Buffer types
            let blob: Blob
            if (rawData instanceof Blob) {
                blob = rawData
            } else {
                // For Buffer/ArrayBuffer types, convert to Uint8Array first
                const uint8Array = new Uint8Array(rawData as unknown as ArrayBuffer)
                blob = new Blob([uint8Array], { type: 'image/png' })
            }

            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(blob)
            })
        } catch (error) {
            console.error('Failed to generate QR preview:', error)
            // Fallback: return null, caller should use default generation
            return null
        } finally {
            setIsGenerating(false)
        }
    }, [customization, hasLowContrast])

    // Cleanup
    useEffect(() => {
        return () => {
            qrCodeRef.current = null
        }
    }, [])

    return {
        customization,
        setForegroundColor,
        setBackgroundColor,
        setPattern,
        resetToDefaults,
        hasLowContrast,
        generatePreview,
        isGenerating,
    }
}
