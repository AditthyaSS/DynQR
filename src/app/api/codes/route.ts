import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateShortId } from '@/lib/utils/generate-short-id'
import { validateUrl, normalizeUrl } from '@/lib/utils/validate-url'

// GET: List all QR codes for authenticated user
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: codes, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ codes })
    } catch (error) {
        console.error('GET /api/codes error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Create new QR code
export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, current_url, description } = body

        // Validate required fields
        if (!name || !current_url) {
            return NextResponse.json(
                { error: 'Name and URL are required' },
                { status: 400 }
            )
        }

        // Normalize and validate URL
        const normalizedUrl = normalizeUrl(current_url)
        if (!validateUrl(normalizedUrl)) {
            return NextResponse.json(
                { error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.' },
                { status: 400 }
            )
        }

        // Generate unique short ID with retry logic
        let shortId = generateShortId()
        let attempts = 0
        const maxAttempts = 5

        while (attempts < maxAttempts) {
            const { data: existing } = await supabase
                .from('qr_codes')
                .select('id')
                .eq('short_id', shortId)
                .single()

            if (!existing) break

            shortId = generateShortId()
            attempts++
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: 'Failed to generate unique short ID. Please try again.' },
                { status: 500 }
            )
        }

        // Create QR code record
        const { data: qrCode, error: insertError } = await supabase
            .from('qr_codes')
            .insert({
                user_id: user.id,
                short_id: shortId,
                name,
                current_url: normalizedUrl,
                description: description || null,
            })
            .select()
            .single()

        if (insertError) {
            console.error('Insert error:', insertError)
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ code: qrCode }, { status: 201 })
    } catch (error) {
        console.error('POST /api/codes error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
