'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    QrCode,
    Loader2,
    ArrowLeft,
    LogOut,
    Download,
    Copy,
    Check,
    ExternalLink,
    Trash2,
    Save,
    BarChart3,
    Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { QRCode } from '@/lib/types/database.types'
import Image from 'next/image'
import { QRLifespanPanel, QRLifespanConfig, DEFAULT_LIFESPAN_CONFIG } from '@/components/qr-lifespan-panel'

export default function EditQRCodePage() {
    const params = useParams()
    const id = params.id as string
    const [code, setCode] = useState<QRCode | null>(null)
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [lifespanConfig, setLifespanConfig] = useState<QRLifespanConfig>(DEFAULT_LIFESPAN_CONFIG)

    const router = useRouter()
    const supabase = createClient()

    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin
        }
        return ''
    }

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const response = await fetch(`/api/codes/${id}`)
                const data = await response.json()

                if (!response.ok) {
                    toast.error(data.error || 'QR code not found')
                    router.push('/dashboard/codes')
                    return
                }

                const qrCode = data.code
                setCode(qrCode)
                setName(qrCode.name)
                setUrl(qrCode.current_url)
                setDescription(qrCode.description || '')
                setIsActive(qrCode.is_active)
                setLifespanConfig({
                    maxScans: qrCode.max_scans ?? null,
                    expiresAt: qrCode.expires_at ?? null,
                    fallbackUrl: qrCode.fallback_url ?? null,
                })

                // Generate QR image
                const qrUrl = `${getBaseUrl()}/qr/${qrCode.short_id}`
                const qrResponse = await fetch('/api/generate-qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: qrUrl }),
                })
                const qrData = await qrResponse.json()
                if (qrResponse.ok) {
                    setQrImageUrl(qrData.qr_data_url)
                }
            } catch {
                toast.error('Failed to load QR code')
                router.push('/dashboard/codes')
            } finally {
                setLoading(false)
            }
        }

        fetchCode()
    }, [id, router])

    const handleSave = async () => {
        setSaving(true)

        try {
            const response = await fetch(`/api/codes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    current_url: url,
                    description: description || null,
                    is_active: isActive,
                    max_scans: lifespanConfig.maxScans,
                    expires_at: lifespanConfig.expiresAt,
                    fallback_url: lifespanConfig.fallbackUrl,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to update QR code')
                return
            }

            setCode(data.code)
            toast.success('QR code updated successfully!')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)

        try {
            const response = await fetch(`/api/codes/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete QR code')
                return
            }

            toast.success('QR code deleted successfully!')
            router.push('/dashboard/codes')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    const handleCopyUrl = async () => {
        if (!code) return
        const shortUrl = `${getBaseUrl()}/qr/${code.short_id}`
        await navigator.clipboard.writeText(shortUrl)
        setCopied(true)
        toast.success('URL copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownloadQR = () => {
        if (!qrImageUrl || !code) return
        const link = document.createElement('a')
        link.href = qrImageUrl
        link.download = `${code.name.replace(/\s+/g, '_')}_qr.png`
        link.click()
        toast.success('QR code downloaded!')
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        )
    }

    if (!code) {
        return null
    }

    const shortUrl = `${getBaseUrl()}/qr/${code.short_id}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            {/* Header */}
            <header className="border-b border-slate-800 backdrop-blur-xl bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                <QrCode className="h-6 w-6 text-purple-400" />
                            </div>
                            <span className="text-xl font-bold text-white">dynQR</span>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <Link href="/dashboard/codes" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to All QR Codes
                </Link>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* QR Code Preview */}
                    <Card className="bg-slate-800/50 border-slate-700 lg:w-80 flex-shrink-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-white">QR Code</CardTitle>
                            <CardDescription className="text-slate-400 font-mono text-sm">
                                /{code.short_id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {qrImageUrl && (
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-xl">
                                        <Image
                                            src={qrImageUrl}
                                            alt="QR Code"
                                            width={160}
                                            height={160}
                                            className="w-40 h-40"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-slate-600 hover:bg-slate-700"
                                    onClick={handleCopyUrl}
                                >
                                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                                    Copy
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-slate-600 hover:bg-slate-700"
                                    onClick={handleDownloadQR}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="pt-4 border-t border-slate-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="text-sm">Total Scans</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{code.scan_count}</span>
                                </div>
                                {code.last_scanned_at && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Last Scan</span>
                                        </div>
                                        <span className="text-sm text-white">
                                            {new Date(code.last_scanned_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Short URL */}
                            <div className="pt-4 border-t border-slate-700">
                                <Label className="text-slate-400 text-xs">Short URL</Label>
                                <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 text-sm break-all flex items-center gap-1"
                                >
                                    {shortUrl}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card className="bg-slate-800/50 border-slate-700 flex-1">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl text-white">Edit QR Code</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Update the destination URL or settings
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={isActive ? "default" : "secondary"}
                                    className={isActive ? "bg-green-600/20 text-green-400 border-green-600/30" : "bg-slate-600/20 text-slate-400"}
                                >
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url" className="text-slate-300">Destination URL</Label>
                                <Input
                                    id="url"
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                />
                                <p className="text-xs text-slate-500">
                                    When someone scans this QR code, they&apos;ll be redirected here
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                <div>
                                    <Label className="text-slate-300">Active Status</Label>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {isActive
                                            ? 'QR code is active and redirecting to the destination URL'
                                            : 'QR code is deactivated and will show an error page'
                                        }
                                    </p>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>

                            {/* QR Lifespan Section */}
                            <QRLifespanPanel
                                config={lifespanConfig}
                                onMaxScansChange={(v) => setLifespanConfig(c => ({ ...c, maxScans: v }))}
                                onExpiresAtChange={(v) => setLifespanConfig(c => ({ ...c, expiresAt: v }))}
                                onFallbackUrlChange={(v) => setLifespanConfig(c => ({ ...c, fallbackUrl: v }))}
                                onReset={() => setLifespanConfig(DEFAULT_LIFESPAN_CONFIG)}
                                currentScanCount={code.scan_count}
                            />

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>

                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-red-600/50 text-red-400 hover:bg-red-600/10 hover:text-red-300">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-700">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Delete QR Code</DialogTitle>
                                            <DialogDescription className="text-slate-400">
                                                Are you sure you want to delete &quot;{code.name}&quot;? This action cannot be undone.
                                                Anyone scanning this QR code will see an error.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setDeleteDialogOpen(false)}
                                                className="border-slate-600 hover:bg-slate-800"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {deleting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Info about dynamic QR */}
                            <div className="p-4 bg-purple-600/10 rounded-lg border border-purple-500/20">
                                <p className="text-sm text-purple-300">
                                    <strong>Tip:</strong> This QR code never changes. You can update the destination URL anytime,
                                    and the same printed QR code will redirect to the new URL.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
