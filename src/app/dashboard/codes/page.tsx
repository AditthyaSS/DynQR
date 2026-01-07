import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    QrCode,
    Plus,
    LogOut,
    Search,
    ExternalLink,
    Clock,
    ArrowLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'

async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function CodesListPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all QR codes
    const { data: codes } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400 hidden sm:block">{user.email}</span>
                            <form action={signOut}>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>

                {/* Page Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">All QR Codes</h1>
                        <p className="text-slate-400 mt-1">{codes?.length || 0} total codes</p>
                    </div>
                    <Link href="/dashboard/codes/new">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create QR Code
                        </Button>
                    </Link>
                </div>

                {/* Search (placeholder for now) */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search QR codes..."
                            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* QR Codes List */}
                {!codes || codes.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">No QR codes yet</p>
                                <Link href="/dashboard/codes/new">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First QR Code
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {codes.map((code) => (
                            <Card key={code.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                                <QrCode className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-white text-lg">{code.name}</CardTitle>
                                                <p className="text-xs text-slate-500 font-mono">/{code.short_id}</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={code.is_active ? "default" : "secondary"}
                                            className={code.is_active ? "bg-green-600/20 text-green-400 border-green-600/30 w-fit" : "bg-slate-600/20 text-slate-400 w-fit"}
                                        >
                                            {code.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-400 mb-1">Destination URL</p>
                                            <a
                                                href={code.current_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-400 hover:text-purple-300 truncate block text-sm"
                                            >
                                                {code.current_url}
                                                <ExternalLink className="h-3 w-3 inline ml-1" />
                                            </a>
                                            {code.description && (
                                                <p className="text-sm text-slate-500 mt-2 truncate">{code.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-white">{code.scan_count}</p>
                                                <p className="text-xs text-slate-500">scans</p>
                                            </div>
                                            {code.last_scanned_at && (
                                                <div className="text-right hidden sm:block">
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        Last scan
                                                    </div>
                                                    <p className="text-sm text-slate-400">
                                                        {new Date(code.last_scanned_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                            <Link href={`/dashboard/codes/${code.id}`}>
                                                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
