'use client';

import React, { useState, useEffect } from 'react';

interface Airport {
  id: string;
  code: string;
  name: string;
  description: string;
  sedanEstimate: string | null;
  suvEstimate: string | null;
  displayOrder: number;
  createdAt: string;
}

const DEFAULT_FORM = {
  code: '',
  name: '',
  description: '',
  sedanEstimate: '',
  suvEstimate: '',
  displayOrder: 0,
};

export default function AirportsAdminPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchAirports = async () => {
    try {
      const res = await fetch('/api/admin/airports');
      const data = await res.json();
      if (res.ok) setAirports(data.airports || []);
    } catch (e) {
      console.error('Failed to load airports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAirports(); }, []);

  const handleOpenModal = (a?: Airport) => {
    if (a) {
      setEditingAirport(a);
      setFormData({
        code: a.code,
        name: a.name,
        description: a.description || '',
        sedanEstimate: a.sedanEstimate || '',
        suvEstimate: a.suvEstimate || '',
        displayOrder: a.displayOrder,
      });
    } else {
      setEditingAirport(null);
      setFormData(DEFAULT_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAirport ? 'PUT' : 'POST';
    const body = editingAirport ? { id: editingAirport.id, ...formData } : formData;

    try {
      const res = await fetch('/api/admin/airports', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchAirports();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save airport');
      }
    } catch {
      alert('Error saving airport');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this airport record?')) return;
    try {
      const res = await fetch(`/api/admin/airports?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAirports();
    } catch {
      alert('Error deleting airport');
    }
  };

  const f = formData;
  const set = (field: string, val: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Airports Management</h1>
          <p className="admin-page-header__desc">
            Manage airport records, descriptions, and pricing estimates shown on the public website.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          + Add Airport
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading airport records…</p>
      ) : airports.length === 0 ? (
        <div className="admin-empty-state">
          No airports found. Click &quot;Add Airport&quot; to create the first one.
        </div>
      ) : (
        <div className="admin-content-card">
          <table className="admin-table">
            <thead className="admin-table__head">
              <tr>
                <th className="admin-table__th">Code</th>
                <th className="admin-table__th">Airport Name</th>
                <th className="admin-table__th">Sedan Est.</th>
                <th className="admin-table__th">SUV Est.</th>
                <th className="admin-table__th">Order</th>
                <th className="admin-table__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {airports.map((a) => (
                <tr key={a.id} className="admin-table__tr">
                  <td className="admin-table__td--gold">{a.code}</td>
                  <td className="admin-table__td">
                    <div>{a.name}</div>
                    {a.description && (
                      <div className="admin-table__td-sub">
                        {a.description.length > 80
                          ? `${a.description.slice(0, 80)}…`
                          : a.description}
                      </div>
                    )}
                  </td>
                  <td className="admin-table__td">{a.sedanEstimate || '—'}</td>
                  <td className="admin-table__td">{a.suvEstimate || '—'}</td>
                  <td className="admin-table__td">{a.displayOrder}</td>
                  <td className="admin-table__td">
                    <div className="admin-item-card__actions">
                      <button className="admin-btn--ghost" onClick={() => handleOpenModal(a)}>
                        Edit
                      </button>
                      <button className="admin-btn--danger" onClick={() => handleDelete(a.id)}>
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
              {editingAirport ? 'Edit Airport' : 'Add New Airport'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">IATA Code</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    className="admin-form__input"
                    value={f.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    placeholder="BOS"
                  />
                </div>
                <div>
                  <label className="admin-form__label">Display Order</label>
                  <input
                    type="number"
                    className="admin-form__input"
                    value={f.displayOrder}
                    onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Airport Name</label>
                <input
                  type="text"
                  required
                  className="admin-form__input"
                  value={f.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Logan International Airport"
                />
              </div>

              <div className="admin-form__group">
                <label className="admin-form__label">Description</label>
                <textarea
                  rows={3}
                  className="admin-form__textarea"
                  value={f.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Brief description shown on the airports/pricing page…"
                />
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Sedan Estimate</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.sedanEstimate}
                    onChange={(e) => set('sedanEstimate', e.target.value)}
                    placeholder="$85–$110"
                  />
                </div>
                <div>
                  <label className="admin-form__label">SUV Estimate</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    value={f.suvEstimate}
                    onChange={(e) => set('suvEstimate', e.target.value)}
                    placeholder="$120–$150"
                  />
                </div>
              </div>

              <div className="admin-form__actions">
                <button type="button" className="admin-btn--cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Airport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
