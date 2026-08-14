'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Location {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_FORM = {
  name: '',
  slug: '',
  description: '',
  displayOrder: 0,
  isActive: true,
};

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [slugManual, setSlugManual] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (res.ok) setLocations(data.locations || []);
    } catch (e) {
      console.error('Failed to load locations', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleOpenModal = (loc?: Location) => {
    if (loc) {
      setEditingLocation(loc);
      setFormData({
        name: loc.name,
        slug: loc.slug,
        description: loc.description || '',
        displayOrder: loc.displayOrder,
        isActive: loc.isActive,
      });
      setSlugManual(true);
    } else {
      setEditingLocation(null);
      setFormData(DEFAULT_FORM);
      setSlugManual(false);
    }
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: slugManual ? prev.slug : toSlug(val),
    }));
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setFormData((prev) => ({ ...prev, slug: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingLocation ? 'PUT' : 'POST';
    const body = editingLocation ? { id: editingLocation.id, ...formData } : formData;

    try {
      const res = await fetch('/api/admin/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchLocations();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save location');
      }
    } catch {
      alert('Error saving location');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchLocations();
    } catch {
      alert('Error deleting location');
    }
  };

  const set = (field: string, val: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Locations Management</h1>
          <p className="admin-page-header__desc">
            Manage service area locations displayed on the public Locations page. Add, edit, or remove location cards.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          + Add Location
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading locations…</p>
      ) : locations.length === 0 ? (
        <div className="admin-empty-state">
          No locations found. Click &quot;Add Location&quot; to create the first one.
        </div>
      ) : (
        <div className="admin-content-card">
          <table className="admin-table">
            <thead className="admin-table__head">
              <tr>
                <th className="admin-table__th">Location Name</th>
                <th className="admin-table__th">Slug</th>
                <th className="admin-table__th">Order</th>
                <th className="admin-table__th">Status</th>
                <th className="admin-table__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="admin-table__tr">
                  <td className="admin-table__td--gold">{loc.name}</td>
                  <td className="admin-table__td">
                    <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{loc.slug}</code>
                  </td>
                  <td className="admin-table__td">{loc.displayOrder}</td>
                  <td className="admin-table__td">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: loc.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                        color: loc.isActive ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      <span
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: loc.isActive ? 'var(--success)' : 'var(--text-muted)',
                        }}
                      />
                      {loc.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin-table__td">
                    <div className="admin-item-card__actions">
                      <button className="admin-btn--ghost" onClick={() => handleOpenModal(loc)}>
                        Edit
                      </button>
                      <button className="admin-btn--danger" onClick={() => handleDelete(loc.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ──────────────────────────────── */}
      {showModal && (
        <div className="admin-modal__overlay">
          <div className="admin-modal__box">
            <h2 className="admin-modal__title">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__group">
                <label className="admin-form__label">Location Name</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Limo Service in Burlington MA"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Slug (URL key)</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="limo-service-burlington-ma"
                />
                <span className="admin-form__hint">Auto-generated from name. Must be unique.</span>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Description (optional)</label>
                <textarea
                  rows={3}
                  className="admin-form__textarea"
                  value={formData.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Brief description of service in this location…"
                />
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Display Order</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={formData.displayOrder}
                    onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label
                    className="admin-form__label"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => set('isActive', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent-gold)' }}
                    />
                    Show on public page (Active)
                  </label>
                </div>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="admin-btn--cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
