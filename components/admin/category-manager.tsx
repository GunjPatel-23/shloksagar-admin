'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, EyeOff, GripVertical } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  image: string
  description: string
  visible: boolean
  order: number
}



export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
  })

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      // Pass true to include hidden categories in the manager
      const res = await adminApi.getCategories(true)
      if (res.success) {
        setCategories(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id)
      setFormData({
        name: category.name,
        image: category.image || '',
        description: category.description || '',
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', image: '', description: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.image.trim()) {
      alert('Name and image are required')
      return
    }

    try {
      const payload = {
        name: formData.name,
        image: formData.image,
        description: formData.description,
        visible: true // Default
      }

      if (editingId) {
        await adminApi.updateCategory(editingId, payload)
      } else {
        // Check for duplicate name if needed, but backend handles inserts
        await adminApi.createCategory(payload)
      }
      fetchCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteCategory(deleteId)
        fetchCategories()
        setDeleteId(null)
      } catch (error) {
        console.error('Failed to delete category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const toggleVisibility = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (!category) return

    try {
      const payload = { ...category, visible: !category.visible }
      // API expects mapped fields (if any mismatch), but for category it's mostly same.
      // Backend updateCategory updates all fields provided.
      await adminApi.updateCategory(id, payload)

      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, visible: !cat.visible } : cat,
        ),
      )
    } catch (error) {
      console.error('Failed to update visibility:', error)
      alert('Failed to update visibility')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Category Management</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Create and manage God categories for your devotional content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update the category details below'
                  : 'Create a new God category for organizing content'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Hanuman Ji"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Category Image *</Label>
                <CloudinaryUpload
                  onUpload={(url) =>
                    setFormData({ ...formData, image: url })
                  }
                  value={formData.image}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
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
                {editingId ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-card-foreground truncate">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {category.description || 'No description'}
              </p>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleVisibility(category.id)}
                  className="flex-1 text-xs gap-1 h-8"
                >
                  {category.visible ? (
                    <>
                      <Eye className="h-3 w-3" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Hidden
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(category.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <p className="text-muted-foreground">No categories yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first category to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All content in this category will be
              affected.
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
