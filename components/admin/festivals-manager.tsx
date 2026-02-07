'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminApi } from '@/lib/api'

interface Festival {
  id: string
  name: string
  start_date: string
  end_date?: string
  image_url?: string
  video_url?: string
  description?: string
  active: boolean
}

export default function FestivalsManager() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [formData, setFormData] = useState<{
    name: string
    start_date: string
    end_date: string
    image_url: string
    video_url: string
    description: string
    active: boolean
  }>({
    name: '',
    start_date: '',
    end_date: '',
    image_url: '',
    video_url: '',
    description: '',
    active: true,
  })

  const fetchFestivals = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getFestivals()
      if (res.success) {
        setFestivals(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch festivals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFestivals()
  }, [])

  const handleOpenDialog = (festival?: Festival) => {
    if (festival) {
      setEditingId(festival.id)
      setFormData({
        name: festival.name,
        start_date: festival.start_date ? festival.start_date.split('T')[0] : '',
        end_date: festival.end_date ? festival.end_date.split('T')[0] : '',
        image_url: festival.image_url || '',
        video_url: festival.video_url || '',
        description: festival.description || '',
        active: festival.active,
      })
      setMediaType(festival.image_url ? 'image' : 'video')
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        image_url: '',
        video_url: '',
        description: '',
        active: true,
      })
      setMediaType('image')
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.start_date) {
      alert('Festival name and start date are required')
      return
    }

    try {
      if (editingId) {
        await adminApi.updateFestival(editingId, formData)
      } else {
        await adminApi.createFestival(formData)
      }
      fetchFestivals()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save festival:', error)
      alert('Failed to save festival')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteFestival(deleteId)
        fetchFestivals()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete festival:', error)
        alert('Failed to delete festival')
      }
    }
  }

  const toggleActive = async (festival: Festival) => {
    try {
      await adminApi.updateFestival(festival.id, { active: !festival.active })
      fetchFestivals()
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    }
  }

  if (isLoading) return <div>Loading festivals...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Festivals</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage festival entries with date ranges and creative media
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Festival
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Festival' : 'Add New Festival'}
              </DialogTitle>
              <DialogDescription>
                Create a festival entry with date range and media
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Festival Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Diwali, Holi, Navratri"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the festival..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
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
                  <Label>Festival Creative (Image)</Label>
                  <CloudinaryUpload
                    onUpload={(url) =>
                      setFormData({ ...formData, image_url: url, video_url: '' })
                    }
                    value={formData.image_url}
                  />
                </TabsContent>

                <TabsContent value="video" className="space-y-2 mt-4">
                  <Label>Festival Creative (Video)</Label>
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

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <Label htmlFor="active" className="text-sm cursor-pointer">
                  Active on website
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
                {editingId ? 'Update Festival' : 'Add Festival'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Festivals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {festivals.map((festival) => (
          <Card
            key={festival.id}
            className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow"
          >
            {festival.image_url && (
              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={festival.image_url}
                  alt={festival.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {festival.video_url && (
              <div className="aspect-video bg-muted overflow-hidden">
                <video
                  src={festival.video_url}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-card-foreground text-lg">
                  {festival.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(festival)}
                  className="h-8 w-8 p-0"
                >
                  {festival.active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Date Range:</span>{' '}
                  {new Date(festival.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  {festival.end_date
                    ? `- ${new Date(festival.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`
                    : ''}
                </p>
                {festival.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {festival.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${festival.active
                      ? 'bg-accent/20 text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {festival.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(festival)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(festival.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {festivals.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No festivals yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first festival entry to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Festival?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The festival entry will be
              permanently deleted.
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
