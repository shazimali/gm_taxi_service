export interface AboutFeatureBox {
  icon: string;
  title: string;
  desc: string;
}

export interface AboutPillar {
  title: string;
  desc: string;
}

export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutContentData {
  heroTag: string;
  heroTitle: string;
  heroDesc: string;
  heroImage: string;

  whoTag: string;
  whoTitlePrefix: string;
  whoTitleHighlight: string;
  whoDesc: string;
  whoText1: string;
  whoText2: string;
  whoImage: string;
  featureBoxes: AboutFeatureBox[];

  pillarsTag: string;
  pillarsTitle: string;
  pillarsDesc: string;
  pillars: AboutPillar[];

  statsTag: string;
  statsHeader: string;
  statsImage: string;
  stats: AboutStat[];

  cta1Tag: string;
  cta1Title: string;
  cta1BtnText: string;
  cta1BtnLink: string;
  cta1Image: string;

  cta2Tag: string;
  cta2Title: string;
  cta2BtnText: string;
  cta2BtnLink: string;
  cta2Image: string;
}

export const DEFAULT_ABOUT_CONTENT: AboutContentData = {
  heroTag: 'PROVEN EXCELLENCE IN BOSTON',
  heroTitle: 'About GM Limo Services',
  heroDesc:
    'Setting the standard for executive mobility, luxury airport transfers, and private corporate transportation across Greater Boston and New England.',
  heroImage: '/images/about-hero-bg.webp',

  whoTag: 'OUR STORY & VISION',
  whoTitlePrefix: '10+ Years of',
  whoTitleHighlight: 'Uncompromising Quality',
  whoDesc:
    'Founded on the principles of punctuality, discretion, and white-glove hospitality, GM Limo Services has grown into Boston’s preferred executive fleet provider.',
  whoText1:
    'We serve Fortune 500 executives, biotech leaders, financial institutions, private event planners, and discerning travelers. Our 24/7 dispatch desk coordinates every detail — from live Logan airport flight tracking to custom onboard preferences.',
  whoText2:
    'Every journey with GM Limo Services is crafted to exceed expectations. Whether traveling for high-stakes business meetings, point-to-point transfers, or special celebrations, our late-model luxury vehicles and professional chauffeurs ensure seamless travel.',
  whoImage: '/images/about-drivers.jpg',
  featureBoxes: [
    {
      icon: 'ShieldCheck',
      title: 'Safety First',
      desc: '100% background-checked, DOT-certified, & fully insured chauffeurs.',
    },
    {
      icon: 'Clock',
      title: 'Always On Time',
      desc: 'Chauffeurs arrive 15 minutes before scheduled pickup time.',
    },
    {
      icon: 'Car',
      title: 'Executive Fleet',
      desc: 'Meticulously maintained Lincoln Navigators, Escalades & Sedans.',
    },
    {
      icon: 'Award',
      title: 'Flat Transparent Rates',
      desc: 'All-inclusive pricing with zero hidden fees or surge pricing.',
    },
  ],

  pillarsTag: 'SERVICE COMMITMENT',
  pillarsTitle: 'The GM Luxury Standard',
  pillarsDesc:
    'We redefine ground transportation through rigorous chauffeur training, pristine vehicle maintenance, and personalized passenger care.',
  pillars: [
    {
      title: 'Duty of Care',
      desc: 'Full commercial insurance coverage, background screening, and strict privacy protocols for every single trip.',
    },
    {
      title: 'Logan Airport Mastery',
      desc: 'Real-time commercial flight tracking and designated pickup location routing for Terminals A, B, C, and E.',
    },
    {
      title: 'White-Glove Hospitality',
      desc: 'Tailored climate settings, route preferences, luggage assistance, and optional quiet cabin mode upon request.',
    },
    {
      title: '24/7 Dispatch Desk',
      desc: 'Dedicated human support team available around the clock to handle last-minute updates and flight changes.',
    },
  ],

  statsTag: 'MILESTONES OF SUCCESS',
  statsHeader: 'Trusted By Executives & Travelers Nationwide',
  statsImage: '/images/Boston-Luxury-Chauffeur.webp',
  stats: [
    { value: '15+', label: 'Years of Service' },
    { value: '50,000+', label: 'Successful Rides' },
    { value: '99.8%', label: 'On-Time Arrival Rate' },
  ],

  cta1Tag: 'INDIVIDUAL & FAMILY TRAVEL',
  cta1Title: 'Reserve Your Private Executive Chauffeur',
  cta1BtnText: 'Book Online Now',
  cta1BtnLink: '/book',
  cta1Image: '/images/Event-Transportation-e1763052056749.webp',

  cta2Tag: 'CORPORATE ACCOUNTS',
  cta2Title: 'Need Custom Billing or Fleet Dispatch?',
  cta2BtnText: 'Contact Corporate Team',
  cta2BtnLink: '/contact',
  cta2Image: '/images/City-to-City-Transfer-e1763051857279.webp',
};

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Merges a raw AboutContent DB row (all fields nullable) with defaults for display.
export function resolveAboutContent(db: Record<string, unknown> | null | undefined): AboutContentData {
  const d = DEFAULT_ABOUT_CONTENT;
  const get = (key: string, fallback: string) =>
    (db?.[key] as string | null | undefined) || fallback;

  return {
    heroTag: get('heroTag', d.heroTag),
    heroTitle: get('heroTitle', d.heroTitle),
    heroDesc: get('heroDesc', d.heroDesc),
    heroImage: get('heroImage', d.heroImage),

    whoTag: get('whoTag', d.whoTag),
    whoTitlePrefix: get('whoTitlePrefix', d.whoTitlePrefix),
    whoTitleHighlight: get('whoTitleHighlight', d.whoTitleHighlight),
    whoDesc: get('whoDesc', d.whoDesc),
    whoText1: get('whoText1', d.whoText1),
    whoText2: get('whoText2', d.whoText2),
    whoImage: get('whoImage', d.whoImage),
    featureBoxes: parseJsonArray(db?.featureBoxes as string | null, d.featureBoxes),

    pillarsTag: get('pillarsTag', d.pillarsTag),
    pillarsTitle: get('pillarsTitle', d.pillarsTitle),
    pillarsDesc: get('pillarsDesc', d.pillarsDesc),
    pillars: parseJsonArray(db?.pillars as string | null, d.pillars),

    statsTag: get('statsTag', d.statsTag),
    statsHeader: get('statsHeader', d.statsHeader),
    statsImage: get('statsImage', d.statsImage),
    stats: parseJsonArray(db?.stats as string | null, d.stats),

    cta1Tag: get('cta1Tag', d.cta1Tag),
    cta1Title: get('cta1Title', d.cta1Title),
    cta1BtnText: get('cta1BtnText', d.cta1BtnText),
    cta1BtnLink: get('cta1BtnLink', d.cta1BtnLink),
    cta1Image: get('cta1Image', d.cta1Image),

    cta2Tag: get('cta2Tag', d.cta2Tag),
    cta2Title: get('cta2Title', d.cta2Title),
    cta2BtnText: get('cta2BtnText', d.cta2BtnText),
    cta2BtnLink: get('cta2BtnLink', d.cta2BtnLink),
    cta2Image: get('cta2Image', d.cta2Image),
  };
}
