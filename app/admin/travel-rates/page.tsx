'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AirportTravelRate {
  id: string;
  location: string;
  distance: string;
  time: string;
  price: string | null;
  pickupZone: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_FORM = {
  location: '',
  distance: '',
  time: '',
  price: '',
  pickupZone: '',
  displayOrder: 0,
  isActive: true,
};

export default function TravelRatesAdminPage() {
  const [rates, setRates] = useState<AirportTravelRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<AirportTravelRate | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/travel-rates');
      const data = await res.json();
      if (res.ok) setRates(data.travelRates || []);
    } catch (e) {
      console.error('Failed to load travel rates', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenModal = (r?: AirportTravelRate) => {
    if (r) {
      setEditingRate(r);
      setFormData({
        location: r.location,
        distance: r.distance,
        time: r.time,
        price: r.price || '',
        pickupZone: r.pickupZone,
        displayOrder: r.displayOrder,
        isActive: r.isActive,
      });
    } else {
      setEditingRate(null);
      setFormData({
        ...DEFAULT_FORM,
        displayOrder: rates.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRate ? 'PUT' : 'POST';
    const body = editingRate ? { id: editingRate.id, ...formData } : formData;

    try {
      const res = await fetch('/api/admin/travel-rates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchRates();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save travel rate');
      }
    } catch {
      alert('Error saving travel rate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this travel route record?')) return;
    try {
      const res = await fetch(`/api/admin/travel-rates?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchRates();
    } catch {
      alert('Error deleting travel rate');
    }
  };

  const f = formData;
  const set = (field: string, val: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Travel Times &amp; Distances</h1>
          <p className="admin-page-header__desc">
            Manage Logan Airport transfer routes, estimated travel times, distances, rates, and pickup zones displayed on the homepage table.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          + Add Route
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading travel routes…</p>
      ) : rates.length === 0 ? (
        <div className="admin-empty-state">
          No travel routes found. Click &quot;Add Route&quot; to create the first one.
        </div>
      ) : (
        <div className="admin-content-card">
          <table className="admin-table">
            <thead className="admin-table__head">
              <tr>
                <th className="admin-table__th">Location</th>
                <th className="admin-table__th">Distance</th>
                <th className="admin-table__th">Avg. Time</th>
                <th className="admin-table__th">Price</th>
                <th className="admin-table__th">Pickup Zone</th>
                <th className="admin-table__th">Order</th>
                <th className="admin-table__th">Status</th>
                <th className="admin-table__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="admin-table__tr">
                  <td className="admin-table__td--gold font-medium">{r.location}</td>
                  <td className="admin-table__td">{r.distance}</td>
                  <td className="admin-table__td">{r.time}</td>
                  <td className="admin-table__td font-semibold" style={{ color: 'var(--accent-gold, #c9a84c)' }}>
                    {r.price || '—'}
                  </td>
                  <td className="admin-table__td">
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(201, 168, 76, 0.15)',
                        color: 'var(--accent-gold, #c9a84c)',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                      }}
                    >
                      {r.pickupZone}
                    </span>
                  </td>
                  <td className="admin-table__td">{r.displayOrder}</td>
                  <td className="admin-table__td">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        color: r.isActive ? '#4ade80' : 'var(--text-muted, #888)',
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: r.isActive ? '#4ade80' : '#888',
                        }}
                      />
                      {r.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin-table__td">
                    <div className="admin-item-card__actions">
                      <button className="admin-btn--ghost" onClick={() => handleOpenModal(r)}>
                        Edit
                      </button>
                      <button className="admin-btn--danger" onClick={() => handleDelete(r.id)}>
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
              {editingRate ? 'Edit Travel Route' : 'Add New Travel Route'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__group">
                <label className="admin-form__label">Pickup Location</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={f.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Arlington, MA"
                />
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Distance</label>
                  <input
                    type="text"
                    required
                    className="admin-form__input"
                    value={f.distance}
                    onChange={(e) => set('distance', e.target.value)}
                    placeholder="e.g. 11 miles"
                  />
                </div>
                <div>
                  <label className="admin-form__label">Avg. Travel Time</label>
                  <input
                    type="text"
                    required
                    className="admin-form__input"
                    value={f.time}
                    onChange={(e) => set('time', e.target.value)}
                    placeholder="e.g. 25 – 40m"
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Estimated Price / Rate</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="e.g. $75 or $85+"
                  />
                </div>
                <div>
                  <label className="admin-form__label">Pickup Zone / Meeting Point</label>
                  <input
                    type="text"
                    required
                    className="admin-form__input"
                    value={f.pickupZone}
                    onChange={(e) => set('pickupZone', e.target.value)}
                    placeholder="e.g. Meeting Point, Terminal B, Limo Stand"
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Display Order</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={f.displayOrder}
                    onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label
                    className="admin-form__label"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}
                  >
                    <input
                      type="checkbox"
                      checked={f.isActive}
                      onChange={(e) => set('isActive', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent-gold, #c9a84c)' }}
                    />
                    Show on homepage (Active)
                  </label>
                </div>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="admin-btn--cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
