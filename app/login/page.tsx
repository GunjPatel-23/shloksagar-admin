'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Force dynamic rendering - login page should not be statically generated
export const dynamic = 'force-dynamic'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const expired = searchParams?.get('expired')

    useEffect(() => {
        document.title = 'Admin Login - ShlokSagar'

        // Clear any existing session data on login page
        sessionStorage.clear()
        document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/api/v1/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Store admin token in sessionStorage (clears on browser close)
            sessionStorage.setItem('adminToken', data.token)
            sessionStorage.setItem('adminEmail', data.admin.email)
            sessionStorage.setItem('adminName', data.admin.name)
            sessionStorage.setItem('sessionStartTime', Date.now().toString())
            sessionStorage.setItem('lastActivity', Date.now().toString())

            // Set cookie for middleware (session cookie - expires on browser close)
            document.cookie = `adminToken=${data.token}; path=/; SameSite=Strict`

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="space-y-1 text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">🕉️</div>
                    <CardTitle className="text-2xl font-bold">ShlokSagar Admin</CardTitle>
                    <CardDescription>Sign in to access the admin panel</CardDescription>
                </CardHeader>
                <CardContent>
                    {expired && (
                        <Alert className="mb-4 bg-amber-50 border-amber-200">
                            <AlertDescription className="text-amber-800">
                                Your session has expired due to inactivity. Please login again.
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@shloksagar.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Secure admin access only</p>
                        <p className="mt-2 text-xs">Powered by AstraSoft Innovations</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
