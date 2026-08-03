'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
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

      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="admin-form__group">
      {label && <label className="admin-form__label">{label}</label>}

      {error && (
        <div style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {value ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: '#141c2e',
          }}
        >
          <img
            src={value}
            alt="Uploaded preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(244, 63, 94, 0.9)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
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
            border: '2px dashed rgba(197, 164, 109, 0.3)',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c5a46d' }}>
              <Loader2 className="animate-spin" size={24} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Uploading image…</span>
            </div>
          ) : (
            <>
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
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                Click to upload image
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                PNG, JPG, WEBP up to 10MB
              </span>
            </>
          )}

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
