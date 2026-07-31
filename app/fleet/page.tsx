import React from 'react';
import FleetSection from '@/components/home/FleetSection';

export const metadata = {
  title: 'Executive Fleet Lineup | GM Limo Services Boston',
  description: 'Explore our fleet of luxury Business Sedans, Cadillac Escalade SUVs, Stretch Limousines, and Mercedes Sprinter Vans.',
};

export default function FleetPage() {
  return (
    <div className="pt-20">
      <FleetSection />
    </div>
  );
}
