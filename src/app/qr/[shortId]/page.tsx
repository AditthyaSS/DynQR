import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// This function creates a Supabase client that bypasses RLS for public access
async function createPublicClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll() {
                    // Public route - no need to set cookies
                },
            },
        }
    )
}

export default async function QRRedirect({
    params
}: {
    params: Promise<{ shortId: string }>
}) {
    const { shortId } = await params

    const supabase = await createPublicClient()

    // Query database for the short_id
    const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('short_id', shortId)
        .single()

    // Handle not found
    if (error || !qrCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-600/20 rounded-full">
                            <XCircle className="h-16 w-16 text-red-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">QR Code Not Found</h1>
                    <p className="text-slate-400 mb-8">
                        The QR code you scanned doesn&apos;t exist or has been deleted.
                    </p>
                    <Link href="/">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <QrCode className="mr-2 h-4 w-4" />
                            Create Your Own QR Code
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Handle inactive QR code
    if (!qrCode.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4">
                <div className="text-center max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-yellow-600/20 rounded-full">
                            <AlertTriangle className="h-16 w-16 text-yellow-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">QR Code Deactivated</h1>
                    <p className="text-slate-400 mb-8">
                        This QR code has been temporarily deactivated by its owner.
                    </p>
                    <Link href="/">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <QrCode className="mr-2 h-4 w-4" />
                            Create Your Own QR Code
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Update analytics (non-blocking)
    // Using an IIFE to handle the async update without blocking the redirect
    void (async () => {
        try {
            await supabase
                .from('qr_codes')
                .update({
                    scan_count: qrCode.scan_count + 1,
                    last_scanned_at: new Date().toISOString(),
                })
                .eq('id', qrCode.id)
        } catch (err) {
            console.error('Failed to update scan analytics:', err)
        }
    })()

    // Server-side redirect (HTTP 302)
    redirect(qrCode.current_url)
}
