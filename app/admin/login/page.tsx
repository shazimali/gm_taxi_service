'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Background Ambient Glow */}
      <div className="admin-login__bg-glow admin-login__bg-glow--1" />
      <div className="admin-login__bg-glow admin-login__bg-glow--2" />

      <div className="admin-login__card">
        {/* Security Badge */}
        <div style={{ textAlign: 'center' }}>
          <div className="admin-login__badge">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Management Portal</span>
          </div>
        </div>

        <div className="admin-login__header">
          <img
            src="/images/gm-logo-1-1.png"
            alt="GM Limo Services"
            className="admin-login__logo"
          />
          <h1 className="admin-login__title">Executive Admin Portal</h1>
          <p className="admin-login__subtitle">
            Sign in to manage fleet, reservations, and dispatch operations
          </p>
        </div>

        {error && (
          <div className="admin-login__error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-login__field">
            <label htmlFor="email" className="admin-login__label">
              Email Address
            </label>
            <div className="admin-login__input-wrapper">
              <Mail className="admin-login__input-icon" />
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
          </div>

          <div className="admin-login__field">
            <label htmlFor="password" className="admin-login__label">
              Password
            </label>
            <div className="admin-login__input-wrapper">
              <Lock className="admin-login__input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login__input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-login__toggle-pw"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn--login"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="admin-login__footer">
          <p>© {new Date().getFullYear()} GM Limo Services. Authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}
