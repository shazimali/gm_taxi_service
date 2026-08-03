'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function PassengerRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/passenger/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      router.push('/passenger/dashboard');
    } catch {
      setError('An error occurred during account creation.');
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '85vh', padding: '6rem 1rem 4rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(184, 134, 11, 0.1)', color: '#b8860b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <User size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Cinzel', serif" }}>
            Create Passenger Account
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
            Save credit cards in Stripe Vault &amp; manage your executive bookings
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Smith"
                style={{ width: '100%', height: '48px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                style={{ width: '100%', height: '48px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Mobile Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (617) 784-0264"
                style={{ width: '100%', height: '48px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width: '100%', height: '48px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ height: '50px', background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(197, 164, 109, 0.4)', marginTop: '0.5rem' }}
          >
            <span>{loading ? 'Creating Account...' : 'Register & Create Vault'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#64748b' }}>
          Already have a passenger account?{' '}
          <Link href="/passenger/login" style={{ color: '#b8860b', fontWeight: 700, textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
