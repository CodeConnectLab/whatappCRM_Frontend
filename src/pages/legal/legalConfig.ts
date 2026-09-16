/**
 * Single source of truth for the three public legal pages
 * (/privacy, /terms, /data-deletion).
 *
 * These pages are submitted to Meta for WhatsApp app review, so they must stay
 * publicly reachable, return HTTP 200, and carry a visible "last updated" date.
 *
 * Anything still written as a `[FILL: …]` marker is a value that has to be
 * supplied before submitting for review — run
 *   grep -rn "FILL:" src/pages/legal
 * to find every remaining one.
 */

/** Bump BOTH dates whenever the wording of any legal page changes. */
export const EFFECTIVE_DATE = '16 September 2026';
export const LAST_UPDATED = '16 September 2026';

export const PRODUCT_NAME = 'WTSP Console';
export const APP_URL = 'https://wtsp.codeconnect.in';
export const API_URL = 'https://wtspapi.codeconnect.in';

export const LEGAL_ENTITY = 'CODEXBIT';
/** e.g. "Private Limited" / "LLP" / "(a sole proprietorship)" — as registered. */
export const LEGAL_ENTITY_SUFFIX_FILL = 'registered legal suffix, e.g. "Private Limited"';

export const CONTACT_EMAIL = 'hello@codexbit.in';
export const ALT_EMAIL = 'codexbitlab@gmail.com';
export const CONTACT_PHONE_FILL = 'contact phone number in E.164 form, e.g. +91 22 1234 5678';

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

export const HOSTING_REGION = 'Mumbai, India (ap-south-1)';
export const HOSTING_PROVIDER_FILL =
  'hosting provider actually used, e.g. "Amazon Web Services (AWS)" or "DigitalOcean"';
export const EMAIL_PROVIDER_FILL =
  'transactional email provider, e.g. "Amazon SES" / "Postmark" — or delete this row if no third-party email provider is used';

export const LEGAL_ROUTES = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/data-deletion', label: 'Data Deletion' },
] as const;
