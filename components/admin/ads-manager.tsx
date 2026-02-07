'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Pause, Play, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { adminApi } from '@/lib/api'
import { CloudinaryUpload } from './cloudinary-upload'

interface AdPackage {
    id: string
    name: string
    impressions: number
    price_inr: number
}

interface Ad {
    id: string
    advertiser_name: string
    image_url: string
    redirect_url: string
    total_impressions: number
    used_impressions: number
    remaining_impressions: number
    status: 'active' | 'paused' | 'completed'
    package: {
        name: string
        impressions: number
        price_inr: number
    }
}

export default function AdsManager() {
    const [ads, setAds] = useState<Ad[]>([])
    const [packages, setPackages] = useState<AdPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        advertiserName: '',
        imageUrl: '',
        redirectUrl: '',
        packageId: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            const [adsRes, packagesRes] = await Promise.all([
                adminApi.getAds(),
                adminApi.getAdPackages()
            ])
            setAds(adsRes.data || [])
            setPackages(packagesRes.data || [])
        } catch (error) {
            console.error('Failed to fetch ads:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateAd(e: React.FormEvent) {
        e.preventDefault()
        try {
            await adminApi.createAd({
                advertiserName: formData.advertiserName,
                imageUrl: formData.imageUrl,
                redirectUrl: formData.redirectUrl,
                packageId: formData.packageId
            })
            setIsCreateDialogOpen(false)
            setFormData({ advertiserName: '', imageUrl: '', redirectUrl: '', packageId: '' })
            fetchData()
        } catch (error) {
            console.error('Failed to create ad:', error)
            alert('Failed to create ad')
        }
    }

    async function toggleAdStatus(ad: Ad) {
        const newStatus = ad.status === 'active' ? 'paused' : 'active'
        try {
            await adminApi.updateAdStatus(ad.id, newStatus)
            fetchData()
        } catch (error) {
            console.error('Failed to update ad status:', error)
        }
    }

    function getStatusBadge(status: string) {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            active: 'default',
            paused: 'secondary',
            completed: 'destructive'
        }
        return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Ads Manager</h2>
                    <p className="text-muted-foreground mt-1">Manage impression-based ad campaigns</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Ad
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Ad</DialogTitle>
                            <DialogDescription>
                                Upload an ad image and select an impression package
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateAd} className="space-y-4">
                            <div>
                                <Label htmlFor="advertiserName">Advertiser Name</Label>
                                <Input
                                    id="advertiserName"
                                    value={formData.advertiserName}
                                    onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label>Ad Image</Label>
                                <CloudinaryUpload
                                    onUpload={(url: string) => setFormData({ ...formData, imageUrl: url })}
                                    accept="image/*"
                                />
                                {formData.imageUrl && (
                                    <img src={formData.imageUrl} alt="Ad preview" className="mt-2 rounded max-h-48" />
                                )}
                            </div>

                            <div>
                                <Label htmlFor="redirectUrl">Redirect URL</Label>
                                <Input
                                    id="redirectUrl"
                                    type="url"
                                    placeholder="https://example.com"
                                    value={formData.redirectUrl}
                                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="package">Impressions Package</Label>
                                <Select value={formData.packageId} onValueChange={(val) => setFormData({ ...formData, packageId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select package" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {pkg.name} - {pkg.impressions.toLocaleString()} impressions - ₹{pkg.price_inr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!formData.imageUrl || !formData.packageId}>
                                    Create Ad
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ads.map((ad) => (
                    <Card key={ad.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{ad.advertiser_name}</CardTitle>
                                    <CardDescription>{ad.package.name}</CardDescription>
                                </div>
                                {getStatusBadge(ad.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <img
                                src={ad.image_url}
                                alt={ad.advertiser_name}
                                className="rounded border w-full h-32 object-cover"
                            />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Impressions:</span>
                                    <span className="font-medium">{ad.total_impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Used:</span>
                                    <span className="font-medium">{ad.used_impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Remaining:</span>
                                    <span className="font-medium text-green-600">
                                        {ad.remaining_impressions.toLocaleString()}
                                    </span>
                                </div>

                                <div className="w-full bg-muted rounded-full h-2 mt-3">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${(ad.used_impressions / ad.total_impressions) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {ad.status !== 'completed' && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => toggleAdStatus(ad)}
                                >
                                    {ad.status === 'active' ? (
                                        <>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Pause Ad
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Resume Ad
                                        </>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {ads.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No ads created yet. Create your first ad campaign!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
