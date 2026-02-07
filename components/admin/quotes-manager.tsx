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

interface Quote {
  id: string
  text: string
  image_url: string
  video_url: string
  date: string
}

export default function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [formData, setFormData] = useState<{
    text: string
    image_url: string
    video_url: string
    date: string
  }>({
    text: '',
    image_url: '',
    video_url: '',
    date: new Date().toISOString().split('T')[0],
  })

  const fetchQuotes = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getQuotes()
      if (res.success) {
        setQuotes(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingId(quote.id)
      setFormData({
        text: (quote as any).content_en || quote.text,
        image_url: quote.image_url || '',
        video_url: quote.video_url || '',
        date: quote.date.split('T')[0],
      })
      setMediaType(quote.image_url ? 'image' : 'video')
    } else {
      setEditingId(null)
      setFormData({
        text: '',
        image_url: '',
        video_url: '',
        date: new Date().toISOString().split('T')[0],
      })
      setMediaType('image')
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.text.trim() || (!formData.image_url && !formData.video_url)) {
      alert('Quote text and image/video are required')
      return
    }

    try {
      if (editingId) {
        await adminApi.updateQuote(editingId, formData)
      } else {
        await adminApi.createQuote(formData)
      }
      fetchQuotes()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save quote:', error)
      alert('Failed to save quote')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteQuote(deleteId)
        fetchQuotes()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete quote:', error)
        alert('Failed to delete quote')
      }
    }
  }

  if (isLoading) return <div>Loading quotes...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Quotes</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Latest quotes appear first - manage devotional quotes with images
            or videos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Quote' : 'Add New Quote'}
              </DialogTitle>
              <DialogDescription>
                Add a quote with an image or short video
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="text">Quote Text *</Label>
                <Textarea
                  id="text"
                  placeholder="Enter the quote text in any language..."
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  rows={4}
                />
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
                  <Label>Quote Image *</Label>
                  <CloudinaryUpload
                    onUpload={(url) =>
                      setFormData({ ...formData, image_url: url, video_url: '' })
                    }
                    value={formData.image_url}
                  />
                </TabsContent>

                <TabsContent value="video" className="space-y-2 mt-4">
                  <Label>Video (10-20 seconds recommended)</Label>
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
                {editingId ? 'Update Quote' : 'Add Quote'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card
            key={quote.id}
            className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="grid md:grid-cols-3 gap-4 p-4">
              {quote.image_url && (
                <div className="aspect-video bg-muted rounded overflow-hidden">
                  <img
                    src={quote.image_url}
                    alt="Quote"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {quote.video_url && (
                <div className="aspect-video bg-muted rounded overflow-hidden">
                  <video
                    src={quote.video_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}

              <div
                className={quote.image_url || quote.video_url ? 'md:col-span-2' : 'col-span-3'}
              >
                <p className="text-lg font-medium text-foreground italic mb-3">
                  "{quote.text}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(quote.date).toLocaleDateString('en-US', {
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
                onClick={() => handleOpenDialog(quote)}
                className="gap-1 text-xs h-8"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs h-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteId(quote.id)}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {quotes.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No quotes yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first quote to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The quote will be permanently
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
