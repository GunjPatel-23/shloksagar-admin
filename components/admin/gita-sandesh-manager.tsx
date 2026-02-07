'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminApi } from '@/lib/api'

interface GitaSandesh {
  id: string
  shlok: string
  meaning: string
  adhyay_name?: string
  adhyay_number?: number
  shlok_name?: string
  image_url?: string
  video_url?: string
  date: string
}

export default function GitaSandeshManager() {
  const [items, setItems] = useState<GitaSandesh[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [formData, setFormData] = useState<{
    shlok: string
    meaning: string
    adhyayName?: string
    adhyayNumber?: number
    shlokName?: string
    image_url: string
    video_url: string
    date: string
  }>({
    shlok: '',
    meaning: '',
    adhyayName: '',
    adhyayNumber: undefined,
    shlokName: '',
    image_url: '',
    video_url: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [detailedMeaning, setDetailedMeaning] = useState(false)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getGitaSandesh()
      if (res.success) {
        setItems(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch Gita Sandesh:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleOpenDialog = (item?: GitaSandesh) => {
    if (item) {
      setEditingId(item.id)
      // Parse content_en back to shlok and meaning (split by double newline)
      const content = (item as any).content_en || '';
      const parts = content.split('\n\n');
      setFormData({
        shlok: parts[0] || item.shlok || '',
        meaning: parts[1] || item.meaning || '',
        adhyayName: (item as any).adhyay_name || (item as any).adhyayName || '',
        adhyayNumber: (item as any).adhyay_number || (item as any).adhyayNumber || undefined,
        shlokName: (item as any).shlok_name || (item as any).shlokName || '',
        image_url: item.image_url || '',
        video_url: item.video_url || '',
        date: item.date.split('T')[0],
      })
      setMediaType(item.image_url ? 'image' : 'video')
    } else {
      setEditingId(null)
      setFormData({
        shlok: '',
        meaning: '',
        adhyayName: '',
        adhyayNumber: undefined,
        shlokName: '',
        image_url: '',
        video_url: '',
        date: new Date().toISOString().split('T')[0],
      })
      setMediaType('image')
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.shlok.trim() || !formData.meaning.trim()) {
      alert('Shlok and meaning are required')
      return
    }

    try {
      if (editingId) {
        await adminApi.updateGitaSandesh(editingId, formData)
      } else {
        await adminApi.createGitaSandesh(formData)
      }
      fetchItems()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save Gita Sandesh:', error)
      alert('Failed to save Gita Sandesh')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteGitaSandesh(deleteId)
        fetchItems()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete item:', error)
        alert('Failed to delete item')
      }
    }
  }

  if (isLoading) return <div>Loading Gita Sandesh...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gita Sandesh</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Daily Gita wisdom - latest entry shown first on website
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Sandesh
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Gita Sandesh' : 'Add New Gita Sandesh'}
              </DialogTitle>
              <DialogDescription>
                Add a daily Gita wisdom with shlok, meaning, and media
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shlok">Shlok (Sanskrit) *</Label>
                <Textarea
                  id="shlok"
                  placeholder="Enter the shlok; can be multiple lines (1-4 lines)"
                  value={formData.shlok}
                  onChange={(e) =>
                    setFormData({ ...formData, shlok: e.target.value })
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Shlok supports up to 4 lines; separate meaning with the Meaning field below.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meaning">{detailedMeaning ? 'Detailed Meaning' : 'One-line Meaning'} {detailedMeaning ? '' : '*'}</Label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={detailedMeaning} onChange={(e) => setDetailedMeaning(e.target.checked)} />
                    <span>Detailed explanation</span>
                  </label>
                </div>
                <Textarea
                  id="meaning"
                  placeholder="Enter the meaning in simple language..."
                  value={formData.meaning}
                  onChange={(e) =>
                    setFormData({ ...formData, meaning: e.target.value })
                  }
                  rows={detailedMeaning ? 8 : 2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adhyayName">Adhyay Name</Label>
                  <Input
                    id="adhyayName"
                    placeholder="e.g., Arjuna Vishada Yoga"
                    value={formData.adhyayName || ''}
                    onChange={(e) => setFormData({ ...formData, adhyayName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adhyayNumber">Adhyay Number</Label>
                  <Input
                    id="adhyayNumber"
                    type="number"
                    placeholder="1"
                    value={formData.adhyayNumber || ''}
                    onChange={(e) => setFormData({ ...formData, adhyayNumber: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shlokName">Shlok Name</Label>
                  <Input
                    id="shlokName"
                    placeholder="Optional shlok title"
                    value={formData.shlokName || ''}
                    onChange={(e) => setFormData({ ...formData, shlokName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <Tabs
                value={mediaType}
                onValueChange={(v) =>
                  setMediaType(v as 'image' | 'video')
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="video">Video</TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="space-y-2 mt-4">
                  <Label>Featured Image (Optional)</Label>
                  <CloudinaryUpload
                    onUpload={(url) =>
                      setFormData({ ...formData, image_url: url, video_url: '' })
                    }
                    value={formData.image_url}
                  />
                </TabsContent>

                <TabsContent value="video" className="space-y-2 mt-4">
                  <Label>Video (Optional)</Label>
                  <CloudinaryUpload
                    onUpload={(url) =>
                      setFormData({ ...formData, video_url: url, image_url: '' })
                    }
                    value={formData.video_url}
                    accept="video/*"
                    maxSize={50}
                  />
                </TabsContent>
              </Tabs>
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
                {editingId ? 'Update' : 'Add'} Sandesh
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sandesh List */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="grid md:grid-cols-3 gap-4 p-4">
              {item.image_url && (
                <div className="aspect-square bg-muted rounded overflow-hidden">
                  <img
                    src={item.image_url}
                    alt="Sandesh"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {item.video_url && (
                <div className="aspect-square bg-muted rounded overflow-hidden">
                  <video
                    src={item.video_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}

              <div
                className={item.image_url || item.video_url ? 'md:col-span-2' : 'col-span-3'}
              >
                <p className="text-sm font-medium text-foreground italic mb-2">
                  {item.shlok}
                </p>
                <p className="text-sm text-card-foreground mb-3">
                  {item.meaning}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-4 pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(item)}
                className="gap-1 text-xs h-8"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteId(item.id)}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No Gita Sandesh entries yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first daily wisdom to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sandesh?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The entry will be permanently
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
