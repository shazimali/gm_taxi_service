'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle,
} from 'lucide-react';

export interface ServiceBullet {
  title: string;
  description: string;
}

export interface ServiceModule {
  id: string;
  heading: string;
  image: string;
  imagePosition: 'left' | 'right';
  bullets: ServiceBullet[];
}

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
  displayOrder?: number;
  benefits: string[] | unknown;
  keyFeatures: string[] | unknown;
  modules?: ServiceModule[];
}

const createDefaultModules = (serviceName = 'Our Service'): ServiceModule[] => [
  {
    id: 'mod-' + Math.random().toString(36).substr(2, 9),
    heading: `Why Choose GM Limo Services for ${serviceName}?`,
    image: '/images/Boston-Luxury-Chauffeur.webp',
    imagePosition: 'left',
    bullets: [
      {
        title: 'Luxury Fleet Options',
        description:
          'From sleek sedans to executive SUVs, we offer a diverse fleet to suit individual executives or large corporate groups.',
      },
      {
        title: 'Experienced Chauffeurs',
        description:
          'Our drivers are trained to deliver discreet, professional, and reliable service for every client.',
      },
      {
        title: 'Tailored Business Solutions',
        description:
          'We design transportation plans to fit the specific needs of your company, whether daily, weekly, or event-based.',
      },
    ],
  },
  {
    id: 'mod-' + Math.random().toString(36).substr(2, 9),
    heading: `Benefits of Traveling With GM Limo Services`,
    image: '/images/Event-Transportation-e1763052056749.webp',
    imagePosition: 'right',
    bullets: [
      {
        title: 'Professional Image',
        description:
          'Arriving in a luxury vehicle enhances your credibility and sets the right tone for business meetings.',
      },
      {
        title: 'Stress-Free Transportation',
        description:
          'With our skilled chauffeurs and efficient planning, you can focus on work while we handle the roads.',
      },
      {
        title: 'Time Efficiency',
        description:
          'We provide punctual, reliable transportation so you never waste valuable time waiting or navigating traffic.',
      },
    ],
  },
];

