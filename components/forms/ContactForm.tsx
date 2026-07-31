'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendContactEmail } from '@/lib/actions/sendContactEmail';

export default function ContactForm() {
  const [status, setStatus] = useState<{ success?: boolean; message?: string; error?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({});

    const formData = new FormData(e.currentTarget);
    const result = await sendContactEmail({}, formData);

    setLoading(false);
    setStatus(result);

    if (result.success) {
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="contact-form-wrap">
      {status.success && (
        <div className="contact-alert contact-alert--success">
          <CheckCircle2 size={20} className="contact-alert__icon" />
          <span>{status.message}</span>
        </div>
      )}

      {status.error && (
        <div className="contact-alert contact-alert--error">
          <AlertCircle size={20} className="contact-alert__icon" />
          <span>{status.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="theme-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. John Smith"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. john@example.com"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. (617) 555-0199"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Service Interested In</label>
            <select name="service" className="form-select">
              <option value="airport">Airport Transfers (BOS / PVD / MHT)</option>
              <option value="hourly">Hourly Private Chauffeur</option>
              <option value="long-distance">Long Distance / City-to-City</option>
              <option value="corporate">Corporate Account Services</option>
              <option value="wedding">Wedding / Special Event Limo</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Your Message or Inquiry <span className="req">*</span>
          </label>
          <textarea
            name="message"
            rows={5}
            required
            placeholder="Tell us about your trip dates, preferred vehicle, passenger count, or special requests..."
            className="form-textarea"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn--gold btn--full"
          style={{ height: '54px', fontSize: '0.95rem' }}
        >
          {loading ? (
            <span>Sending Inquiry...</span>
          ) : (
            <>
              <span>Send Message to Dispatch</span>
              <Send size={16} style={{ marginLeft: '0.5rem' }} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
