'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  category: string;
  model: string;
  tagline: string;
  image: string;
  passengerCapacity: number;
  luggageCapacity: number;
  rateHourly: number | null;
  description: string;
  features: string[] | unknown;
  amenities: string[] | unknown;
  ctaType: string;
}

const DEFAULT_FORM = {
  name: '',
  slug: '',
  category: 'Sedan',
  model: '',
  tagline: '',
  image: '/images/blc89.webp',
  passengerCapacity: 4,
  luggageCapacity: 3,
  rateHourly: 100,
  description: '',
  features: '',   // comma-separated in the form
  amenities: '',  // comma-separated in the form
  ctaType: 'both',
};

export default function FleetAdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/admin/fleet');
      const data = await res.json();
      if (res.ok) setVehicles(data.vehicles || []);
    } catch (e) {
      console.error('Failed to load vehicles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleOpenModal = (v?: Vehicle) => {
    if (v) {
      setEditingVehicle(v);
      setFormData({
        name: v.name,
        slug: v.slug,
        category: v.category,
        model: v.model,
        tagline: v.tagline || '',
        image: v.image,
        passengerCapacity: v.passengerCapacity,
        luggageCapacity: v.luggageCapacity,
        rateHourly: v.rateHourly ?? 100,
        description: v.description || '',
        features: Array.isArray(v.features) ? (v.features as string[]).join(', ') : '',
        amenities: Array.isArray(v.amenities) ? (v.amenities as string[]).join(', ') : '',
        ctaType: v.ctaType || 'both',
      });
    } else {
      setEditingVehicle(null);
      setFormData(DEFAULT_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingVehicle ? 'PUT' : 'POST';
    const body = {
      ...(editingVehicle ? { id: editingVehicle.id } : {}),
      ...formData,
      features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      const res = await fetch('/api/admin/fleet', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchVehicles();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save vehicle');
      }
    } catch {
      alert('Error saving vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await fetch(`/api/admin/fleet?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchVehicles();
    } catch {
      alert('Error deleting vehicle');
    }
  };

  const f = formData;
  const set = (field: string, val: unknown) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Fleet Management</h1>
          <p className="admin-page-header__desc">
            Control vehicle details, capacities, hourly rates, and features.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          + Add New Vehicle
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading fleet catalog…</p>
      ) : (
        <div className="admin-grid-cards">
          {vehicles.map((v) => (
            <div key={v.id} className="admin-item-card">
              <div className="admin-item-card__image-wrap">
                <img src={v.image} alt={v.name} className="admin-item-card__image" />
                <span className="admin-item-card__badge">{v.category}</span>
              </div>
              <div className="admin-item-card__body">
                <h3 className="admin-item-card__title">{v.name}</h3>
                <p className="admin-item-card__sub">{v.model}</p>
                <div className="admin-item-card__meta">
                  <span>👤 {v.passengerCapacity} Pax</span>
                  <span>🧳 {v.luggageCapacity} Bags</span>
                  {v.rateHourly && (
                    <span className="admin-item-card__meta-rate">${v.rateHourly}/hr</span>
                  )}
                </div>
                <div className="admin-item-card__actions">
                  <button className="admin-btn--ghost" onClick={() => handleOpenModal(v)}>
                    Edit
                  </button>
                  <button className="admin-btn--danger" onClick={() => handleDelete(v.id)}>
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
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__group">
                <label className="admin-form__label">Vehicle Name</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={f.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: editingVehicle
                        ? prev.slug
                        : e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    }))
                  }
                />
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Category</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.category}
                    onChange={(e) => set('category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Model</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.model}
                    onChange={(e) => set('model', e.target.value)}
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

              <ImageUploader
                label="Vehicle Image"
                folder="fleet"
                value={f.image}
                onChange={(url) => set('image', url)}
              />

              <div className="admin-form__row--3">
                <div>
                  <label className="admin-form__label">Passengers</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={f.passengerCapacity}
                    onChange={(e) => set('passengerCapacity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Luggage</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={f.luggageCapacity}
                    onChange={(e) => set('luggageCapacity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={f.rateHourly}
                    onChange={(e) => set('rateHourly', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">CTA Type</label>
                <select
                  className="admin-form__select"
                  value={f.ctaType}
                  onChange={(e) => set('ctaType', e.target.value)}
                >
                  <option value="both">Both (Book & Quote)</option>
                  <option value="book">Book Only</option>
                  <option value="quote">Quote Only</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Features (comma-separated)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.features}
                  onChange={(e) => set('features', e.target.value)}
                  placeholder="Leather Interior, Wi-Fi, Climate Control"
                />
                <span className="admin-form__hint">Displayed as bullet points on the fleet page</span>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  value={f.amenities}
                  onChange={(e) => set('amenities', e.target.value)}
                  placeholder="USB-C Ports, Bottled Water, Privacy Glass"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Description</label>
                <textarea
                  rows={4}
                  className="admin-form__textarea"
                  value={f.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              <div className="admin-form__actions">
                <button type="button" className="admin-btn--cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
