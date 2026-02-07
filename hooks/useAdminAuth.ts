'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

function clearAdminSession() {
    sessionStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminEmail')
    sessionStorage.removeItem('adminName')
    sessionStorage.removeItem('sessionStartTime')
    sessionStorage.removeItem('lastActivity')
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

function isSessionExpired(): boolean {
    const lastActivity = sessionStorage.getItem('lastActivity')
    if (!lastActivity) return true

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
    return timeSinceLastActivity > SESSION_TIMEOUT
}

function updateActivity() {
    sessionStorage.setItem('lastActivity', Date.now().toString())
}

export function useAdminAuth() {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Skip auth check on login page
        if (pathname === '/login') return

        const token = sessionStorage.getItem('adminToken')

        if (!token) {
            router.push('/login')
            return
        }

        // Check if session has expired
        if (isSessionExpired()) {
            clearAdminSession()
            router.push('/login?expired=true')
            return
        }

        // Update activity timestamp
        updateActivity()

        // Verify token with backend
        fetch('http://localhost:3000/api/v1/admin/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                clearAdminSession()
                router.push('/login')
            } else {
                updateActivity()
            }
        }).catch(() => {
            clearAdminSession()
            router.push('/login')
        })

        // Set up activity listeners to update last activity time
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
        const handleActivity = () => updateActivity()

        activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity)
        })

        // Check session timeout every minute
        const intervalId = setInterval(() => {
            if (isSessionExpired()) {
                clearAdminSession()
                router.push('/login?expired=true')
            }
        }, 60000) // Check every minute

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity)
            })
            clearInterval(intervalId)
        }
    }, [pathname, router])

    const logout = () => {
        clearAdminSession()
        router.push('/login')
    }

    return { logout }
}
