import React from 'react';
import ServicesGrid from '@/components/home/ServicesGrid';

export const metadata = {
  title: 'Executive Services | GM Limo Services Boston',
  description: 'Explore GM Limo Services offerings including Airport Transfers, Hourly Chauffeur, City-to-City Long Distance, and Corporate Accounts.',
};

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <ServicesGrid />
    </div>
  );
}
