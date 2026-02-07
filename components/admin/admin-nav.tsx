'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, BookOpen, Music, Flame, BookMarked, Quote as Quote2, Sparkles, ImageIcon, Video, BarChart, DollarSign, Book, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    group: 'Dashboard',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart },
      { id: 'ads', label: 'Ads Manager', icon: DollarSign },
    ],
  },
  {
    group: 'Categories',
    items: [
      { id: 'categories', label: 'Categories', icon: LayoutGrid },
    ],
  },
  {
    group: 'Devotional Text',
    items: [
      { id: 'bhajans', label: 'Bhajans', icon: Music },
      { id: 'aarti', label: 'Aarti', icon: Flame },
      { id: 'chalisa', label: 'Chalisa', icon: BookOpen },
      { id: 'stotra', label: 'Stotra', icon: BookMarked },
    ],
  },
  {
    group: 'Bhagavad Gita',
    items: [
      { id: 'gita-shlok', label: 'Gita Shlok', icon: Book },
    ],
  },
  {
    group: 'Daily Content',
    items: [
      { id: 'quotes', label: 'Daily Quotes', icon: Quote2 },
      { id: 'gita-sandesh', label: 'Gita Sandesh', icon: Sparkles },
    ],
  },
  {
    group: 'Media',
    items: [
      { id: 'wallpapers', label: 'Wallpapers', icon: ImageIcon },
      { id: 'festival-posts', label: 'Festival Posts', icon: Video },
    ],
  },
  {
    group: 'Communication',
    items: [
      { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquare },
    ],
  },
]

interface AdminNavProps {
  activeSection: string
  setActiveSection: (section: string) => void
  mobile?: boolean
}

export default function AdminNav({
  activeSection,
  setActiveSection,
  mobile = false,
}: AdminNavProps) {
  const handleSelect = (id: string) => {
    setActiveSection(id)
  }

  return (
    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
      {navItems.map((group) => (
        <div key={group.group}>
          <h3 className="px-2 text-xs font-semibold uppercase text-sidebar-accent-foreground/60 mb-3">
            {group.group}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 px-3 h-9 text-sm font-medium',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                  onClick={() => handleSelect(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

