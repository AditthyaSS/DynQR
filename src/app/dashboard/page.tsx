import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    QrCode,
    Plus,
    BarChart3,
    LogOut,
    ExternalLink,
    Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch QR codes
    const { data: codes } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const totalCodes = codes?.length || 0
    const totalScans = codes?.reduce((acc, code) => acc + code.scan_count, 0) || 0
    const activeCodes = codes?.filter(code => code.is_active).length || 0
    const recentCodes = codes?.slice(0, 5) || []

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
                {/* Page Title */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Manage your dynamic QR codes</p>
                    </div>
                    <Link href="/dashboard/codes/new">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create QR Code
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-slate-400">Total QR Codes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-600/20 rounded-lg">
                                    <QrCode className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white">{totalCodes}</p>
                                    <p className="text-sm text-slate-400">{activeCodes} active</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-slate-400">Total Scans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-600/20 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white">{totalScans}</p>
                                    <p className="text-sm text-slate-400">all time</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-slate-400">Quick Actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Link href="/dashboard/codes/new" className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-slate-600 hover:bg-slate-700">
                                        <Plus className="h-4 w-4 mr-1" />
                                        New
                                    </Button>
                                </Link>
                                <Link href="/dashboard/codes" className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-slate-600 hover:bg-slate-700">
                                        <QrCode className="h-4 w-4 mr-1" />
                                        All
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent QR Codes */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-white">Recent QR Codes</CardTitle>
                            <Link href="/dashboard/codes">
                                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                                    View All
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentCodes.length === 0 ? (
                            <div className="text-center py-12">
                                <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 mb-4">No QR codes yet</p>
                                <Link href="/dashboard/codes/new">
                                    <Button className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First QR Code
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentCodes.map((code) => (
                                    <Link
                                        key={code.id}
                                        href={`/dashboard/codes/${code.id}`}
                                        className="block p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-white truncate">{code.name}</h3>
                                                    <Badge
                                                        variant={code.is_active ? "default" : "secondary"}
                                                        className={code.is_active ? "bg-green-600/20 text-green-400 border-green-600/30" : "bg-slate-600/20 text-slate-400"}
                                                    >
                                                        {code.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-400 truncate">{code.current_url}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-lg font-semibold text-white">{code.scan_count}</p>
                                                <p className="text-xs text-slate-500">scans</p>
                                            </div>
                                        </div>
                                        {code.last_scanned_at && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                Last scan: {new Date(code.last_scanned_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
