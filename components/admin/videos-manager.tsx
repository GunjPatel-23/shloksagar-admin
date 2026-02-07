'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Video as VideoIcon } from 'lucide-react'
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
import { adminApi } from '@/lib/api'

interface Video {
  id: string
  title_en: string
  title_hi?: string
  title_gu?: string
  video_url: string
  thumbnail_url?: string
  description_en?: string
  description_hi?: string
  description_gu?: string
  created_at: string
}

export default function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    description: '',
    mediaType: 'video' as 'video' | 'image',
    uploadedDate: new Date().toISOString().split('T')[0],
  })

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getVideos()
      if (res.success) {
        setVideos(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleOpenDialog = (video?: Video) => {
    if (video) {
      setEditingId(video.id)
      setFormData({
        title: video.title_en || '',
        video_url: video.video_url,
        description: video.description_en || '',
        mediaType: 'video',
        uploadedDate: video.created_at ? new Date(video.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        video_url: '',
        description: '',
        mediaType: 'video',
        uploadedDate: new Date().toISOString().split('T')[0],
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.video_url.trim()) {
      alert('Title and video are required')
      return
    }

    try {
      // Database has title_en, title_hi, title_gu fields
      // and description_en, description_hi, description_gu fields
      const payload = {
        title_en: formData.title, // Store title in English field
        video_url: formData.video_url,
        description_en: formData.description || '', // Store description in English field
        thumbnail_url: '', // Optional - could be auto-generated from video
      }

      if (editingId) {
        await adminApi.updateVideo(editingId, payload)
      } else {
        await adminApi.createVideo(payload)
      }
      fetchVideos()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save video:', error)
      alert('Failed to save video')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteVideo(deleteId)
        fetchVideos()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete video:', error)
        alert('Failed to delete video')
      }
    }
  }

  if (isLoading) return <div>Loading videos...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Festival Posts</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage festival greetings, reels, and wishing posts (images or short videos)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Festival Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Festival Post' : 'Add New Festival Post'}
              </DialogTitle>
              <DialogDescription>
                Upload festival greeting image or short video (reels/shorts)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Diwali Wishes 2026, Holi Celebration"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the festival post..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Media File (Image or Video) *</Label>
                <CloudinaryUpload
                  onUpload={(url) =>
                    setFormData({ ...formData, video_url: url })
                  }
                  value={formData.video_url}
                  accept="image/*,video/*"
                  maxSize={50}
                />
                <p className="text-xs text-muted-foreground">
                  Upload festival greeting image or short video (reels/shorts format, max 50MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Upload Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.uploadedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, uploadedDate: e.target.value })
                  }
                  disabled // Date is handled by DB
                  className="opacity-50 cursor-not-allowed"
                />
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
                {editingId ? 'Update Post' : 'Add Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow flex flex-col"
          >
            {video.video_url && (
              <div className="aspect-video bg-muted overflow-hidden">
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                  controls
                />
              </div>
            )}
            {!video.video_url && (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <VideoIcon className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-card-foreground mb-2">
                {video.title_en || 'Untitled Video'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(video.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(video)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(video.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">No videos yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload your first video to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The video will be permanently
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
