// ── SavedCardItem: Single Responsibility — renders one saved payment card ───────

import { ShieldCheck } from 'lucide-react';
import { CardData } from './usePassengerDashboard';

interface Props {
  card: CardData;
}

export function SavedCardItem({ card }: Props) {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#ffffff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid #1e293b',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c5a46d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {card.brand}
        </span>
        <ShieldCheck size={20} style={{ color: '#c5a46d' }} />
      </div>

      <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '1.25rem' }}>
        •••• •••• •••• {card.last4}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>EXPIRES</span>
        <strong style={{ color: '#ffffff' }}>{card.expMonth}/{card.expYear}</strong>
      </div>
    </div>
  );
}
