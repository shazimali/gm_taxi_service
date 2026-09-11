'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  Search, 
  X, 
  TrendingUp, 
  ShieldCheck,
  Award
} from 'lucide-react';

interface CorporateAccountItem {
  id: string;
  name: string;
  accountCode: string;
  discountPct: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_FORM = {
  name: '',
  accountCode: '',
  discountPct: 10,
  isActive: true,
};

export default function CorporateAccountsAdminPage() {
  const [accounts, setAccounts] = useState<CorporateAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CorporateAccountItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/corporate-accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (e) {
      console.error('Failed to load corporate accounts', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Statistics
  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.isActive).length;
    const maxDiscount = total > 0 ? Math.max(...accounts.map((a) => a.discountPct)) : 0;
    const avgDiscount = total > 0 ? accounts.reduce((acc, a) => acc + a.discountPct, 0) / total : 0;

    return { total, active, maxDiscount, avgDiscount };
  }, [accounts]);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (filterStatus === 'active' && !a.isActive) return false;
      if (filterStatus === 'inactive' && a.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesCode = a.accountCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }
      return true;
    });
  }, [accounts, filterStatus, searchQuery]);

  const handleOpenModal = (a?: CorporateAccountItem) => {
    if (a) {
      setEditingAccount(a);
      setFormData({
        name: a.name,
        accountCode: a.accountCode,
        discountPct: a.discountPct,
        isActive: a.isActive,
      });
    } else {
      setEditingAccount(null);
      setFormData(DEFAULT_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingAccount ? 'PUT' : 'POST';
    const body = editingAccount ? { id: editingAccount.id, ...formData } : formData;

    try {
      const res = await fetch('/api/admin/corporate-accounts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        fetchAccounts();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save corporate account');
      }
    } catch {
      alert('Error saving corporate account');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete corporate account "${name}"? Existing completed bookings will keep their recorded discount.`)) return;
    try {
      const res = await fetch(`/api/admin/corporate-accounts?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAccounts();
    } catch {
      alert('Error deleting corporate account');
    }
  };

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Corporate &amp; Partner Accounts</h1>
          <p className="admin-page-header__desc">
            Manage corporate client accounts and partner promo codes. When a customer enters an account code at checkout, their percentage discount is calculated directly on the Step 1 trip fare.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Add Corporate Account</span>
        </button>
      </div>

      {/* ── Executive Stat Cards Grid ───────────────────── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Building2 size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.total}</div>
          <div className="admin-stat-card__label">Total Corporate Accounts</div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon-wrap"
            style={{ color: '#10b981', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.active}</div>
          <div className="admin-stat-card__label">Active &amp; Redeemable Codes</div>
        </div>

        <div className="admin-stat-card">
          <div
            className="admin-stat-card__icon-wrap"
            style={{ color: '#3b82f6', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <TrendingUp size={24} />
          </div>
          <div className="admin-stat-card__value">{stats.maxDiscount}%</div>
          <div className="admin-stat-card__label">Maximum Corporate Discount</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon-wrap">
            <Award size={24} />
          </div>
          <div className="admin-stat-card__value">
            {stats.avgDiscount ? `${stats.avgDiscount.toFixed(1)}%` : '0%'}
          </div>
          <div className="admin-stat-card__label">Average Discount Rate</div>
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
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
              placeholder="Search by company name or code..."
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

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#64748b' }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="admin-form__select"
              style={{ width: 'auto', minWidth: '140px', height: '42px', fontSize: '0.85rem' }}
            >
              <option value="all">All Accounts ({accounts.length})</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || filterStatus !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
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
          <p className="admin-loading" style={{ margin: 0 }}>Loading corporate accounts…</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
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
            <Building2 size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {accounts.length === 0 ? 'No Corporate Accounts Configured' : 'No Accounts Match Your Filter'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            {accounts.length === 0
              ? 'Create your first corporate partner account to issue discount codes for corporate clients.'
              : 'Try clearing your search query or status filter.'}
          </p>
          {accounts.length === 0 ? (
            <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
              <Plus size={18} /> Add First Account
            </button>
          ) : (
            <button
              className="admin-btn--ghost"
              onClick={() => {
                setSearchQuery('');
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
                  <th className="admin-table__th">Company / Account Name</th>
                  <th className="admin-table__th">Redemption Code</th>
                  <th className="admin-table__th" style={{ textAlign: 'center' }}>Discount Rate</th>
                  <th className="admin-table__th" style={{ textAlign: 'center' }}>Status</th>
                  <th className="admin-table__th">Created Date</th>
                  <th className="admin-table__th" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((a) => (
                  <tr key={a.id} className="admin-table__tr">
                    {/* Name */}
                    <td className="admin-table__td">
                      <div className="admin-table__td--gold" style={{ padding: 0, fontSize: '0.95rem' }}>
                        {a.name}
                      </div>
                      <div className="admin-table__td-sub">
                        ID: {a.id.substring(0, 8)}...
                      </div>
                    </td>

                    {/* Code */}
                    <td className="admin-table__td" style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          fontFamily: 'monospace',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {a.accountCode}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="admin-table__td" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Percent size={13} /> {a.discountPct}% OFF
                      </span>
                    </td>

                    {/* Status */}
                    <td className="admin-table__td" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        className={`admin-badge ${
                          a.isActive ? 'admin-badge--confirmed' : 'admin-badge--cancelled'
                        }`}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: a.isActive ? 'var(--success)' : 'var(--danger)',
                          }}
                        />
                        {a.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="admin-table__td" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="admin-table__td" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div
                        className="admin-item-card__actions"
                        style={{ justifyContent: 'flex-end', gap: '0.5rem' }}
                      >
                        <button
                          className="admin-btn--ghost"
                          onClick={() => handleOpenModal(a)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="admin-btn--danger"
                          onClick={() => handleDelete(a.id, a.name)}
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
              Showing <strong>{filteredAccounts.length}</strong> of <strong>{accounts.length}</strong> corporate account{accounts.length !== 1 ? 's' : ''}
            </span>
            <span>
              Discounts are applied exclusively to Step 1 trip fares at checkout.
            </span>
          </div>
        </div>
      )}

      {/* ── Modal Dialog ─────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal__overlay">
          <div className="admin-modal__box" style={{ maxWidth: '540px' }}>
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
                  <Building2 size={20} />
                </div>
                <h2 className="admin-modal__title" style={{ margin: 0 }}>
                  {editingAccount ? 'Edit Corporate Account' : 'New Corporate Account'}
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
              {/* Account Name */}
              <div className="admin-form__group">
                <label className="admin-form__label">Company / Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation or Fidelity Investments"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="admin-form__input"
                />
                <span className="admin-form__hint">
                  Official name of company or organization.
                </span>
              </div>

              {/* Account Code */}
              <div className="admin-form__group">
                <label className="admin-form__label">Redemption Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACME2024"
                  value={formData.accountCode}
                  onChange={(e) => setFormData((p) => ({ ...p, accountCode: e.target.value.toUpperCase() }))}
                  className="admin-form__input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, fontFamily: 'monospace' }}
                />
                <span className="admin-form__hint">
                  Code entered by passenger at checkout (case-insensitive, auto-uppercased).
                </span>
              </div>

              {/* Discount Percentage */}
              <div className="admin-form__group">
                <label className="admin-form__label">Discount Percentage (0 – 100%) *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    placeholder="10.0"
                    value={formData.discountPct}
                    onChange={(e) => setFormData((p) => ({ ...p, discountPct: parseFloat(e.target.value) || 0 }))}
                    className="admin-form__input"
                    style={{ paddingRight: '2.5rem', fontWeight: 700, fontSize: '1.05rem' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      fontWeight: 800,
                    }}
                  >
                    %
                  </span>
                </div>
                <span className="admin-form__hint">
                  Applied directly to the fare determined in Step 1.
                </span>
              </div>

              {/* Active Toggle */}
              <div className="admin-form__group" style={{ marginTop: '1.25rem' }}>
                <label
                  className="admin-form__label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    padding: '0.85rem 1rem',
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
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Account Active &amp; Redeemable</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      When unchecked, customers will not be able to apply this code at checkout.
                    </span>
                  </div>
                </label>
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
                  {editingAccount ? 'Save Account Changes' : 'Create Corporate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
