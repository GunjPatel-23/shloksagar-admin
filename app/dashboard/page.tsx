'use client'

import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import AdminNav from '@/components/admin/admin-nav'
import CategoryManager from '@/components/admin/category-manager'
import TextContentManager from '@/components/admin/text-content-manager'
import QuotesManager from '@/components/admin/quotes-manager'
import GitaSandeshManager from '@/components/admin/gita-sandesh-manager'
import WallpapersManager from '@/components/admin/wallpapers-manager'
import VideosManager from '@/components/admin/videos-manager'
import AnalyticsDashboard from '@/components/admin/analytics-dashboard'
import AdsManager from '@/components/admin/ads-manager'
import ContactMessagesManager from '@/components/admin/contact-messages-manager'

export default function AdminDashboard() {
  useEffect(() => {
    document.title = 'Dashboard - ShlokSagar Admin'
  }, [])
  const [activeSection, setActiveSection] = useState('analytics')
  const [isMobile, setIsMobile] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState('')
  const { logout } = useAdminAuth()

  // Session timeout countdown
  useEffect(() => {
    const updateSessionTime = () => {
      const lastActivity = sessionStorage.getItem('lastActivity')
      if (!lastActivity) return

      const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
      const timeLeft = SESSION_TIMEOUT - timeSinceLastActivity

      if (timeLeft <= 0) {
        setSessionTimeLeft('Expired')
      } else {
        const minutes = Math.floor(timeLeft / 60000)
        const seconds = Math.floor((timeLeft % 60000) / 1000)
        setSessionTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    updateSessionTime()
    const interval = setInterval(updateSessionTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const renderSection = () => {
    switch (activeSection) {
      case 'analytics':
        return <AnalyticsDashboard />
      case 'categories':
        return <CategoryManager />
      case 'ads':
        return <AdsManager />
      case 'bhajans':
      case 'aarti':
      case 'chalisa':
      case 'stotra':
        return <TextContentManager contentType={activeSection} />
      case 'quotes':
        return <QuotesManager />
      case 'gita-sandesh':
        return <GitaSandeshManager />
      case 'wallpapers':
        return <WallpapersManager />
      case 'festival-posts':
        return <VideosManager />
      case 'contact-messages':
        return <ContactMessagesManager />
      default:
        return <AnalyticsDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex md:w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground">ShlokSagar</h1>
          <p className="text-sm text-sidebar-accent-foreground/60 mt-1">Admin CMS</p>
        </div>
        <AdminNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-border">
                  <h1 className="text-2xl font-bold">ShlokSagar</h1>
                  <p className="text-sm text-muted-foreground mt-1">Admin CMS</p>
                </div>
                <AdminNav activeSection={activeSection} setActiveSection={setActiveSection} mobile />
              </SheetContent>
            </Sheet>
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {activeSection.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-4 text-sm text-muted-foreground">
              <span className="text-xs">Session:</span>
              <span className={`font-mono font-medium ${parseInt(sessionTimeLeft.split(':')[0]) < 5 ? 'text-orange-600' : ''}`}>
                {sessionTimeLeft}
              </span>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background p-4 md:p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}

