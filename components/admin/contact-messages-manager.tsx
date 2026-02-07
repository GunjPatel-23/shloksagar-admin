'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    DialogFooter,
} from '@/components/ui/dialog'
import { Mail, Phone, MessageSquare, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { adminApi } from '@/lib/api'

interface ContactMessage {
    id: string
    name: string
    email: string
    phone?: string
    message: string
    status: 'new' | 'in_progress' | 'resolved'
    admin_notes?: string
    created_at: string
    resolved_at?: string
}

export default function ContactMessagesManager() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [adminNotes, setAdminNotes] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            setIsLoading(true)
            const res = await adminApi.getContactMessages()
            setMessages(res.data)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenDialog = (message: ContactMessage) => {
        setSelectedMessage(message)
        setAdminNotes(message.admin_notes || '')
        setIsDialogOpen(true)
    }

    const handleUpdateStatus = async (status: 'new' | 'in_progress' | 'resolved') => {
        if (!selectedMessage) return

        try {
            setIsUpdating(true)
            await adminApi.updateContactMessageStatus(selectedMessage.id, status, adminNotes)
            await fetchMessages()
            setIsDialogOpen(false)
            setSelectedMessage(null)
        } catch (error) {
            console.error('Failed to update status:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            new: { variant: 'default', label: 'New', icon: Mail },
            in_progress: { variant: 'secondary', label: 'In Progress', icon: Clock },
            resolved: { variant: 'success', label: 'Resolved', icon: CheckCircle2 },
        }
        const config = variants[status] || variants.new
        const Icon = config.icon
        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Contact Messages</h2>
                    <p className="text-muted-foreground">Manage inquiries from users</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">{messages.filter(m => m.status === 'new').length} New</Badge>
                    <Badge variant="outline">{messages.filter(m => m.status === 'in_progress').length} In Progress</Badge>
                    <Badge variant="outline">{messages.filter(m => m.status === 'resolved').length} Resolved</Badge>
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <Card className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No contact messages yet</p>
                    </Card>
                ) : (
                    messages.map((message) => (
                        <Card key={message.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{message.name}</h3>
                                        {getStatusBadge(message.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${message.email}`} className="hover:text-primary">
                                                {message.email}
                                            </a>
                                        </div>
                                        {message.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${message.phone}`} className="hover:text-primary">
                                                    {message.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-foreground whitespace-pre-wrap">{message.message}</p>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {new Date(message.created_at).toLocaleString()}
                                    </div>
                                </div>

                                <Button onClick={() => handleOpenDialog(message)}>
                                    View & Update
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
                        <DialogDescription>
                            Update status and add admin notes
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMessage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                                </div>
                                {selectedMessage.phone && (
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{selectedMessage.phone}</p>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <p className="text-sm font-medium mb-1">Message</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Notes</Label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this inquiry..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleUpdateStatus('new')}
                                    disabled={isUpdating || selectedMessage.status === 'new'}
                                    className="flex-1"
                                >
                                    Mark as New
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleUpdateStatus('in_progress')}
                                    disabled={isUpdating || selectedMessage.status === 'in_progress'}
                                    className="flex-1"
                                >
                                    Mark In Progress
                                </Button>
                                <Button
                                    onClick={() => handleUpdateStatus('resolved')}
                                    disabled={isUpdating || selectedMessage.status === 'resolved'}
                                    className="flex-1"
                                >
                                    Mark Resolved
                                </Button>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
