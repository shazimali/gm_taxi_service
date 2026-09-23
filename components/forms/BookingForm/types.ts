/**
 * components/forms/BookingForm/types.ts
 *
 * Single Responsibility: Type definitions and constants for the booking form workflow.
 */

export const POPULAR_LOCATIONS = [
  'Boston Logan International Airport (BOS) - Terminal A',
  'Boston Logan International Airport (BOS) - Terminal B',
  'Boston Logan International Airport (BOS) - Terminal C',
  'Boston Logan International Airport (BOS) - Terminal E (International)',
  'Hanscom Field Private Aviation (BED) - Bedford, MA',
  'T.F. Green International Airport (PVD) - Providence, RI',
  'Manchester-Boston Regional Airport (MHT) - Manchester, NH',
  'Worcester Regional Airport (ORH) - Worcester, MA',
  'John F. Kennedy International Airport (JFK) - New York, NY',
  'LaGuardia Airport (LGA) - New York, NY',
  'Newark Liberty International Airport (EWR) - Newark, NJ',
  'Back Bay & Copley Square, Boston, MA',
  'Downtown Financial District, Boston, MA',
  'Seaport District & Waterfront, Boston, MA',
  'Harvard Square, Cambridge, MA',
  'Kendall Square Biotech Hub, Cambridge, MA',
  'Chestnut Hill & Newton, MA',
  'Wellesley & Weston Executive Belt, MA',
  'Lexington & Concord, MA',
  'Suburban Westborough & Framingham, MA',
  'Midtown Manhattan & Times Square, New York, NY',
  'Penn Station & Hudson Yards, New York, NY',
];

export interface LocationResult {
  display_name: string;
}

export interface StopItem {
  id: string;
  value: string;
  finalized: boolean;
  suggestions: string[];
  loading: boolean;
  showDropdown: boolean;
}

export interface PassengerProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  stripeCustomerId?: string | null;
}

export interface BookingSubmissionStatus {
  success?: boolean;
  confirmationNumber?: string;
  message?: string;
  error?: string;
}

/** Services offered in the booking form dropdown (value must match the DB service name). */
export const SERVICE_OPTIONS = [
  { value: 'Airport Transportation', label: '✈️ Airport Transportation' },
  { value: 'Hourly Private Chauffeur', label: '🕐 Hourly Private Chauffeur' },
  { value: 'Long Distance City-to-City Transfer', label: '🗺️ Long Distance City-to-City Transfer' },
  { value: 'Luxury Chauffeur & Limousine', label: '👑 Luxury Chauffeur & Limousine' },
  { value: 'Event Limo Service', label: '🎉 Event Limo Service' },
  { value: 'Private Wedding Limo', label: '💒 Private Wedding Limo' },
] as const;
