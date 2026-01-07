'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
    QrCode,
    Loader2,
    ArrowLeft,
    LogOut,
    Download,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function CreateQRCodePage() {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [createdCode, setCreatedCode] = useState<{
        id: string
        short_id: string
        name: string
        current_url: string
    } | null>(null)
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin
        }
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Create the QR code
            const response = await fetch('/api/codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    current_url: url,
                    description: description || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to create QR code')
                return
            }

            const code = data.code
            setCreatedCode(code)

            // Generate QR image
            const qrUrl = `${getBaseUrl()}/qr/${code.short_id}`
            const qrResponse = await fetch('/api/generate-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: qrUrl }),
            })

            const qrData = await qrResponse.json()
            if (qrResponse.ok) {
                setQrImageUrl(qrData.qr_data_url)
            }

            toast.success('QR code created successfully!')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyUrl = async () => {
        if (!createdCode) return
        const shortUrl = `${getBaseUrl()}/qr/${createdCode.short_id}`
        await navigator.clipboard.writeText(shortUrl)
        setCopied(true)
        toast.success('URL copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownloadQR = () => {
        if (!qrImageUrl || !createdCode) return
        const link = document.createElement('a')
        link.href = qrImageUrl
        link.download = `${createdCode.name.replace(/\s+/g, '_')}_qr.png`
        link.click()
        toast.success('QR code downloaded!')
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    // Success State
    if (createdCode) {
        const shortUrl = `${getBaseUrl()}/qr/${createdCode.short_id}`

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
                <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-green-600/20 rounded-full">
                                    <Check className="h-8 w-8 text-green-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-white">QR Code Created!</CardTitle>
                            <CardDescription className="text-slate-400">
                                Your dynamic QR code &quot;{createdCode.name}&quot; is ready
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* QR Code Image */}
                            {qrImageUrl && (
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-xl">
                                        <Image
                                            src={qrImageUrl}
                                            alt="QR Code"
                                            width={200}
                                            height={200}
                                            className="w-48 h-48"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Short URL */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Short URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={shortUrl}
                                        readOnly
                                        className="bg-slate-700/50 border-slate-600 text-white font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        className="border-slate-600 hover:bg-slate-700"
                                        onClick={handleCopyUrl}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Destination URL */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Redirects to</Label>
                                <a
                                    href={createdCode.current_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
                                >
                                    {createdCode.current_url}
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleDownloadQR}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download QR Code
                                </Button>
                                <Link href={`/dashboard/codes/${createdCode.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
                                        Manage QR Code
                                    </Button>
                                </Link>
                            </div>

                            <div className="text-center pt-4">
                                <Link href="/dashboard/codes/new">
                                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                                        Create Another QR Code
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    // Create Form State
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
            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-2xl text-white">Create New QR Code</CardTitle>
                        <CardDescription className="text-slate-400">
                            Create a dynamic QR code that can be updated anytime
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-300">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Restaurant Menu, Event Page"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                                <p className="text-xs text-slate-500">A friendly name to identify this QR code</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url" className="text-slate-300">Destination URL *</Label>
                                <Input
                                    id="url"
                                    type="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                                <p className="text-xs text-slate-500">Where should this QR code redirect to?</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g., Updated weekly with new specials"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Create QR Code
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            </main>
        </div>
    )
}
