'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'general',
  label = 'Upload Image',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [localPreview, setLocalPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear local blob preview when prop value updates to official server URL
  useEffect(() => {
    if (value && !value.startsWith('blob:')) {
      setLocalPreview('');
    }
  }, [value]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    // 1. Instant client-side preview via Blob URL
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // 2. Set official uploaded public URL
      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLocalPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setLocalPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = localPreview || value;

  return (
    <div className="admin-form__group">
      {label && <label className="admin-form__label">{label}</label>}

      {error && (
        <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {displayImage ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
          }}
        >
          <img
            src={displayImage}
            alt="Uploaded preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // Fallback if image fails to load
              console.warn('Image failed to load:', displayImage);
            }}
          />

          {uploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#b8860b',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              <Loader2 className="animate-spin" size={22} />
              <span>Saving image…</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
            }}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '140px',
            border: '2px dashed rgba(197, 164, 109, 0.4)',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 164, 109, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c5a46d',
              marginBottom: '0.5rem',
            }}
          >
            <Upload size={20} />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700 }}>
            Click to upload image
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            PNG, JPG, WEBP up to 10MB
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      )}
    </div>
  );
}
