import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Contact Us | GM Limo Services Boston 24/7 Dispatch',
  description: 'Get in touch with GM Limo Services dispatch desk 24/7. Call (617) 784-0264 or send an inquiry for instant rate quotes.',
};

export default async function ContactPage() {
  let settings = {
    phoneDisplay: '(617) 784-0264',
    phoneTel: '16177840264',
    dispatchEmail: 'info@bostonluxurychauffeur.com',
    serviceAddress: 'Greater Boston, MA & New England',
  };

  try {
    const dbSettings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });
    if (dbSettings) {
      settings = {
        phoneDisplay: dbSettings.phoneDisplay || settings.phoneDisplay,
        phoneTel: dbSettings.phoneTel || settings.phoneTel,
        dispatchEmail: dbSettings.dispatchEmail || settings.dispatchEmail,
        serviceAddress: dbSettings.serviceAddress || settings.serviceAddress,
      };
    }
  } catch (e) {
    console.error('Error fetching site settings for contact page:', e);
  }

  return (
    <div className="contact-page-wrap">
      {/* ── Page Banner / Hero ───────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero__bg">
          <Image
            src="/images/office-car.webp"
            alt="GM Limo Services Dispatch"
            fill
            priority
            className="contact-hero__img"
          />
          <div className="contact-hero__overlay"></div>
        </div>

        <div className="container contact-hero__content">
          <span className="eyebrow eyebrow--gold">24/7 DISPATCH DESK</span>
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__lead">
            Have a question, need an urgent airport transfer, or setting up a corporate account? Our luxury dispatch team is available 24 hours a day, 365 days a year.
          </p>
        </div>
      </section>

      {/* ── Main Contact Section ────────────────────────────────── */}
      <section className="contact-main section-pad">
        <div className="container">
          <div className="contact-grid">
            {/* Left Column: Form */}
            <div className="contact-form-card">
              <div className="contact-form-card__header">
                <span className="eyebrow">Instant Inquiry</span>
                <h2>Send Us a Message</h2>
                <p>
                  Fill out the form below and our 24/7 dispatch desk will respond within 15 minutes.
                </p>
              </div>

              <ContactForm />
            </div>

            {/* Right Column: Info Cards & Map */}
            <div className="contact-info-col">
              {/* Direct Info Card */}
              <div className="contact-info-card">
                <h3 className="contact-info-card__title">Direct Contact</h3>

                <div className="contact-info-list">
                  <a href={`tel:${settings.phoneTel}`} className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Phone size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">24/7 Dispatch Phone</span>
                      <span className="contact-info-item__value">{settings.phoneDisplay}</span>
                    </div>
                  </a>

                  <a href={`mailto:${settings.dispatchEmail}`} className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Mail size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Email Support</span>
                      <span className="contact-info-item__value">{settings.dispatchEmail}</span>
                    </div>
                  </a>

                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <MapPin size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Primary Service Area</span>
                      <span className="contact-info-item__value">{settings.serviceAddress}</span>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-item__icon">
                      <Clock size={20} />
                    </div>
                    <div className="contact-info-item__text">
                      <span className="contact-info-item__label">Hours of Operation</span>
                      <span className="contact-info-item__value">24 Hours a Day / 7 Days a Week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Box */}
              <div className="contact-map-box">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d188764.91263435164!2d-71.18247926210933!3d42.31426469614488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3652d0d3d1147%3A0x7c8a62319c5672d!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  className="contact-map-iframe"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="GM Limo Services Boston Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
