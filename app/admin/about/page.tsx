'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { ABOUT_ICON_NAMES } from '@/lib/aboutIcons';
import {
  DEFAULT_ABOUT_CONTENT,
  type AboutContentData,
  type AboutFeatureBox,
  type AboutPillar,
  type AboutStat,
} from '@/lib/aboutDefaults';

export default function AboutContentAdminPage() {
  const [formData, setFormData] = useState<AboutContentData>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/about');
      const data = await res.json();
      if (res.ok && data.content) {
        const c = data.content;
        const parseArr = <T,>(raw: unknown, fallback: T[]): T[] => {
          if (Array.isArray(raw)) return raw as T[];
          if (typeof raw === 'string') {
            try {
              const parsed = JSON.parse(raw);
              return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
            } catch {
              return fallback;
            }
          }
          return fallback;
        };

        setFormData({
          heroTag: c.heroTag ?? DEFAULT_ABOUT_CONTENT.heroTag,
          heroTitle: c.heroTitle ?? DEFAULT_ABOUT_CONTENT.heroTitle,
          heroDesc: c.heroDesc ?? DEFAULT_ABOUT_CONTENT.heroDesc,
          heroImage: c.heroImage ?? '',
          whoTag: c.whoTag ?? DEFAULT_ABOUT_CONTENT.whoTag,
          whoTitlePrefix: c.whoTitlePrefix ?? DEFAULT_ABOUT_CONTENT.whoTitlePrefix,
          whoTitleHighlight: c.whoTitleHighlight ?? DEFAULT_ABOUT_CONTENT.whoTitleHighlight,
          whoDesc: c.whoDesc ?? DEFAULT_ABOUT_CONTENT.whoDesc,
          whoText1: c.whoText1 ?? DEFAULT_ABOUT_CONTENT.whoText1,
          whoText2: c.whoText2 ?? DEFAULT_ABOUT_CONTENT.whoText2,
          whoImage: c.whoImage ?? '',
          featureBoxes: parseArr<AboutFeatureBox>(c.featureBoxes, DEFAULT_ABOUT_CONTENT.featureBoxes),
          pillarsTag: c.pillarsTag ?? DEFAULT_ABOUT_CONTENT.pillarsTag,
          pillarsTitle: c.pillarsTitle ?? DEFAULT_ABOUT_CONTENT.pillarsTitle,
          pillarsDesc: c.pillarsDesc ?? DEFAULT_ABOUT_CONTENT.pillarsDesc,
          pillars: parseArr<AboutPillar>(c.pillars, DEFAULT_ABOUT_CONTENT.pillars),
          statsTag: c.statsTag ?? DEFAULT_ABOUT_CONTENT.statsTag,
          statsHeader: c.statsHeader ?? DEFAULT_ABOUT_CONTENT.statsHeader,
          statsImage: c.statsImage ?? '',
          stats: parseArr<AboutStat>(c.stats, DEFAULT_ABOUT_CONTENT.stats),
          cta1Tag: c.cta1Tag ?? DEFAULT_ABOUT_CONTENT.cta1Tag,
          cta1Title: c.cta1Title ?? DEFAULT_ABOUT_CONTENT.cta1Title,
          cta1BtnText: c.cta1BtnText ?? DEFAULT_ABOUT_CONTENT.cta1BtnText,
          cta1BtnLink: c.cta1BtnLink ?? DEFAULT_ABOUT_CONTENT.cta1BtnLink,
          cta1Image: c.cta1Image ?? '',
          cta2Tag: c.cta2Tag ?? DEFAULT_ABOUT_CONTENT.cta2Tag,
          cta2Title: c.cta2Title ?? DEFAULT_ABOUT_CONTENT.cta2Title,
          cta2BtnText: c.cta2BtnText ?? DEFAULT_ABOUT_CONTENT.cta2BtnText,
          cta2BtnLink: c.cta2BtnLink ?? DEFAULT_ABOUT_CONTENT.cta2BtnLink,
          cta2Image: c.cta2Image ?? '',
        });
      }
    } catch (e) {
      console.error('Failed to load about content', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const set = <K extends keyof AboutContentData>(field: K, val: AboutContentData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedAt(null);

    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString());
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save about content');
      }
    } catch {
      setError('Error saving about content');
    } finally {
      setSaving(false);
    }
  };

  // ── Feature box handlers ──
  const addFeatureBox = () =>
    setFormData((prev) => ({
      ...prev,
      featureBoxes: [...prev.featureBoxes, { icon: 'ShieldCheck', title: 'New Feature', desc: 'Describe this feature.' }],
    }));
  const removeFeatureBox = (idx: number) =>
    setFormData((prev) => ({ ...prev, featureBoxes: prev.featureBoxes.filter((_, i) => i !== idx) }));
  const updateFeatureBox = (idx: number, field: keyof AboutFeatureBox, val: string) =>
    setFormData((prev) => {
      const copy = [...prev.featureBoxes];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, featureBoxes: copy };
    });

  // ── Pillar handlers ──
  const addPillar = () =>
    setFormData((prev) => ({
      ...prev,
      pillars: [...prev.pillars, { title: 'New Pillar', desc: 'Describe this commitment.' }],
    }));
  const removePillar = (idx: number) =>
    setFormData((prev) => ({ ...prev, pillars: prev.pillars.filter((_, i) => i !== idx) }));
  const updatePillar = (idx: number, field: keyof AboutPillar, val: string) =>
    setFormData((prev) => {
      const copy = [...prev.pillars];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, pillars: copy };
    });

  // ── Stat handlers ──
  const addStat = () =>
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, { value: '0', label: 'New Stat' }] }));
  const removeStat = (idx: number) =>
    setFormData((prev) => ({ ...prev, stats: prev.stats.filter((_, i) => i !== idx) }));
  const updateStat = (idx: number, field: keyof AboutStat, val: string) =>
    setFormData((prev) => {
      const copy = [...prev.stats];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, stats: copy };
    });

  if (loading) {
    return (
      <div>
        <h1 className="admin-page-header__title" style={{ marginBottom: '1rem' }}>
          About Page Content
        </h1>
        <p className="admin-loading">Loading about page content…</p>
      </div>
    );
  }

  const f = formData;

  return (
    <div>
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-header__title">About Page Content</h1>
        <p className="admin-dashboard-header__sub">
          Edit every section of the public <strong>/about-us</strong> page — headings, body copy, and images.
        </p>
      </div>

      {error && <div className="admin-login__error">{error}</div>}

      <form onSubmit={handleSave} className="admin-settings-wrap">
        {/* ── Hero Banner ──────────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Hero Banner</h3>

          <div className="admin-form__group">
            <label className="admin-form__label">Eyebrow Tag</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.heroTag}
              onChange={(e) => set('heroTag', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Title</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.heroTitle}
              onChange={(e) => set('heroTitle', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Description</label>
            <textarea
              rows={3}
              className="admin-form__textarea"
              value={f.heroDesc}
              onChange={(e) => set('heroDesc', e.target.value)}
            />
          </div>

          <ImageUploader
            label="Hero Background Image"
            folder="about"
            value={f.heroImage}
            onChange={(url) => set('heroImage', url)}
          />
        </div>

        {/* ── Who We Are ───────────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">&quot;Who We Are&quot; Section</h3>

          <div className="admin-form__group">
            <label className="admin-form__label">Eyebrow Tag</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.whoTag}
              onChange={(e) => set('whoTag', e.target.value)}
            />
          </div>

          <div className="admin-form__row">
            <div>
              <label className="admin-form__label">Title — Plain Prefix</label>
              <input
                type="text"
                className="admin-form__input"
                value={f.whoTitlePrefix}
                onChange={(e) => set('whoTitlePrefix', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form__label">Title — Gold Highlight</label>
              <input
                type="text"
                className="admin-form__input"
                value={f.whoTitleHighlight}
                onChange={(e) => set('whoTitleHighlight', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Lead Description</label>
            <textarea
              rows={2}
              className="admin-form__textarea"
              value={f.whoDesc}
              onChange={(e) => set('whoDesc', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Body Paragraph 1</label>
            <textarea
              rows={3}
              className="admin-form__textarea"
              value={f.whoText1}
              onChange={(e) => set('whoText1', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Body Paragraph 2</label>
            <textarea
              rows={3}
              className="admin-form__textarea"
              value={f.whoText2}
              onChange={(e) => set('whoText2', e.target.value)}
            />
          </div>

          <ImageUploader
            label="Portrait Image"
            folder="about"
            value={f.whoImage}
            onChange={(url) => set('whoImage', url)}
          />

          {/* Feature Boxes */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="admin-form__label" style={{ margin: 0 }}>
                Feature Boxes ({f.featureBoxes.length})
              </label>
              <button type="button" className="admin-module-tool-btn" onClick={addFeatureBox}>
                <Plus size={13} />
                <span>Add Feature Box</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {f.featureBoxes.map((box, idx) => (
                <div key={idx} className="admin-module-bullet-item">
                  <div className="admin-module-bullet-item__header">
                    <span className="admin-module-bullet-item__label">Box #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFeatureBox(idx)}
                      className="admin-module-tool-btn admin-module-tool-btn--delete"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="admin-form__row">
                    <div style={{ maxWidth: '180px' }}>
                      <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Icon</label>
                      <select
                        className="admin-form__input"
                        value={box.icon}
                        onChange={(e) => updateFeatureBox(idx, 'icon', e.target.value)}
                      >
                        {ABOUT_ICON_NAMES.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Title</label>
                      <input
                        type="text"
                        className="admin-form__input"
                        value={box.title}
                        onChange={(e) => updateFeatureBox(idx, 'title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Description</label>
                    <textarea
                      rows={2}
                      className="admin-form__textarea"
                      value={box.desc}
                      onChange={(e) => updateFeatureBox(idx, 'desc', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Core Pillars ─────────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Core Pillars / Service Commitment</h3>

          <div className="admin-form__group">
            <label className="admin-form__label">Eyebrow Tag</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.pillarsTag}
              onChange={(e) => set('pillarsTag', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Title</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.pillarsTitle}
              onChange={(e) => set('pillarsTitle', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Description</label>
            <textarea
              rows={2}
              className="admin-form__textarea"
              value={f.pillarsDesc}
              onChange={(e) => set('pillarsDesc', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label className="admin-form__label" style={{ margin: 0 }}>
              Pillars ({f.pillars.length})
            </label>
            <button type="button" className="admin-module-tool-btn" onClick={addPillar}>
              <Plus size={13} />
              <span>Add Pillar</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {f.pillars.map((pillar, idx) => (
              <div key={idx} className="admin-module-bullet-item">
                <div className="admin-module-bullet-item__header">
                  <span className="admin-module-bullet-item__label">Pillar #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePillar(idx)}
                    className="admin-module-tool-btn admin-module-tool-btn--delete"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>

                <div>
                  <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Title</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={pillar.title}
                    onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Description</label>
                  <textarea
                    rows={2}
                    className="admin-form__textarea"
                    value={pillar.desc}
                    onChange={(e) => updatePillar(idx, 'desc', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats Counter ────────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Stats Counter Section</h3>

          <div className="admin-form__group">
            <label className="admin-form__label">Eyebrow Tag</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.statsTag}
              onChange={(e) => set('statsTag', e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label">Header</label>
            <input
              type="text"
              className="admin-form__input"
              value={f.statsHeader}
              onChange={(e) => set('statsHeader', e.target.value)}
            />
          </div>

          <ImageUploader
            label="Background Image"
            folder="about"
            value={f.statsImage}
            onChange={(url) => set('statsImage', url)}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <label className="admin-form__label" style={{ margin: 0 }}>
              Stats ({f.stats.length})
            </label>
            <button type="button" className="admin-module-tool-btn" onClick={addStat}>
              <Plus size={13} />
              <span>Add Stat</span>
            </button>
          </div>

          <div className="admin-form__row" style={{ flexWrap: 'wrap' }}>
            {f.stats.map((stat, idx) => (
              <div key={idx} className="admin-module-bullet-item" style={{ flex: '1 1 200px' }}>
                <div className="admin-module-bullet-item__header">
                  <span className="admin-module-bullet-item__label">Stat #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    className="admin-module-tool-btn admin-module-tool-btn--delete"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>

                <div>
                  <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Value</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                  />
                </div>

                <div>
                  <label className="admin-form__label" style={{ fontSize: '0.72rem' }}>Label</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dual CTA Cards ───────────────────── */}
        <div className="admin-settings-section">
          <h3 className="admin-settings-section__title">Dual CTA Cards</h3>

          <div className="admin-form__row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Card 1</h4>
              <div className="admin-form__group">
                <label className="admin-form__label">Eyebrow Tag</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.cta1Tag}
                  onChange={(e) => set('cta1Tag', e.target.value)}
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Title</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.cta1Title}
                  onChange={(e) => set('cta1Title', e.target.value)}
                />
              </div>
              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Button Text</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.cta1BtnText}
                    onChange={(e) => set('cta1BtnText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Button Link</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.cta1BtnLink}
                    onChange={(e) => set('cta1BtnLink', e.target.value)}
                  />
                </div>
              </div>
              <ImageUploader
                label="Background Image"
                folder="about"
                value={f.cta1Image}
                onChange={(url) => set('cta1Image', url)}
              />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Card 2</h4>
              <div className="admin-form__group">
                <label className="admin-form__label">Eyebrow Tag</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.cta2Tag}
                  onChange={(e) => set('cta2Tag', e.target.value)}
                />
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Title</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.cta2Title}
                  onChange={(e) => set('cta2Title', e.target.value)}
                />
              </div>
              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Button Text</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.cta2BtnText}
                    onChange={(e) => set('cta2BtnText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Button Link</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.cta2BtnLink}
                    onChange={(e) => set('cta2BtnLink', e.target.value)}
                  />
                </div>
              </div>
              <ImageUploader
                label="Background Image"
                folder="about"
                value={f.cta2Image}
                onChange={(url) => set('cta2Image', url)}
              />
            </div>
          </div>
        </div>

        {/* ── Save ─────────────────────────────── */}
        <div className="admin-settings__submit-row">
          <button type="submit" className="admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save About Page'}
          </button>
          {savedAt && <span className="admin-settings__saved">✓ Saved at {savedAt}</span>}
        </div>
      </form>
    </div>
  );
}