const DEFAULT_FORM = {
  name: '',
  slug: '',
  tagline: '',
  badge: 'Service',
  icon: '🚘',
  image: '/images/Boston-Luxury-Chauffeur.webp',
  shortDesc: '',
  displayOrder: 0,
  benefits: '',
  keyFeatures: '',
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [modules, setModules] = useState<ServiceModule[]>([]);
  const [isCustomSlug, setIsCustomSlug] = useState(false);

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

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (s?: ServiceItem) => {
    if (s) {
      setEditingService(s);
      setIsCustomSlug(true);
      setFormData({
        name: s.name,
        slug: s.slug,
        tagline: s.tagline || '',
        badge: s.badge || 'Service',
        icon: s.icon || '🚘',
        image: s.image || '/images/Boston-Luxury-Chauffeur.webp',
        shortDesc: s.shortDesc || '',
        displayOrder: s.displayOrder || 0,
        benefits: Array.isArray(s.benefits) ? (s.benefits as string[]).join(', ') : '',
        keyFeatures: Array.isArray(s.keyFeatures) ? (s.keyFeatures as string[]).join(', ') : '',
      });

      // Parse modules from fullDesc if stored as JSON
      let parsedModules: ServiceModule[] = [];
      if (s.fullDesc && s.fullDesc.trim().startsWith('[')) {
        try {
          parsedModules = JSON.parse(s.fullDesc);
        } catch {
          parsedModules = [];
        }
      }

      if (parsedModules.length > 0) {
        setModules(parsedModules);
      } else {
        setModules(createDefaultModules(s.name));
      }
    } else {
      setEditingService(null);
      setIsCustomSlug(false);
      setFormData({
        ...DEFAULT_FORM,
        displayOrder: services.length + 1,
      });
      setModules(createDefaultModules('Your Service'));
    }
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name };
      if (!isCustomSlug && !editingService) {
        updated.slug = name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      return updated;
    });
  };

  // ── Module Handlers ──
  const handleAddModule = () => {
    const newMod: ServiceModule = {
      id: 'mod-' + Math.random().toString(36).substr(2, 9),
      heading: `Section Heading`,
      image: '/images/Boston-Luxury-Chauffeur.webp',
      imagePosition: modules.length % 2 === 0 ? 'left' : 'right',
      bullets: [
        {
          title: 'Feature Title',
          description: 'Detailed description explaining this feature and benefit to the passenger.',
        },
      ],
    };
    setModules((prev) => [...prev, newMod]);
  };

  const handleRemoveModule = (modIdx: number) => {
    setModules((prev) => prev.filter((_, idx) => idx !== modIdx));
  };

  const handleMoveModule = (modIdx: number, direction: 'up' | 'down') => {
    setModules((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? modIdx - 1 : modIdx + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const [moved] = copy.splice(modIdx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const handleUpdateModule = (modIdx: number, field: keyof ServiceModule, value: any) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[modIdx] = { ...copy[modIdx], [field]: value };
      return copy;
    });
  };

  const handleAddBullet = (modIdx: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[modIdx].bullets = [
        ...copy[modIdx].bullets,
        { title: 'New Option', description: 'Enter bullet details here...' },
      ];
      return copy;
    });
  };

  const handleRemoveBullet = (modIdx: number, bulletIdx: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[modIdx].bullets = copy[modIdx].bullets.filter((_, idx) => idx !== bulletIdx);
      return copy;
    });
  };

  const handleUpdateBullet = (
    modIdx: number,
    bulletIdx: number,
    field: keyof ServiceBullet,
    val: string
  ) => {
    setModules((prev) => {
      const copy = [...prev];
      const modBullets = [...copy[modIdx].bullets];
      modBullets[bulletIdx] = { ...modBullets[bulletIdx], [field]: val };
      copy[modIdx].bullets = modBullets;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingService ? 'PUT' : 'POST';
    const body = {
      ...(editingService ? { id: editingService.id } : {}),
      ...formData,
      fullDetails: JSON.stringify(modules),
      modules,
      benefits: formData.benefits
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
      keyFeatures: formData.keyFeatures
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
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
  const set = (field: string, val: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Services Management</h1>
          <p className="admin-page-header__desc">
            Manage executive chauffeur services, customize multi-bullet content modules with images &amp; headings, and configure URL slugs.
          </p>
        </div>
        <button className="admin-btn--primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Loading services catalog…</p>
      ) : services.length === 0 ? (
        <div className="admin-empty-state">
          No services found. Click &quot;Add New Service&quot; to create your first service.
        </div>
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

                <div style={{ marginBottom: '0.6rem' }}>
                  <a
                    href={`/services/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                      color: 'var(--accent-gold, #c5a46d)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>/services/{s.slug}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <p className="admin-item-card__sub--tall">
                  {s.shortDesc || s.tagline || 'Custom luxury transfer and chauffeur service.'}
                </p>

                <div className="admin-item-card__actions">
                  <button className="admin-btn--ghost" onClick={() => handleOpenModal(s)}>
                    <Edit2 size={14} />
                    <span>Edit Modules</span>
                  </button>
                  <button className="admin-btn--danger" onClick={() => handleDelete(s.id)}>
                    <Trash2 size={14} />
                    <span>Delete</span>
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
          <div
            className="admin-modal__box"
            style={{ maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto' }}
          >
            <h2 className="admin-modal__title">
              {editingService ? `Edit Service: ${editingService.name}` : 'Add New Service'}
            </h2>

            <form onSubmit={handleSave}>
              <div className="admin-form__row">
                <div style={{ flex: 1.2 }}>
                  <label className="admin-form__label">Service Name</label>
                  <input
                    type="text"
                    required
                    className="admin-form__input"
                    placeholder="e.g. Corporate Travel"
                    value={f.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="admin-form__label">Unique Page Slug (URL)</label>
                  <input
                    type="text"
                    required
                    className="admin-form__input"
                    placeholder="e.g. corporate-travel"
                    value={f.slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                    }}
                  />
                  <span
                    className="admin-form__hint"
                    style={{ fontSize: '0.72rem', color: '#64748b' }}
                  >
                    Live URL: <code>/services/{f.slug || 'slug'}</code>
                  </span>
                </div>
              </div>

              <div className="admin-form__row">
                <div>
                  <label className="admin-form__label">Badge / Pill Tag</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="e.g. Executive Chauffeur"
                    value={f.badge}
                    onChange={(e) => set('badge', e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-form__label">Display Icon / Emoji</label>
                  <input
                    type="text"
                    className="admin-form__input"
                    placeholder="e.g. 🚘 or ✈️"
                    value={f.icon}
                    onChange={(e) => set('icon', e.target.value)}
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
                <label className="admin-form__label">Tagline (Hero Subtitle)</label>
                <input
                  type="text"
                  className="admin-form__input"
                  placeholder="e.g. Setting the standard for luxury executive transport across New England."
                  value={f.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                />
              </div>

              <ImageUploader
                label="Service Header / Hero Background Image"
                folder="services"
                value={f.image}
                onChange={(url) => set('image', url)}
              />

              <div className="admin-form__group">
                <label className="admin-form__label">
                  Short Summary (Used in cards &amp; meta description)
                </label>
                <textarea
                  rows={2}
                  className="admin-form__textarea"
                  placeholder="Brief 1-2 sentence overview shown in service catalog cards…"
                  value={f.shortDesc}
                  onChange={(e) => set('shortDesc', e.target.value)}
                />
              </div>

              {/* ── Dynamic Content Modules Builder ─────── */}
              <div className="admin-module-builder">
                <div className="admin-module-builder__top">
                  <div className="admin-module-builder__title">
                    <Layers size={20} color="#b8860b" />
                    <span>Content Modules ({modules.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="admin-btn--primary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    <Plus size={15} />
                    <span>Add Content Module</span>
                  </button>
                </div>

                {modules.length === 0 ? (
                  <div
                    style={{
                      padding: '2rem',
                      textAlign: 'center',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1.5px dashed #cbd5e1',
                    }}
                  >
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      No content modules added yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="admin-btn--primary"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <Plus size={14} />
                      <span>Add First Module</span>
                    </button>
                  </div>
                ) : (
                  modules.map((mod, modIdx) => (
                    <div key={mod.id || modIdx} className="admin-module-card">
                      {/* Module Card Top Bar */}
                      <div className="admin-module-card__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span className="admin-module-card__tag">Module #{modIdx + 1}</span>
                          <span
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#1e293b',
                              maxWidth: '320px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {mod.heading || 'Untitled Module'}
                          </span>
                        </div>

                        <div className="admin-module-card__tools">
                          <button
                            type="button"
                            className="admin-module-tool-btn"
                            disabled={modIdx === 0}
                            onClick={() => handleMoveModule(modIdx, 'up')}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-module-tool-btn"
                            disabled={modIdx === modules.length - 1}
                            onClick={() => handleMoveModule(modIdx, 'down')}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-module-tool-btn admin-module-tool-btn--delete"
                            onClick={() => handleRemoveModule(modIdx)}
                            title="Delete Module"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Module Heading */}
                      <div>
                        <label className="admin-form__label">
                          Module Heading / Section Title
                        </label>
                        <input
                          type="text"
                          required
                          className="admin-form__input"
                          placeholder="e.g. Why Choose GM Limo Services for Corporate Travel?"
                          value={mod.heading}
                          onChange={(e) =>
                            handleUpdateModule(modIdx, 'heading', e.target.value)
                          }
                        />
                      </div>

                      {/* Image Upload & Layout Selection */}
                      <div className="admin-form__row" style={{ alignItems: 'flex-start' }}>
                        <div style={{ flex: 1.6 }}>
                          <ImageUploader
                            label="Module Image"
                            folder="services"
                            value={mod.image}
                            onChange={(url) =>
                              handleUpdateModule(modIdx, 'image', url)
                            }
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label className="admin-form__label">Image Layout Position</label>
                          <select
                            className="admin-form__input"
                            value={mod.imagePosition}
                            onChange={(e) =>
                              handleUpdateModule(
                                modIdx,
                                'imagePosition',
                                e.target.value as 'left' | 'right'
                              )
                            }
                          >
                            <option value="left">Image on Left (Content Right)</option>
                            <option value="right">Image on Right (Content Left)</option>
                          </select>
                          <span
                            className="admin-form__hint"
                            style={{ fontSize: '0.72rem', color: '#64748b' }}
                          >
                            Controls which side the image appears on desktop view.
                          </span>
                        </div>
                      </div>

                      {/* Bullets List */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.65rem',
                          }}
                        >
                          <label
                            className="admin-form__label"
                            style={{
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <CheckCircle size={15} color="#b8860b" />
                            <span>Bullet Points ({mod.bullets?.length || 0})</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleAddBullet(modIdx)}
                            className="admin-module-tool-btn"
                            style={{
                              color: '#b8860b',
                              borderColor: 'rgba(184, 134, 11, 0.3)',
                              backgroundColor: 'rgba(184, 134, 11, 0.06)',
                            }}
                          >
                            <Plus size={13} />
                            <span>Add Bullet Item</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {mod.bullets?.map((bullet, bIdx) => (
                            <div key={bIdx} className="admin-module-bullet-item">
                              <div className="admin-module-bullet-item__header">
                                <span className="admin-module-bullet-item__label">
                                  Bullet #{bIdx + 1}
                                </span>
                                {mod.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBullet(modIdx, bIdx)}
                                    className="admin-module-tool-btn admin-module-tool-btn--delete"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                                  >
                                    <Trash2 size={12} />
                                    <span>Delete Bullet</span>
                                  </button>
                                )}
                              </div>

                              <div>
                                <label
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    display: 'block',
                                    marginBottom: '0.2rem',
                                  }}
                                >
                                  Bullet Title / Heading (Bold)
                                </label>
                                <input
                                  type="text"
                                  className="admin-form__input"
                                  placeholder="e.g. Luxury Fleet Options"
                                  value={bullet.title}
                                  onChange={(e) =>
                                    handleUpdateBullet(
                                      modIdx,
                                      bIdx,
                                      'title',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    display: 'block',
                                    marginBottom: '0.2rem',
                                  }}
                                >
                                  Bullet Detail Description
                                </label>
                                <textarea
                                  rows={2}
                                  className="admin-form__textarea"
                                  placeholder="e.g. From sleek sedans to executive SUVs, we offer a diverse fleet..."
                                  value={bullet.description}
                                  onChange={(e) =>
                                    handleUpdateBullet(
                                      modIdx,
                                      bIdx,
                                      'description',
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-form__actions">
                <button
                  type="button"
                  className="admin-btn--cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save">
                  Save Service &amp; Modules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
