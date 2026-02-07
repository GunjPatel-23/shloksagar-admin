'use client'

import React from "react"

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CloudinaryUploadProps {
  onUpload: (url: string) => void
  value?: string
  accept?: string
  maxSize?: number // in MB
}

export function CloudinaryUpload({
  onUpload,
  value,
  accept = 'image/*',
  maxSize = 10,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log('🔵 Starting upload for file:', file.name);

      // 1. Get Signature from Backend
      console.log('🔵 Requesting Cloudinary signature...');
      const { mediaApi } = await import('../../lib/api');
      const sigResponse = await mediaApi.getCloudinarySignature();

      console.log('🔵 Signature response:', sigResponse);

      if (!sigResponse.success) {
        throw new Error(sigResponse.error || 'Failed to get upload signature');
      }

      const { signature, timestamp, folder, apiKey, cloudName } = sigResponse.data;

      console.log('🔵 Got signature, uploading to Cloudinary...');

      // 2. Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      // Determine resource type based on file
      const resourceType = accept.includes('video') ? 'video' : 'image';

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      )

      console.log('🔵 Cloudinary response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      console.log('✅ Image uploaded successfully:', data.secure_url);
      onUpload(data.secure_url);

    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload file')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
          {(accept.includes('video') || value.match(/\.(mp4|webm|ogg)$/i)) ? (
            <video
              src={value}
              className="w-full h-full object-cover"
              controls
            />
          ) : (
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" x="50" y="50" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
              }}
            />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0"
            onClick={() => onUpload('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept === 'image/*'
                ? 'PNG, JPG, GIF up to 10MB'
                : 'MP4, WebM up to 50MB'}
            </p>
          </div>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Uploading...
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Note: Images are optimized by Cloudinary for elder-friendly viewing
      </p>
    </div>
  )
}
