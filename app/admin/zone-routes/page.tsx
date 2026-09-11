'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Map, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Car, 
  DollarSign, 
  Search, 
  X, 
  Sparkles, 
  HelpCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

interface VehicleOption {
  id: string;
  name: string;
  slug: string;
  category?: string;
  model?: string;
  rateHourly?: number | null;
}

interface ZoneRouteItem {
  id: string;
  vehicleId: string;
  vehicle?: VehicleOption;
  name: string;
  pickupKeywords: string;
  dropoffKeywords: string;
  flatRate: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

const DEFAULT_FORM = {
  vehicleId: '',
  name: '',
  pickupKeywords: '',
  dropoffKeywords: '',
  flatRate: 85,
  isActive: true,
  displayOrder: 0,
};

export default function ZoneRoutesAdminPage() {
  const [routes, setRoutes] = useState<ZoneRouteItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFleets, setLoadingFleets] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ZoneRouteItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch fleets directly from database
  const fetchFleetVehicles = useCallback(async () => {
    try {
      setLoadingFleets(true);
      const res = await fetch('/api/admin/fleet');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
          return data.vehicles as VehicleOption[];
        }
      }
    } catch (err) {
      console.warn('Failed to fetch fleet from database:', err);
    } finally {
      setLoadingFleets(false);
    }
    return [];
  }, []);

  // Fetch zone routes and fleet vehicles
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [routesRes, fleetRes] = await Promise.allSettled([
        fetch('/api/admin/zone-routes'),
        fetch('/api/admin/fleet'),
      ]);

      let loadedVehicles: VehicleOption[] = [];

      // 1. Load from fleet API (direct database fleet table)
      if (fleetRes.status === 'fulfilled' && fleetRes.value.ok) {
        const fleetData = await fleetRes.value.json();
        if (Array.isArray(fleetData.vehicles)) {
          loadedVehicles = fleetData.vehicles;
        }
      }

      // 2. Load zone routes
      if (routesRes.status === 'fulfilled' && routesRes.value.ok) {
        const routesData = await routesRes.value.json();
        setRoutes(routesData.zoneRoutes || []);
        if (loadedVehicles.length === 0 && Array.isArray(routesData.vehicles)) {
          loadedVehicles = routesData.vehicles;
        }
      }

      setVehicles(loadedVehicles);
    } catch (e) {
      console.error('Failed to load zone routes and fleet from database', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistics
  const stats = useMemo(() => {
    const total = routes.length;
    const active = routes.filter((r) => r.isActive).length;
    const distinctVehicles = new Set(routes.map((r) => r.vehicleId)).size;
    const avgRate = total > 0 ? routes.reduce((acc, r) => acc + r.flatRate, 0) / total : 0;

    return { total, active, distinctVehicles, avgRate };
  }, [routes]);

  // Filtered list
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      // Vehicle filter
      if (filterVehicle !== 'all' && r.vehicleId !== filterVehicle) return false;
      // Status filter
      if (filterStatus === 'active' && !r.isActive) return false;
      if (filterStatus === 'inactive' && r.isActive) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesVehicle = r.vehicle?.name.toLowerCase().includes(q);
        const matchesPickup = r.pickupKeywords.toLowerCase().includes(q);
        const matchesDropoff = r.dropoffKeywords.toLowerCase().includes(q);
        if (!matchesName && !matchesVehicle && !matchesPickup && !matchesDropoff) {
          return false;
        }
      }
      return true;
    });
  }, [routes, filterVehicle, filterStatus, searchQuery]);

  const handleOpenModal = async (r?: ZoneRouteItem) => {
    // Re-fetch fleets directly from database to guarantee freshest fleet list
    const freshVehicles = await fetchFleetVehicles();
    const availableVehicles = freshVehicles.length > 0 ? freshVehicles : vehicles;

    if (r) {
      setEditingRoute(r);
      setFormData({
        vehicleId: r.vehicleId,
        name: r.name,
        pickupKeywords: r.pickupKeywords,
        dropoffKeywords: r.dropoffKeywords,
        flatRate: r.flatRate,
        isActive: r.isActive,
        displayOrder: r.displayOrder,
      });
    } else {
      setEditingRoute(null);
      setFormData({
        ...DEFAULT_FORM,
        vehicleId: availableVehicles[0]?.id || '',
        displayOrder: routes.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRoute ? 'PUT' : 'POST';
    const body = editingRoute ? { id: editingRoute.id, ...formData } : formData;

    try {
      const res = await fetch('/api/admin/zone-routes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save zone corridor');
      }
    } catch {
      alert('Error saving zone corridor');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/zone-routes?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch {
      alert('Error deleting zone corridor');
    }
  };

  // Helper to render keyword pills
  const renderKeywordTags = (keywordsStr: string) => {
    const tags = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      return <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>None specified</span>;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {tags.map((tag, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Zone Flat-Rate Corridors</h1>
          <p className="admin-page-header__desc">
            Define point-to-point flat rates by vehicle tier (e.g. Logan Airport ⇄ Downtown Boston). Inside a corridor, the system bills strictly the flat rate with zero added base fee or mileage fee.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Add Zone Route</span>
        </button>
      </div>

      {/* ── Executive Stat Cards Grid ───────────────────── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Map size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.total}</div>
          <div className="admin-stat-card__label">Total Zone Corridors</div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon-wrap"
            style={{ color: '#10b981', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.active}</div>
          <div className="admin-stat-card__label">Active &amp; Matching Corridors</div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon-wrap"
            style={{ color: '#3b82f6', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <Car size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.distinctVehicles}</div>
          <div className="admin-stat-card__label">Fleet Tiers Covered</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <DollarSign size={24} />
          </div>
          <div className="admin-stat-card__value">
            ${stats.avgRate ? stats.avgRate.toFixed(0) : '0'}
          </div>
          <div className="admin-stat-card__label">Average Corridor Flat Rate</div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ──────────────────────── */}
      <div
        className="admin-content-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search corridor, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form__input"
              style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.875rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Vehicle Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748b' }}>Vehicle:</span>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="admin-form__select"
              style={{ width: 'auto', minWidth: '180px', height: '42px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="all">All Vehicle Tiers ({vehicles.length} in DB)</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.category ? `(${v.category})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748b' }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="admin-form__select"
              style={{ width: 'auto', minWidth: '130px', height: '42px', fontSize: '0.85rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters indicator if active */}
        {(searchQuery || filterVehicle !== 'all' || filterStatus !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterVehicle('all');
              setFilterStatus('all');
            }}
            className="admin-btn--ghost"
            style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>

      {/* ── Table Card ──────────────────────────────────── */}
      {loading ? (
        <div className="admin-content-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <p className="admin-loading" style={{ margin: 0 }}>Loading zone corridors…</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div
          className="admin-content-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 164, 109, 0.12)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <Map size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {routes.length === 0 ? 'No Zone Corridors Configured Yet' : 'No Corridors Match Your Filters'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            {routes.length === 0
              ? 'Zone corridors allow you to set flat rates for popular routes such as Logan Airport to Downtown Boston.'
              : 'Try clearing or modifying your filter criteria to view more corridors.'}
          </p>
          {routes.length === 0 ? (
            <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
              <Plus size={18} /> Add First Corridor
            </button>
          ) : (
            <button
              className="admin-btn--ghost"
              onClick={() => {
                setSearchQuery('');
                setFilterVehicle('all');
                setFilterStatus('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-content-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead className="admin-table__head">
                <tr>
                  <th className="admin-table__th">Vehicle Tier</th>
                  <th className="admin-table__th">Corridor Name</th>
                  <th className="admin-table__th" style={{ textAlign: 'right' }}>Flat Rate</th>
                  <th className="admin-table__th" style={{ minWidth: '220px' }}>Pickup Keywords</th>
                  <th className="admin-table__th" style={{ minWidth: '220px' }}>Dropoff Keywords</th>
                  <th className="admin-table__th" style={{ textAlign: 'center' }}>Status</th>
                  <th className="admin-table__th" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="admin-table__tr">
                    {/* Vehicle */}
                    <td className="admin-table__td" style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(197, 164, 109, 0.12)',
                            color: 'var(--accent-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Car size={16} />
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9rem' }}>
                            {r.vehicle?.name || 'All Vehicles'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {r.vehicle?.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Corridor Name */}
                    <td className="admin-table__td">
                      <div className="admin-table__td--gold" style={{ padding: 0, fontSize: '0.95rem' }}>
                        {r.name}
                      </div>
                      <div className="admin-table__td-sub">
                        Order #{r.displayOrder} • Added {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Flat Rate */}
                    <td className="admin-table__td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        ${r.flatRate.toFixed(2)}
                      </span>
                      <div style={{ fontSize: '0.725rem', color: '#10b981', fontWeight: 700 }}>
                        Flat Rate
                      </div>
                    </td>

                    {/* Pickup Keywords */}
                    <td className="admin-table__td">
                      {renderKeywordTags(r.pickupKeywords)}
                    </td>

                    {/* Dropoff Keywords */}
                    <td className="admin-table__td">
                      {renderKeywordTags(r.dropoffKeywords)}
                    </td>

                    {/* Status */}
                    <td className="admin-table__td" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        className={`admin-badge ${
                          r.isActive ? 'admin-badge--confirmed' : 'admin-badge--cancelled'
                        }`}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: r.isActive ? 'var(--success)' : 'var(--danger)',
                          }}
                        />
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="admin-table__td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div
                        className="admin-item-card__actions"
                        style={{ justifyContent: 'flex-end', gap: '0.5rem' }}
                      >
                        <button
                          className="admin-btn--ghost"
                          onClick={() => handleOpenModal(r)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="admin-btn--danger"
                          onClick={() => handleDelete(r.id, r.name)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.825rem',
              color: '#64748b',
            }}
          >
            <span>
              Showing <strong>{filteredRoutes.length}</strong> of <strong>{routes.length}</strong> corridor{routes.length !== 1 ? 's' : ''}
            </span>
            <span>
              Matches are case-insensitive and trigger on any keyword substring.
            </span>
          </div>
        </div>
      )}

      {/* ── Modal Dialog ─────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal__overlay">
          <div className="admin-modal__box" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(197, 164, 109, 0.12)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Map size={20} />
                </div>
                <h2 className="admin-modal__title" style={{ margin: 0 }}>
                  {editingRoute ? 'Edit Zone Corridor' : 'Add New Zone Corridor'}
                </h2>
              </div>
              <button
                type="button"
                className="admin-btn--ghost"
                onClick={() => setShowModal(false)}
                style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Vehicle Selection - Fetched from database */}
              <div className="admin-form__group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <label className="admin-form__label" style={{ margin: 0 }}>
                    Vehicle Fleet Tier *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {loadingFleets ? (
                      <span style={{ fontSize: '0.75rem', color: '#b8860b', fontWeight: 600 }}>
                        Fetching fleets from database…
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          color: '#15803d',
                          backgroundColor: '#dcfce7',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          fontWeight: 700,
                        }}
                      >
                        ✓ {vehicles.length} Fleets in Database
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => fetchFleetVehicles()}
                      title="Reload fleets from database"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        cursor: 'pointer',
                        padding: '2px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textDecoration: 'underline',
                      }}
                    >
                      Reload
                    </button>
                  </div>
                </div>

                {vehicles.length === 0 && !loadingFleets ? (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '10px',
                      color: '#e11d48',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>No fleet vehicles found in database.</span>
                    <button
                      type="button"
                      onClick={() => fetchFleetVehicles()}
                      className="admin-btn--ghost"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Fetch Fleets
                    </button>
                  </div>
                ) : (
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => setFormData((p) => ({ ...p, vehicleId: e.target.value }))}
                    className="admin-form__select"
                    style={{ fontWeight: 600 }}
                  >
                    <option value="">Select vehicle fleet tier...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.category ? `(${v.category})` : ''} {v.rateHourly ? `— $${v.rateHourly}/hr` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <span className="admin-form__hint">
                  Fetched directly from the database fleet table. Each fleet tier (Sedan, SUV, Escalade, Limo) has its own flat rate for this corridor.
                </span>
              </div>

              {/* Corridor Name */}
              <div className="admin-form__group">
                <label className="admin-form__label">Corridor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logan Airport ⇄ Downtown Boston"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="admin-form__input"
                />
                <span className="admin-form__hint">
                  Descriptive route corridor displayed in admin reports and fare breakdowns.
                </span>
              </div>

              {/* Flat Rate */}
              <div className="admin-form__group">
                <label className="admin-form__label">Corridor Flat Rate ($) *</label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--accent-gold)',
                      fontWeight: 800,
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="85.00"
                    value={formData.flatRate}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, flatRate: parseFloat(e.target.value) || 0 }))
                    }
                    className="admin-form__input"
                    style={{ paddingLeft: '2rem', fontWeight: 700, fontSize: '1.05rem' }}
                  />
                </div>
                <span className="admin-form__hint">
                  Exact total billed for this corridor. No base fee or mileage fee is added.
                </span>
              </div>

              {/* Pickup Keywords */}
              <div className="admin-form__group">
                <label className="admin-form__label">
                  Pickup Match Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="logan, airport, bos, terminal"
                  value={formData.pickupKeywords}
                  onChange={(e) => setFormData((p) => ({ ...p, pickupKeywords: e.target.value }))}
                  className="admin-form__input"
                />
                <span className="admin-form__hint">
                  Matches if the customer&apos;s pickup address contains ANY of these keywords (case-insensitive).
                </span>
                {formData.pickupKeywords && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderKeywordTags(formData.pickupKeywords)}
                  </div>
                )}
              </div>

              {/* Dropoff Keywords */}
              <div className="admin-form__group">
                <label className="admin-form__label">
                  Dropoff Match Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="downtown, back bay, seaport, financial district"
                  value={formData.dropoffKeywords}
                  onChange={(e) => setFormData((p) => ({ ...p, dropoffKeywords: e.target.value }))}
                  className="admin-form__input"
                />
                <span className="admin-form__hint">
                  Matches if the customer&apos;s dropoff address contains ANY of these keywords (case-insensitive).
                </span>
                {formData.dropoffKeywords && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderKeywordTags(formData.dropoffKeywords)}
                  </div>
                )}
              </div>

              {/* Display Order & Active status */}
              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Display Priority Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, displayOrder: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="admin-form__input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label
                    className="admin-form__label"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent-gold)' }}
                    />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Active &amp; Redeemable</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn--cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  {editingRoute ? 'Save Corridor Changes' : 'Create Zone Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
