import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUrl, normalizeUrl } from '@/lib/utils/validate-url'

// GET: Fetch single QR code
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: code, error } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !code) {
            return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
        }

        return NextResponse.json({ code })
    } catch (error) {
        console.error('GET /api/codes/[id] error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Update QR code
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, current_url, description, is_active } = body

        // Build update object
        const updates: Record<string, unknown> = {}

        if (name !== undefined) updates.name = name
        if (description !== undefined) updates.description = description
        if (is_active !== undefined) updates.is_active = is_active

        if (current_url !== undefined) {
            const normalizedUrl = normalizeUrl(current_url)
            if (!validateUrl(normalizedUrl)) {
                return NextResponse.json(
                    { error: 'Invalid URL format' },
                    { status: 400 }
                )
            }
            updates.current_url = normalizedUrl
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            )
        }

        const { data: code, error } = await supabase
            .from('qr_codes')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error || !code) {
            return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
        }

        return NextResponse.json({ code })
    } catch (error) {
        console.error('PATCH /api/codes/[id] error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Delete QR code
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { error } = await supabase
            .from('qr_codes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/codes/[id] error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
