'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <img
            src="/images/gm-logo-1-1.png"
            alt="GM Limo Services"
            className="admin-login__logo"
          />
          <h1 className="admin-login__title">CMS Admin Portal</h1>
          <p className="admin-login__subtitle">
            Sign in to manage fleet, services, and bookings
          </p>
        </div>

        {error && <div className="admin-login__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-login__field">
            <label htmlFor="email" className="admin-login__label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="admin@gmlimoservices.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-login__input"
            />
          </div>

          <div className="admin-login__field admin-login__field--last">
            <label htmlFor="password" className="admin-login__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login__input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn--login"
          >
            {loading ? 'Authenticating…' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
