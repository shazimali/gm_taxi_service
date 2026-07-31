import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { SERVICES_DATA } from '@/data/servicesData';

export async function generateStaticParams() {
  return SERVICES_DATA.map((service) => ({
    slug: service.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = SERVICES_DATA.find((s) => s.slug === params.slug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.title} | GM Limo Services Boston`,
    description: service.tagline,
  };
}

export default function SingleServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES_DATA.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="pt-28 pb-20 bg-neutral-950 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-8">
          <Link href="/" className="hover:text-[#c5a059]">Home</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-[#c5a059]">Services</Link>
          <span>/</span>
          <span className="text-white font-medium">{service.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image & Details */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/10 glass-card shadow-2xl">
              <Image
                src={service.image}
                alt={service.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#c5a059] border border-white/10 flex items-center gap-1.5">
                <span>{service.icon}</span>
                <span>{service.badge}</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10">
              <h1 className="font-serif text-3xl font-bold text-white mb-3">
                {service.title}
              </h1>
              <p className="text-sm text-[#c5a059] font-medium mb-6">
                {service.tagline}
              </p>

              <p className="text-neutral-300 text-sm leading-relaxed mb-8">
                {service.fullDesc}
              </p>

              <h3 className="font-serif text-xl font-bold text-white mb-4">
                Service Privileges & Benefits
              </h3>
              <ul className="flex flex-col gap-3 mb-8">
                {service.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-serif text-xl font-bold text-white mb-4">
                Core Service Capabilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-neutral-900 border border-white/5 text-xs text-neutral-300 font-medium">
                    ⚡ {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                Reserve {service.badge}
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Lock in your guaranteed rate with 24/7 live dispatch support.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/book?service=${service.slug}`}
                  className="gold-btn-gradient text-neutral-950 font-bold text-center py-4 rounded-xl uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                >
                  <span>Book {service.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="tel:16177840264"
                  className="py-3.5 rounded-xl border border-white/20 hover:border-[#c5a059] text-white font-bold text-xs text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#c5a059]" />
                  <span>Call (617) 784-0264</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
