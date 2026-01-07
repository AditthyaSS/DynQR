'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, QrCode, Check, X, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Password strength checks
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const passwordsMatch = password === confirmPassword && password.length > 0
    const isPasswordStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumber

    useEffect(() => {
        // Check if user has a valid session from the reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast.error('Invalid or expired reset link')
                router.push('/forgot-password')
            }
        }
        checkSession()
    }, [supabase, router])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!passwordsMatch) {
            toast.error('Passwords do not match')
            return
        }

        if (!isPasswordStrong) {
            toast.error('Please create a stronger password')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success('Password updated successfully!')
            router.push('/dashboard')
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
        <div className={`flex items-center gap-2 text-sm ${valid ? 'text-green-400' : 'text-slate-500'}`}>
            {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {text}
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-purple-600/20 rounded-xl">
                            <QrCode className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Reset your password</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleResetPassword}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                            />
                            {password.length > 0 && (
                                <div className="space-y-1 mt-2 p-3 bg-slate-800/30 rounded-lg">
                                    <PasswordCheck valid={hasMinLength} text="At least 8 characters" />
                                    <PasswordCheck valid={hasUpperCase} text="One uppercase letter" />
                                    <PasswordCheck valid={hasLowerCase} text="One lowercase letter" />
                                    <PasswordCheck valid={hasNumber} text="One number" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                            />
                            {confirmPassword.length > 0 && (
                                <div className={`text-sm flex items-center gap-2 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={loading || !isPasswordStrong || !passwordsMatch}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating password...
                                </>
                            ) : (
                                'Update password'
                            )}
                        </Button>
                        <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 transition-colors text-center">
                            <ArrowLeft className="inline-block mr-1 h-3 w-3" />
                            Back to login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
