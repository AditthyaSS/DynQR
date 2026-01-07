import QRCode from 'qrcode'

interface QRGeneratorOptions {
    size?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generates a QR code as a base64 data URL
 */
export async function generateQRDataUrl(
    url: string,
    options: QRGeneratorOptions = {}
): Promise<string> {
    const { size = 300, errorCorrectionLevel = 'M' } = options

    const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        errorCorrectionLevel,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })

    return dataUrl
}

/**
 * Generates a QR code as a buffer (for file downloads)
 */
export async function generateQRBuffer(
    url: string,
    options: QRGeneratorOptions = {}
): Promise<Buffer> {
    const { size = 300, errorCorrectionLevel = 'M' } = options

    const buffer = await QRCode.toBuffer(url, {
        width: size,
        margin: 2,
        errorCorrectionLevel,
        type: 'png',
    })

    return buffer
}
