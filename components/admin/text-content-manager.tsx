'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminApi } from '@/lib/api'

interface TextContent {
  id: string
  title_en?: string
  title_hi?: string
  title_gu?: string
  content_en?: string
  content_hi?: string
  content_gu?: string
  title: string
  content: string
  category: string
  category_id?: string
  language: 'gujarati' | 'hindi' | 'english'
  metaTitle: string
  metaDescription: string
  slug: string
  status: 'published' | 'draft'
}

const contentTypeLabels = {
  bhajans: 'Bhajans',
  aarti: 'Aarti',
  chalisa: 'Chalisa',
  stotra: 'Stotra / Path',
}



interface TextContentManagerProps {
  contentType: string
}

export default function TextContentManager({
  contentType,
}: TextContentManagerProps) {
  // State
  const [items, setItems] = useState<TextContent[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: string;
    language: 'gujarati' | 'hindi' | 'english';
    metaTitle: string;
    metaDescription: string;
    slug: string;
    status: 'published' | 'draft';
  }>({
    title: '',
    content: '',
    category: '',
    language: 'hindi',
    metaTitle: '',
    metaDescription: '',
    slug: '',
    status: 'draft',
  })

  // Load Data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        // Fetch Content
        const contentRes = await adminApi.getAllContent({ type: contentType });

        // Fetch Categories
        const catRes = await adminApi.getCategories();

        if (mounted) {
          if (contentRes.success) {
            // Map backend content
            const mappedItems = contentRes.data.map((item: any) => ({
              id: item.id,
              title_en: item.title_en,
              title_hi: item.title_hi,
              title_gu: item.title_gu,
              content_en: item.content_en,
              content_hi: item.content_hi,
              content_gu: item.content_gu,
              category: item.category?.name_en || item.category_id,
              category_id: item.category_id,
              metaTitle: item.meta_title,
              metaDescription: item.meta_description,
              slug: item.slug,
              status: item.status
            }));
            setItems(mappedItems);
          }
          if (catRes.success) {
            setCategories(catRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => { mounted = false };
  }, [contentType]);

  const handleOpenDialog = (item?: TextContent) => {
    if (item) {
      setEditingId(item.id)
      setFormData({
        title: (item as any).title_en || (item as any).title_hi || (item as any).title_gu || '',
        content: (item as any).content_en || (item as any).content_hi || (item as any).content_gu || '',
        category: (item as any).category_id || '',
        language: 'hindi',
        metaTitle: item.metaTitle || '',
        metaDescription: item.metaDescription || '',
        slug: item.slug || '',
        status: item.status
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        content: '',
        category: '',
        language: 'hindi',
        metaTitle: '',
        metaDescription: '',
        slug: '',
        status: 'draft',
      })
    }
    setIsDialogOpen(true)
  }

  // Helper to find ID by name (imperfect but works if names unique) or just rely on user re-selecting
  const getCategoryIdFromName = (name: string) => {
    const cat = categories.find(c => c.name === name);
    return cat ? cat.id : '';
  }

  // ... generateSlug ...
  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      metaTitle: title || formData.metaTitle,
    })
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category_id: formData.category,
        meta_title: formData.metaTitle,
        meta_desc: formData.metaDescription,
        slug: formData.slug,
        status: formData.status,
        type: contentType,
      };

      if (editingId) {
        const res = await adminApi.updateContent(editingId, payload);
        if (res.success) {
          // Reload
          const contentRes = await adminApi.getAllContent({ type: contentType });
          if (contentRes.success) {
            const mappedItems = contentRes.data.map((item: any) => ({
              id: item.id,
              title_en: item.title_en,
              title_hi: item.title_hi,
              title_gu: item.title_gu,
              content_en: item.content_en,
              content_hi: item.content_hi,
              content_gu: item.content_gu,
              category: item.category?.name_en || item.category_id,
              category_id: item.category_id,
              metaTitle: item.meta_title,
              metaDescription: item.meta_description,
              slug: item.slug,
              status: item.status
            }));
            setItems(mappedItems);
          }
        }
      } else {
        const res = await adminApi.createContent(payload);
        if (res.success) {
          // Reload
          const contentRes = await adminApi.getAllContent({ type: contentType });
          if (contentRes.success) {
            const mappedItems = contentRes.data.map((item: any) => ({
              id: item.id,
              title_en: item.title_en,
              title_hi: item.title_hi,
              title_gu: item.title_gu,
              content_en: item.content_en,
              content_hi: item.content_hi,
              content_gu: item.content_gu,
              category: item.category?.name_en || item.category_id,
              category_id: item.category_id,
              metaTitle: item.meta_title,
              metaDescription: item.meta_description,
              slug: item.slug,
              status: item.status
            }));
            setItems(mappedItems);
          }
        }
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save content');
    }
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await adminApi.deleteContent(deleteId);
        setItems(items.filter((item) => item.id !== deleteId))
        setDeleteId(null)
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete content');
      }
    }
  }

  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    const titleText = (item as any).title_en || (item as any).title_hi || (item as any).title_gu || item.title || ''
    const matchesSearch =
      titleText.toLowerCase().includes(searchLower) ||
      (item.slug || '').toLowerCase().includes(searchLower)
    const matchesStatus =
      filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {contentTypeLabels[contentType as keyof typeof contentTypeLabels]}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Manage all {contentType} content with SEO optimization
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Add {contentTypeLabels[contentType as keyof typeof contentTypeLabels]}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit ' : 'Add New '}
                {contentTypeLabels[contentType as keyof typeof contentTypeLabels]}
              </DialogTitle>
              <DialogDescription>
                Fill in the content details below. Text content is primary - no
                images allowed.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name_en || cat.name_hi || cat.name_gu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, language: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter full content text. Keep text readable for elders with large font sizes..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.content.length} characters
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from title
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO title (50-60 characters)"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="SEO description (120-160 characters)"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

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
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex-1 flex items-center gap-2 bg-background rounded border border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{(item as any).title_en || (item as any).title_hi || (item as any).title_gu || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        /{item.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {item.category}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${item.status === 'published'
                      ? 'bg-accent/20 text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center bg-card border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-medium">No content found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first {contentType} entry to get started
          </p>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The content will be permanently
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
