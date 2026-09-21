'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSuccess(data.message || 'If an account exists with that email, a password reset link has been sent.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '88vh',
      backgroundColor: '#0a0f1d',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(197, 164, 109, 0.15), rgba(255, 255, 255, 0))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
    }}>
      <div style={{
        backgroundColor: '#0f172a',
        borderRadius: '24px',
        padding: '2.75rem 2.25rem',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid rgba(197, 164, 109, 0.25)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(197, 164, 109, 0.08)',
        color: '#ffffff',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(197, 164, 109, 0.12)',
            border: '1px solid rgba(197, 164, 109, 0.3)',
            color: '#c5a46d',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            <ShieldCheck size={14} />
            <span>Account Recovery</span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <img
              src="/images/logo.png"
              alt="GM Limo Services"
              style={{ maxHeight: '42px', margin: '0 auto' }}
            />
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            margin: '0 0 0.4rem 0',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.02em',
            color: '#ffffff',
          }}>
            Forgot Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            Enter your account email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            textAlign: 'left',
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{success}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.45rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    paddingLeft: '2.75rem',
                    paddingRight: '1rem',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: '50px',
                background: 'linear-gradient(135deg, #c5a46d 0%, #a88548 100%)',
                color: '#0b0f17',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(197, 164, 109, 0.35)',
                marginTop: '0.5rem',
                transition: 'transform 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending Link…</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#94a3b8',
        }}>
          <Link href="/login" style={{ color: '#c5a46d', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
