'use client';

import React, { useState, useEffect } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  badge: string;
  icon: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  benefits: string[] | unknown;
  keyFeatures: string[] | unknown;
}

const DEFAULT_FORM = {
  name: '',
  slug: '',
  tagline: '',
  badge: 'Service',
  icon: '✈️',
  image: '/images/Boston-Luxury-Chauffeur.webp',
  shortDesc: '',
  fullDesc: '',
  benefits: '',    // comma-separated in form
  keyFeatures: '', // comma-separated in form
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (res.ok) setServices(data.services || []);
    } catch (e) {
      console.error('Failed to load services', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleOpenModal = (s?: ServiceItem) => {
    if (s) {
      setEditingService(s);
      setFormData({
        name: s.name,
        slug: s.slug,
        tagline: s.tagline || '',
        badge: s.badge || 'Service',
        icon: s.icon || '✈️',
        image: s.image,
        shortDesc: s.shortDesc || '',
        fullDesc: s.fullDesc || '',
        benefits: Array.isArray(s.benefits) ? (s.benefits as string[]).join(', ') : '',
        keyFeatures: Array.isArray(s.keyFeatures) ? (s.keyFeatures as string[]).join(', ') : '',
      });
    } else {
      setEditingService(null);
      setFormData(DEFAULT_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingService ? 'PUT' : 'POST';
    const body = {
      ...(editingService ? { id: editingService.id } : {}),
      ...formData,
      benefits: formData.benefits.split(',').map((b) => b.trim()).filter(Boolean),
      keyFeatures: formData.keyFeatures.split(',').map((k) => k.trim()).filter(Boolean),
    };

    try {
      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchServices();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save service');
      }
    } catch {
      alert('Error saving service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchServices();
    } catch {
      alert('Error deleting service');
    }
  };

  const f = formData;
  const set = (field: string, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Services Management</h1>
          <p className="admin-page-header__desc">
            Control service offerings, badges, descriptions, and cover images.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          + Add New Service
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading services catalog…</p>
      ) : (
        <div className="admin-grid-cards">
          {services.map((s) => (
            <div key={s.id} className="admin-item-card">
              <div className="admin-item-card__image-wrap admin-item-card__image-wrap--sm">
                <img src={s.image} alt={s.name} className="admin-item-card__image" />
                <span className="admin-item-card__badge--left">
                  {s.icon} {s.badge}
                </span>
              </div>
              <div className="admin-item-card__body">
                <h3 className="admin-item-card__title--md">{s.name}</h3>
                <p className="admin-item-card__sub--tall">{s.shortDesc || s.tagline}</p>
                <div className="admin-item-card__actions">
                  <button className="admin-btn--ghost" onClick={() => handleOpenModal(s)}>
                    Edit
                  </button>
                  <button className="admin-btn--danger" onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ──────────────────────────────── */}
      {showModal && (
        <div className="admin-modal__overlay">
          <div className="admin-modal__box">
            <h2 className="admin-modal__title">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__group">
                <label className="admin-form__label">Service Name</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={f.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editingService
                        ? prev.slug
                        : e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    }))
                  }
                />
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Badge Tag</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.badge}
                    onChange={(e) => set('badge', e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Icon Emoji</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.icon}
                    onChange={(e) => set('icon', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Tagline</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Cover Image URL</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.image}
                  onChange={(e) => set('image', e.target.value)}
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Short Description</label>
                <textarea
                  rows={2}
                  className="admin-form__textarea"
                  value={f.shortDesc}
                  onChange={(e) => set('shortDesc', e.target.value)}
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Full Description</label>
                <textarea
                  rows={4}
                  className="admin-form__textarea"
                  value={f.fullDesc}
                  onChange={(e) => set('fullDesc', e.target.value)}
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Benefits (comma-separated)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.benefits}
                  onChange={(e) => set('benefits', e.target.value)}
                  placeholder="Professional chauffeurs, Real-time tracking, 24/7 availability"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Key Features (comma-separated)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.keyFeatures}
                  onChange={(e) => set('keyFeatures', e.target.value)}
                  placeholder="Flight monitoring, Meet & greet, Flat-rate pricing"
                />
              </div>

              <div className="admin-form__actions">
                <button type="button" className="admin-btn--cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
