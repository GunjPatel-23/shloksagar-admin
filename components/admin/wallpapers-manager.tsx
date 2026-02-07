'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CloudinaryUpload } from '@/components/admin/cloudinary-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminApi } from '@/lib/api'

interface Wallpaper {
  id: string
  name: string
  image_url: string
  tags: string
  // For now we don't have these columns in DB, so we'll just ignore them or store what we can in tags
  // We'll trust the user wants to use name/seoTitle and tags/category
  // seoTitle: string -> name
  // category: string -> tags
}

export default function WallpapersManager() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    image_url: '',
    category: '',
    seoTitle: '',
    altText: '',
    downloadEnabled: true,
  })

  const fetchWallpapers = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getWallpapers()
      if (res.success) {
        setWallpapers(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories()
      if (res.success) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  useEffect(() => {
    fetchWallpapers()
    fetchCategories()
  }, [])

  const handleOpenDialog = (wallpaper?: Wallpaper) => {
    if (wallpaper) {
      setEditingId(wallpaper.id)
      // tags is an array in database, get first tag or empty string
      const categoryTag = wallpaper.tags && Array.isArray(wallpaper.tags) && wallpaper.tags.length > 0
        ? wallpaper.tags[0]
        : (typeof wallpaper.tags === 'string' ? wallpaper.tags : '')

      setFormData({
        image_url: wallpaper.image_url,
        category: categoryTag,
        seoTitle: wallpaper.name || '',
        altText: '', // Not stored in DB
        downloadEnabled: true, // Not stored in DB
      })
    } else {
      setEditingId(null)
      setFormData({
        image_url: '',
        category: '',
        seoTitle: '',
        altText: '',
        downloadEnabled: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.image_url.trim()) {
      alert('Image is required')
      return
    }

    try {
      const payload = {
        name: formData.seoTitle,
        image_url: formData.image_url,
        tags: formData.category ? [formData.category] : []
      }

      if (editingId) {
        await adminApi.updateWallpaper(editingId, payload)
      } else {
        await adminApi.createWallpaper(payload)
      }
      fetchWallpapers()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save wallpaper:', error)
      alert('Failed to save wallpaper')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteWallpaper(deleteId)
        fetchWallpapers()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete wallpaper:', error)
        alert('Failed to delete wallpaper')
      }
    }
  }

  if (isLoading) return <div>Loading wallpapers...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Wallpapers</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage downloadable devotional wallpapers with optional category
            tags
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Wallpaper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Wallpaper' : 'Add New Wallpaper'}
              </DialogTitle>
              <DialogDescription>
                Upload wallpaper and set SEO metadata
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Wallpaper Image *</Label>
                <CloudinaryUpload
                  onUpload={(url) =>
                    setFormData({ ...formData, image_url: url })
                  }
                  value={formData.image_url}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category Tag (Optional)</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category or leave empty" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-2 text-center">
                        No categories available. Please create categories first.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name_en || cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty for no category, or select from created categories
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="e.g., Hanuman Ji Devotional Wallpaper"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  placeholder="Describe the wallpaper for accessibility (Note: strictly for display in this demo)"
                  value={formData.altText}
                  onChange={(e) =>
                    setFormData({ ...formData, altText: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="download"
                  checked={formData.downloadEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      downloadEnabled: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="download" className="text-sm cursor-pointer">
                  Enable Download
                </Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {editingId ? 'Update Wallpaper' : 'Add Wallpaper'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallpapers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallpapers.map((wallpaper) => (
          <Card
            key={wallpaper.id}
            className="overflow-hidden border-border bg-card hover:shadow-lg transition-shadow flex flex-col"
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={wallpaper.image_url}
                alt={wallpaper.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-card-foreground truncate mb-2">
                {wallpaper.name || 'Untitled'}
              </h3>
              {wallpaper.tags && wallpaper.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(Array.isArray(wallpaper.tags) ? wallpaper.tags : [wallpaper.tags]).map((tag, idx) => (
                    <span key={idx} className="inline-block bg-muted px-2 py-1 rounded text-xs text-muted-foreground capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-auto">
                <span className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent-foreground px-2 py-1 rounded">
                  <Download className="h-3 w-3" />
                  Downloadable
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(wallpaper)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(wallpaper.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {wallpapers.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No wallpapers yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first wallpaper to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wallpaper?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The wallpaper will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
