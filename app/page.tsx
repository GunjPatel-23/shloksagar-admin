'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Ensure cookie is set for middleware
      document.cookie = `adminToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return null
}

