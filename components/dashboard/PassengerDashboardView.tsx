'use client';

// ── PassengerDashboardView: Orchestrator (S — Single Responsibility) ────────────
// Responsibility: compose sub-components and manage tab/navigation state only.
// Data fetching → usePassengerDashboard hook
// Booking rendering → BookingCard
// Card rendering → SavedCardItem

import { UserSession } from '@/lib/auth';
import { Car, Clock, CreditCard, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookingCard } from './BookingCard';
import { SavedCardItem } from './SavedCardItem';
import { usePassengerDashboard } from './usePassengerDashboard';

// ── Tab definition (O — Open/Closed) ──────────────────────────────────────────
// To add a new tab, add an entry here — no other code changes needed.
type TabId = 'rides' | 'cards';

interface Tab {
  id: TabId;
  label: (count: number) => string;
  icon: React.ReactNode;
}

export default function PassengerDashboardView({ user }: { user: UserSession }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('rides');
  const { bookings, cards, loading } = usePassengerDashboard(user.email);

  const tabs: Tab[] = [
    { id: 'rides', label: (n) => `My Rides & Orders (${n})`, icon: <Clock size={18} /> },
    { id: 'cards', label: (n) => `Saved Payment Cards (${n})`, icon: <CreditCard size={18} /> },
  ];

  const tabCounts: Record<TabId, number> = {
    rides: bookings.length,
    cards: cards.length,
  };

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
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c5a46d', display: 'block' }}>
                  Passenger Portal
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, fontFamily: "'Cinzel', serif", color: '#c5a46d' }}>
                  Welcome, {user.name}!
                </h1>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.25rem 0 0 3.6rem' }}>
              {user.email} {user.role === 'PASSENGER' && (user as any).phone && `• ${(user as any).phone}`}
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
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#0f172a' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {tab.icon}
              <span>{tab.label(tabCounts[tab.id])}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading your dashboard data...
          </div>
        ) : (
          <>
            {/* Tab: My Rides */}
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
                    {bookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Cards */}
            {activeTab === 'cards' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Stripe Customer Vault Cards
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    Saved cards are securely stored via Stripe Vault for 1-click booking pre-authorizations
                  </p>
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
                      <SavedCardItem key={card.id} card={card} />
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
