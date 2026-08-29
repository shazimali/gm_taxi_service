'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Clock, LogOut, ShieldCheck, Car, Calendar, MapPin, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface BookingRecord {
  id: string;
  confirmationNumber: string;
  serviceType: string;
  vehicleSlug: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  paymentStatus: string;
  status: string;
  estimatedPrice: number;
  createdAt: string;
}

interface CardData {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export default function PassengerDashboardView({ user }: { user: UserSession }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'rides' | 'cards'>('rides');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookingsRes, cardsRes] = await Promise.all([
          fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`),
          fetch('/api/passenger/cards'),
        ]);

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setBookings(bData.bookings || []);
        }

        if (cardsRes.ok) {
          const cData = await cardsRes.json();
          setCards(cData.cards || []);
        }
      } catch (err) {
        console.error('Error loading passenger dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user.email]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '2.5rem 1rem 5rem 1rem' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          padding: '2.25rem 2.5rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
          border: '1px solid #1e293b',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.4rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
                color: '#0b0f17',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}>
                <User size={24} />
              </div>
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#c5a46d',
                  display: 'block',
                }}>
                  Passenger Portal
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, fontFamily: "'Cinzel', serif" }}>
                  Welcome, {user.name}!
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 3.6rem' }}>
              {user.email} {user.role === 'PASSENGER' && user.phone && `• ${user.phone}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/book" className="btn btn--gold" style={{ padding: '0.75rem 1.75rem', fontSize: '0.875rem' }}>
              <Car size={16} style={{ marginRight: '0.4rem' }} />
              Book New Ride
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('rides')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'rides' ? '#0f172a' : 'transparent',
              color: activeTab === 'rides' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Clock size={18} />
            <span>My Rides &amp; Orders ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'cards' ? '#0f172a' : 'transparent',
              color: activeTab === 'cards' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CreditCard size={18} />
            <span>Saved Payment Cards ({cards.length})</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading your dashboard data...
          </div>
        ) : (
          <>
            {/* Tab 1: My Rides */}
            {activeTab === 'rides' && (
              <div>
                {bookings.length === 0 ? (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <Car size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                      No Chauffeur Rides Found
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                      You haven&apos;t booked any rides with this account yet. Reserve your airport transfer or executive chauffeur today.
                    </p>
                    <Link href="/book" className="btn btn--gold" style={{ padding: '0.75rem 2rem' }}>
                      Reserve Your First Ride
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {bookings.map((booking) => {
                      const isHold = booking.paymentStatus === 'HOLD_PLACED';
                      const isCaptured = booking.paymentStatus === 'CAPTURED';
                      const isCancelled = booking.paymentStatus === 'CANCELLED_RELEASED' || booking.status === 'CANCELLED';

                      return (
                        <div
                          key={booking.id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            padding: '1.75rem',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Ref: {booking.confirmationNumber}
                              </span>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                                {booking.serviceType}
                              </h3>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isHold && (
                                <span style={{ backgroundColor: 'rgba(184, 134, 11, 0.12)', color: '#b8860b', border: '1px solid #b8860b', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                  🔒 Hold Placed (Pre-Authorized)
                                </span>
                              )}
                              {isCaptured && (
                                <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <CheckCircle2 size={14} /> Completed &amp; Paid
                                </span>
                              )}
                              {isCancelled && (
                                <span style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                  ❌ Cancelled / Released
                                </span>
                              )}
                              {!isHold && !isCaptured && !isCancelled && (
                                <span style={{ backgroundColor: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                  ⏳ Booking Received
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.875rem' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Pickup Location</span>
                              <strong style={{ color: '#0f172a' }}>{booking.pickupLocation}</strong>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Destination</span>
                              <strong style={{ color: '#0f172a' }}>{booking.dropoffLocation || 'City Centre'}</strong>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Date &amp; Time</span>
                              <strong style={{ color: '#0f172a' }}>{booking.pickupDate} at {booking.pickupTime}</strong>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Estimated Fare</span>
                              <strong style={{ color: '#b8860b', fontSize: '1.1rem', fontWeight: 800 }}>${booking.estimatedPrice ? booking.estimatedPrice.toFixed(2) : '127.50'}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Saved Cards */}
            {activeTab === 'cards' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Stripe Customer Vault Cards
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Saved cards are securely stored via Stripe Vault for 1-click booking pre-authorizations
                    </p>
                  </div>
                </div>

                {cards.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <CreditCard size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      No Saved Payment Methods
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                      When you make a reservation on `/book`, you can securely save your card in your account.
                    </p>
                    <Link href="/book" className="btn btn--gold" style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}>
                      Book Ride &amp; Save Card
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid #1e293b',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c5a46d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {card.brand}
                          </span>
                          <ShieldCheck size={20} style={{ color: '#c5a46d' }} />
                        </div>

                        <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '1.25rem' }}>
                          •••• •••• •••• {card.last4}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <span>EXPIRES</span>
                          <strong style={{ color: '#ffffff' }}>{card.expMonth}/{card.expYear}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
