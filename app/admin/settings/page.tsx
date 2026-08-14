'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SiteSettings {
  phoneDisplay: string;
  phoneTel: string;
  dispatchEmail: string;
  serviceAddress: string;
  heroTitleGold: string;
  heroTitleMain: string;
  heroSubtitle: string;
  locationsHeroTitle: string;
  locationsHeroSubtitle: string;
  locationsHeroImage: string;
}

const DEFAULTS: SiteSettings = {
  phoneDisplay: '(617) 784-0264',
  phoneTel: '16177840264',
  dispatchEmail: 'info@bostonluxurychauffeur.com',
  serviceAddress: 'Boston, Massachusetts, USA',
  heroTitleGold: 'Boston Luxury Chauffeur',
  heroTitleMain: '— Logan Airport Car Service',
  heroSubtitle: 'Elite Corporate Travel, Private Event Transportation & Logan Airport Transfers',
  locationsHeroTitle: 'Our Service Locations',
  locationsHeroSubtitle: 'Luxury Executive Transport Across the Greater Area',
  locationsHeroImage: '',
};

export default function SiteSettingsPage() {
  const [formData, setFormData] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings;
        setFormData({
          phoneDisplay: s.phoneDisplay ?? DEFAULTS.phoneDisplay,
          phoneTel: s.phoneTel ?? DEFAULTS.phoneTel,
          dispatchEmail: s.dispatchEmail ?? DEFAULTS.dispatchEmail,
          serviceAddress: s.serviceAddress ?? DEFAULTS.serviceAddress,
          heroTitleGold: s.heroTitleGold ?? DEFAULTS.heroTitleGold,
          heroTitleMain: s.heroTitleMain ?? DEFAULTS.heroTitleMain,
          heroSubtitle: s.heroSubtitle ?? DEFAULTS.heroSubtitle,
          locationsHeroTitle: s.locationsHeroTitle ?? DEFAULTS.locationsHeroTitle,
          locationsHeroSubtitle: s.locationsHeroSubtitle ?? DEFAULTS.locationsHeroSubtitle,
          locationsHeroImage: s.locationsHeroImage ?? '',
        });
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedAt(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save settings');
      }
    } catch {
      setError('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: form,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, locationsHeroImage: data.url || data.path || '' }));
      } else {
        alert('Image upload failed. Please try again.');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const set = (field: keyof SiteSettings, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  if (loading) {
    return (
      <div>
        <h1 className="admin-page-header__title" style={{ marginBottom: '1rem' }}>
          Site Settings
        </h1>
        <p className="admin-loading">Loading settings…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-header__title">Site Settings</h1>
        <p className="admin-dashboard-header__sub">
          Edit the global contact info, hero section content, and locations page displayed on the public website.
        </p>
      </div>

      {error && <div className="admin-login__error">{error}</div>}

      <form onSubmit={handleSave} className="admin-settings-wrap">
        {/* ── Contact Info ─────────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Contact Information</h3>

          <div className="admin-form__row">
            <div>
              <label className="admin-form__label">Phone Display (shown to users)</label>
              <input
                type="text"
                className="admin-form__input"
                value={formData.phoneDisplay}
                onChange={(e) => set('phoneDisplay', e.target.value)}
                placeholder="(617) 784-0264"
              />
            </div>
            <div>
              <label className="admin-form__label">Phone Tel (href=&quot;tel:…&quot;)</label>
              <input
                type="text"
                className="admin-form__input"
                value={formData.phoneTel}
                onChange={(e) => set('phoneTel', e.target.value)}
                placeholder="16177840264"
              />
              <span className="admin-form__hint">Digits only, including country code</span>
            </div>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Dispatch Email</label>
            <input
              type="email"
              className="admin-form__input"
              value={formData.dispatchEmail}
              onChange={(e) => set('dispatchEmail', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Service Address</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.serviceAddress}
              onChange={(e) => set('serviceAddress', e.target.value)}
            />
          </div>
        </div>

        {/* ── Home Hero Section ─────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Home Page Hero Section</h3>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Title — Gold Line</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.heroTitleGold}
              onChange={(e) => set('heroTitleGold', e.target.value)}
              placeholder="Boston Luxury Chauffeur"
            />
            <span className="admin-form__hint">Displayed in gold on the hero banner</span>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Title — Main Line</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.heroTitleMain}
              onChange={(e) => set('heroTitleMain', e.target.value)}
              placeholder="— Logan Airport Car Service"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Subtitle</label>
            <textarea
              rows={3}
              className="admin-form__textarea"
              value={formData.heroSubtitle}
              onChange={(e) => set('heroSubtitle', e.target.value)}
            />
          </div>
        </div>

        {/* ── Locations Page Hero ───────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Locations Page Hero</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Controls the banner displayed at the top of the public <strong>/locations</strong> page.
          </p>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Heading</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.locationsHeroTitle}
              onChange={(e) => set('locationsHeroTitle', e.target.value)}
              placeholder="Our Service Locations"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Subtitle</label>
            <input
              type="text"
              className="admin-form__input"
              value={formData.locationsHeroSubtitle}
              onChange={(e) => set('locationsHeroSubtitle', e.target.value)}
              placeholder="Luxury Executive Transport Across the Greater Area"
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Hero Background Image</label>

            {formData.locationsHeroImage && (
              <div style={{ marginBottom: '0.75rem', position: 'relative', borderRadius: 8, overflow: 'hidden', maxHeight: 160, background: '#000' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.locationsHeroImage}
                  alt="Locations hero preview"
                  style={{ width: '100%', height: 160, objectFit: 'cover', opacity: 0.85 }}
                />
                <button
                  type="button"
                  onClick={() => set('locationsHeroImage', '')}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(244,63,94,0.9)', color: '#fff',
                    border: 'none', borderRadius: 6, padding: '4px 10px',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                className="admin-btn--ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : '📁 Upload Image'}
              </button>
              {formData.locationsHeroImage && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  {formData.locationsHeroImage}
                </span>
              )}
            </div>
            <span className="admin-form__hint">
              Recommended: wide landscape image (1920×600px). Supports JPEG, PNG, WebP.
            </span>
          </div>
        </div>

        {/* ── Save ─────────────────────────────── */}
        <div className="admin-settings__submit-row">
          <button type="submit" className="admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {savedAt && (
            <span className="admin-settings__saved">✓ Saved at {savedAt}</span>
          )}
        </div>
      </form>
    </div>
  );
}
