export interface AirportItem {
  code: string;
  name: string;
  location: string;
  estDriveTime: string;
  description: string;
  sedanEstimate: string;
  suvEstimate: string;
}

export const AIRPORTS_DATA: AirportItem[] = [
  {
    code: 'BOS',
    name: 'Logan International Airport',
    location: 'Boston, MA',
    estDriveTime: '20–30 mins from Downtown Boston',
    description: 'Primary international airport for Greater Boston. We service all terminals (A, B, C, E) with curbside limo pickup or Meet & Greet.',
    sedanEstimate: 'From $85',
    suvEstimate: 'From $110',
  },
  {
    code: 'PVD',
    name: 'TF Green International Airport',
    location: 'Warwick / Providence, RI',
    estDriveTime: '55–65 mins from Boston',
    description: 'Convenient alternative airport serving Rhode Island and southern Massachusetts. Seamless interstate express transfers.',
    sedanEstimate: 'From $165',
    suvEstimate: 'From $210',
  },
  {
    code: 'MHT',
    name: 'Manchester-Boston Regional',
    location: 'Manchester, NH',
    estDriveTime: '60–70 mins from Boston',
    description: 'Popular regional hub for northern New England travelers. Fast I-93 corridor luxury travel.',
    sedanEstimate: 'From $175',
    suvEstimate: 'From $220',
  },
  {
    code: 'BED',
    name: 'Hanscom Field Private Jet Aviation',
    location: 'Bedford / Concord, MA',
    estDriveTime: '35–45 mins from Boston',
    description: 'New England’s premier general aviation FBO facility for private jet charters, Signature Flight Support, and Jet Aviation.',
    sedanEstimate: 'From $120',
    suvEstimate: 'From $155',
  },
  {
    code: 'ORH',
    name: 'Worcester Regional Airport',
    location: 'Worcester, MA',
    estDriveTime: '50–60 mins from Boston',
    description: 'Central Massachusetts airport connecting business travelers across the Commonwealth.',
    sedanEstimate: 'From $160',
    suvEstimate: 'From $200',
  },
  {
    code: 'HYA',
    name: 'Cape Cod Gateway Airport',
    location: 'Hyannis, MA',
    estDriveTime: '75–90 mins from Boston',
    description: 'Direct gateway to Cape Cod, Martha’s Vineyard, and Nantucket ferry connects.',
    sedanEstimate: 'From $240',
    suvEstimate: 'From $295',
  },
];
