export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type Wallet = {
  _id: string;
  companyId: string;
  balance: number;
  currency: string;
};

export type TransactionRow = {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
};

export type Contact = {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  tags?: string[];
};

export type ContactGroup = {
  _id: string;
  name: string;
  contactIds: string[];
};

export type ContactImportResult = {
  imported: number;
  rowsProcessed: number;
  groupsUpdated: string[];
  groupAssigned: string | null;
  skipped: number;
  errors: { line: number; message: string }[];
};

export type Campaign = {
  _id: string;
  name: string;
  status: string;
  templateId?: string;
  whatsappNumberId: string;
  contactGroupIds: string[];
  contactIds: string[];
  scheduledAt?: string;
  stats?: { total: number; sent: number; failed: number };
  createdAt: string;
};

/** Meta review states; `local` means never submitted for approval. */
export type TemplateStatus =
  | 'local'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'IN_APPEAL';

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export type Template = {
  _id: string;
  name: string;
  body: string;
  language?: string;
  imageUrl?: string;
  status?: TemplateStatus;
  category?: TemplateCategory;
  metaTemplateId?: string;
  metaTemplateName?: string;
  variables?: string[];
  rejectedReason?: string;
  submittedAt?: string;
  syncedAt?: string;
};

export type WhatsappNumber = {
  _id: string;
  phoneNumber: string;
  friendlyName?: string;
  isDefault?: boolean;
  provider?: 'twilio' | 'meta';
  twilioAccountId?: string;
  metaPhoneNumberId?: string;
};

export type MetaWebhookVerificationStatus = 'pending' | 'verified' | 'failed';

export type MetaWhatsappConfig = {
  configured: boolean;
  accessTokenConfigured: boolean;
  appSecretConfigured: boolean;
  wabaId?: string;
  webhookSlug?: string;
  webhookUrl: string | null;
  webhookVerifyToken?: string;
  webhookVerificationStatus?: MetaWebhookVerificationStatus;
  webhookVerifiedAt?: string;
  webhookLastVerifyAt?: string;
  webhookLastVerifyError?: string;
};

export type WorkspaceSummary = {
  whatsappProvider: 'twilio' | 'meta';
  metaCredentialsConfigured: boolean;
  metaSenderConfigured: boolean;
  metaWebhookVerified: boolean;
  metaReadyForCampaigns: boolean;
  defaultWhatsappNumberId?: string;
  metaSetupIssues: string[];
  wabaId?: string;
  chatCount: number;
  templateCount: number;
};

export type ActivityLogRow = {
  _id: string;
  action: string;
  resource?: string;
  meta?: unknown;
  createdAt: string;
  userId?: { name?: string; email?: string };
};

export type TwilioAccountRow = {
  id: string;
  accountSid: string;
  friendlyName?: string;
};

export type ChatRow = {
  _id: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  contactId?: { name?: string; phone?: string };
};

export type MessageRow = {
  _id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  status: string;
  statusDetail?: string;
  createdAt: string;
  senderUserId?: string;
};

export type CompanyRow = {
  _id: string;
  name: string;
  slug?: string;
};

export type TeamMember = {
  _id: string;
  role: string;
  userId?: { email?: string; name?: string };
};
