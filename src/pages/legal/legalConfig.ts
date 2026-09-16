/**
 * Single source of truth for the three public legal pages
 * (/privacy, /terms, /data-deletion).
 *
 * These pages are submitted to Meta for WhatsApp app review, so they must stay
 * publicly reachable, return HTTP 200, and carry a visible "last updated" date.
 *
 * Infrastructure facts below are taken from the backend's SETUP_GUIDE.md. If
 * the deployment moves, update this file — the pages read from it.
 */

/** Bump BOTH dates whenever the wording of any legal page changes. */
export const EFFECTIVE_DATE = '16 September 2026';
export const LAST_UPDATED = '16 September 2026';

export const PRODUCT_NAME = 'WTSP Console';
export const APP_URL = 'https://wtsp.codeconnect.in';
export const API_URL = 'https://wtspapi.codeconnect.in';

export const LEGAL_ENTITY = 'CODEXBIT';
/** Follows the entity name in prose: "CODEXBIT, a sole proprietorship registered in India". */
export const LEGAL_ENTITY_DESCRIPTOR = 'a sole proprietorship registered in India';
/** A proprietorship has a proprietor, not directors — used in the indemnity clause. */
export const LEGAL_ENTITY_PRINCIPALS = 'its proprietor, employees and contractors';

export const CONTACT_EMAIL = 'hello@codexbit.in';
export const ALT_EMAIL = 'codexbitlab@gmail.com';

export const REGISTERED_ADDRESS_LINES = [
  'CODEXBIT',
  'Plot 21, Chinchpada',
  'Airoli Naka (near C P C Company)',
  'Airoli, Navi Mumbai',
  'Thane, Maharashtra 400708',
  'India',
];

export const GRIEVANCE_OFFICER = {
  name: 'Shashank Yadav',
  designation: 'Co-founder and Tech Head',
  email: CONTACT_EMAIL,
  altEmail: ALT_EMAIL,
  responseDays: 30,
  acknowledgeHours: 48,
};

/** Retention windows, stated in days/years so the pages never say "as necessary". */
export const RETENTION = {
  conversationDaysAfterClosure: 90,
  serverLogDays: 30,
  webhookLogDays: 30,
  billingYears: 7,
  deletionSlaDays: 30,
  backupDays: 35,
};

/** Infrastructure, per backend SETUP_GUIDE.md sections 2, 4, 5 and 8. */
export const INFRA = {
  /** API server: AWS EC2, Ubuntu, nginx + Let's Encrypt. */
  serverProvider: 'Amazon Web Services (AWS)',
  serverRegion: 'Asia Pacific (Mumbai), ap-south-1',
  /** Media files: AWS S3, same region. */
  objectStorage: 'Amazon S3',
  /** Primary database. */
  database: 'MongoDB Atlas',
  databaseRegion: 'Mumbai (ap-south-1)',
  /** The web app itself is served from Vercel's edge network. */
  frontendHost: 'Vercel',
};

/** Service commitments stated in the Terms. */
export const SLA = {
  uptime: '99.5%',
  supportResponse: '1 business day',
};

export const LEGAL_ROUTES = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/data-deletion', label: 'Data Deletion' },
] as const;
