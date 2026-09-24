'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  bracketRangeLabel,
  computeTieredFare,
  parseMileBrackets,
  validateMileBrackets,
  type MileBracket,
} from '@/lib/pricing/mileBrackets';

/** Editable bracket row; strings so inputs can be temporarily empty. */
interface BracketRow {
  upToMiles: string; // ignored for the last (open-ended) row
  ratePerMile: string;
}

const toNumberOrNaN = (v: string) => (v.trim() === '' ? NaN : Number(v));

/** Converts form rows to brackets. The last row is always open-ended. */
function rowsToBrackets(rows: BracketRow[]): MileBracket[] {
  return rows.map((r, i) => ({
    upToMiles: i === rows.length - 1 ? null : toNumberOrNaN(r.upToMiles),
    ratePerMile: toNumberOrNaN(r.ratePerMile),
  }));
}

function bracketsToRows(raw: unknown, fallbackRate: number): BracketRow[] {
  const brackets = parseMileBrackets(raw);
  if (brackets.length === 0) return [{ upToMiles: '', ratePerMile: String(fallbackRate) }];
  return brackets.map((b) => ({
    upToMiles: b.upToMiles === null ? '' : String(b.upToMiles),
    ratePerMile: String(b.ratePerMile),
  }));
}

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
  baseFare: number | null;
  baseMiles: number | null;
  perMileRate: number | null;
  mileBrackets: string | null; // JSON-serialised MileBracket[]
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
  baseFare: 65,
  baseMiles: 10,
  perMileRate: 4,
  mileBrackets: [{ upToMiles: '', ratePerMile: '4' }] as BracketRow[],
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
  const [previewMiles, setPreviewMiles] = useState('100');

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
        baseFare: v.baseFare ?? 65,
        baseMiles: v.baseMiles ?? 10,
        perMileRate: v.perMileRate ?? 4,
        mileBrackets: bracketsToRows(v.mileBrackets, v.perMileRate ?? 4),
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
    if (bracketError) return;
    const method = editingVehicle ? 'PUT' : 'POST';
    const brackets = rowsToBrackets(formData.mileBrackets);
    const body = {
      ...(editingVehicle ? { id: editingVehicle.id } : {}),
      ...formData,
      mileBrackets: brackets,
      // Keep the legacy single rate in sync with the open-ended bracket.
      perMileRate: brackets[brackets.length - 1].ratePerMile,
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

  // ── Mile brackets ──────────────────────────
  const rows = f.mileBrackets;
  const currentBrackets = rowsToBrackets(rows);
  const bracketError = validateMileBrackets(currentBrackets, f.baseMiles);
  const bracketStarts = currentBrackets.map((_, i) =>
    i === 0 ? f.baseMiles : currentBrackets[i - 1].upToMiles ?? NaN
  );
  const preview =
    !bracketError && Number(previewMiles) >= 0
      ? computeTieredFare(Number(previewMiles), f.baseFare, f.baseMiles, currentBrackets)
      : null;

  const updateRow = (index: number, field: keyof BracketRow, value: string) =>
    set(
      'mileBrackets',
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  const addRow = () =>
    set('mileBrackets', [
      ...rows.slice(0, -1),
      { upToMiles: '', ratePerMile: '' },
      rows[rows.length - 1],
    ]);
  const removeRow = (index: number) =>
    set('mileBrackets', rows.filter((_, i) => i !== index));

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

              {/* Pricing Engine Calculation Parameters */}
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pricing Engine Parameters
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Trips up to Base Miles cost the Base Fare. Miles beyond that are charged bracket by
                  bracket: each bracket&apos;s rate applies only to the miles inside it. The last bracket
                  covers every mile above the previous one.
                </div>
                <div className="admin-form__row">
                  <div>
                    <label className="admin-form__label">Base Fare ($)</label>
                    <input
                      type="number"
                      className="admin-form__input"
                      value={f.baseFare}
                      onChange={(e) => set('baseFare', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="admin-form__label">Base Miles</label>
                    <input
                      type="number"
                      className="admin-form__input"
                      value={f.baseMiles}
                      onChange={(e) => set('baseMiles', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <label className="admin-form__label" style={{ marginTop: '0.75rem' }}>
                  Mile Brackets
                </label>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.25rem' }}>From (mi)</th>
                      <th style={{ padding: '0.25rem' }}>To (mi)</th>
                      <th style={{ padding: '0.25rem' }}>Rate ($/mi)</th>
                      <th style={{ padding: '0.25rem', width: '1%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const isLast = i === rows.length - 1;
                      const start = bracketStarts[i];
                      return (
                        <tr key={i}>
                          <td style={{ padding: '0.25rem', color: '#334155', whiteSpace: 'nowrap' }}>
                            {Number.isFinite(start)
                              ? Number.isInteger(start) ? start + 1 : start
                              : '—'}
                          </td>
                          <td style={{ padding: '0.25rem' }}>
                            {isLast ? (
                              <span style={{ color: '#64748b' }}>and above</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                step="any"
                                className="admin-form__input"
                                value={row.upToMiles}
                                onChange={(e) => updateRow(i, 'upToMiles', e.target.value)}
                              />
                            )}
                          </td>
                          <td style={{ padding: '0.25rem' }}>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="admin-form__input"
                              value={row.ratePerMile}
                              onChange={(e) => updateRow(i, 'ratePerMile', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '0.25rem' }}>
                            {!isLast && (
                              <button
                                type="button"
                                className="admin-btn--danger"
                                onClick={() => removeRow(i)}
                                aria-label={`Remove bracket ${i + 1}`}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="admin-btn--ghost"
                  style={{ marginTop: '0.5rem' }}
                  onClick={addRow}
                >
                  + Add bracket
                </button>
                {bracketError && (
                  <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {bracketError}
                  </div>
                )}

                {/* Fare preview */}
                <div
                  style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: '0.8rem',
                    color: '#334155',
                  }}
                >
                  <label className="admin-form__label">Fare preview for trip distance (mi)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="admin-form__input"
                    style={{ maxWidth: '10rem' }}
                    value={previewMiles}
                    onChange={(e) => setPreviewMiles(e.target.value)}
                  />
                  {preview && (
                    <div style={{ marginTop: '0.5rem', lineHeight: 1.6 }}>
                      <div>
                        Base fare (up to {f.baseMiles} mi): ${f.baseFare.toFixed(2)}
                      </div>
                      {preview.breakdown.map((line, i) => (
                        <div key={i}>
                          {bracketRangeLabel(line.from, line.to)}: {line.miles} mi × $
                          {line.rate.toFixed(2)} = ${line.amount.toFixed(2)}
                        </div>
                      ))}
                      <div style={{ fontWeight: 800, color: '#1e293b' }}>
                        Total fare: ${preview.total.toFixed(2)}
                      </div>
                    </div>
                  )}
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
                <button type="submit" className="admin-btn--save" disabled={!!bracketError}>
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
