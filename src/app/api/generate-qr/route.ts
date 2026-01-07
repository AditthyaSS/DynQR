import { NextResponse } from 'next/server'
import { generateQRDataUrl } from '@/lib/utils/qr-generator'

// POST: Generate QR code image
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { url, size } = body

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            )
        }

        const qrDataUrl = await generateQRDataUrl(url, { size: size || 300 })

        return NextResponse.json({ qr_data_url: qrDataUrl })
    } catch (error) {
        console.error('POST /api/generate-qr error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
