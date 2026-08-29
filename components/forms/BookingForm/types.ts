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

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
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
