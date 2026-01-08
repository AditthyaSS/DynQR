import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QrCode, AlertTriangle, XCircle, Clock, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkQRExpiry, getExpiryMessage } from '@/lib/utils/qr-expiry'
import type { QRCode } from '@/lib/types/database.types'

// This function creates a Supabase client that bypasses RLS for public access
async function createPublicClient() {
    const cookieStore = await cookies()

    // Use fallback values during build time to prevent errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
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

// Not Found Page Component
function NotFoundPage() {
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

// Expired Page Component
function ExpiredPage({
    reason,
    message
}: {
    reason: 'manual' | 'scan_limit' | 'time_expired' | null
    message: string
}) {
    const getIcon = () => {
        switch (reason) {
            case 'scan_limit':
                return <Hash className="h-16 w-16 text-orange-400" />
            case 'time_expired':
                return <Clock className="h-16 w-16 text-orange-400" />
            default:
                return <AlertTriangle className="h-16 w-16 text-yellow-400" />
        }
    }

    const getTitle = () => {
        switch (reason) {
            case 'scan_limit':
                return 'Scan Limit Reached'
            case 'time_expired':
                return 'QR Code Expired'
            case 'manual':
                return 'QR Code Deactivated'
            default:
                return 'QR Code Unavailable'
        }
    }

    const bgGradient = reason === 'manual'
        ? 'from-slate-900 via-yellow-900 to-slate-900'
        : 'from-slate-900 via-orange-900 to-slate-900'

    const iconBg = reason === 'manual' ? 'bg-yellow-600/20' : 'bg-orange-600/20'

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgGradient} p-4`}>
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className={`p-4 ${iconBg} rounded-full`}>
                        {getIcon()}
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">{getTitle()}</h1>
                <p className="text-slate-400 mb-8">{message}</p>
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
        return <NotFoundPage />
    }

    // Cast to typed QRCode
    const typedQrCode = qrCode as QRCode

    // Check expiry status
    const expiryStatus = checkQRExpiry(typedQrCode)

    // Handle expired QR code
    if (expiryStatus.isExpired) {
        // If fallback URL is set and should be used, redirect there
        if (expiryStatus.shouldUseFallback && expiryStatus.fallbackUrl) {
            // Still update analytics even for fallback redirects
            void (async () => {
                try {
                    await supabase
                        .from('qr_codes')
                        .update({
                            scan_count: typedQrCode.scan_count + 1,
                            last_scanned_at: new Date().toISOString(),
                        })
                        .eq('id', typedQrCode.id)
                } catch (err) {
                    console.error('Failed to update scan analytics:', err)
                }
            })()

            redirect(expiryStatus.fallbackUrl)
        }

        // Show expired page
        return (
            <ExpiredPage
                reason={expiryStatus.reason}
                message={getExpiryMessage(expiryStatus.reason)}
            />
        )
    }

    // Update analytics (non-blocking)
    // This runs even on the last valid scan before limit is reached
    void (async () => {
        try {
            await supabase
                .from('qr_codes')
                .update({
                    scan_count: typedQrCode.scan_count + 1,
                    last_scanned_at: new Date().toISOString(),
                })
                .eq('id', typedQrCode.id)
        } catch (err) {
            console.error('Failed to update scan analytics:', err)
        }
    })()

    // Server-side redirect (HTTP 302)
    redirect(typedQrCode.current_url)
}
