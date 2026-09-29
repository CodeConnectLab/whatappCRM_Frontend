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
  appId?: string;
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

export type LeadStatus = 'new' | 'in_progress' | 'qualified' | 'won' | 'lost';

/** First-touch ad attribution copied onto the conversation. */
export type ChatReferral = {
  ctwaClid?: string;
  sourceId?: string;
  sourceType?: string;
  sourceUrl?: string;
  headline?: string;
  adBody?: string;
};

export type ChatRow = {
  _id: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  contactId?: { _id?: string; name?: string; phone?: string; email?: string; tags?: string[] };
  assignedTo?: string | null;
  assignedAt?: string;
  assignmentMethod?: 'auto' | 'manual' | 'self';
  /** Resolved server-side so the list needs no extra lookup. */
  assignedToUser?: { name?: string; email?: string } | null;
  status?: LeadStatus;
  productId?: string | null;
  productName?: string | null;
  referral?: ChatReferral;
  firstInboundMessage?: string;
  firstInboundAt?: string;
  lastAgentReplyAt?: string;
  /** Contact's last message — the start of the 24-hour free-form window. */
  lastInboundAt?: string;
  crmSyncStatus?: string;
  createdAt?: string;
};

export type MediaKind = 'image' | 'video' | 'audio' | 'document' | 'sticker';

/** Attachment on a message. `url` is a short-lived signed link, minted per request. */
export type MessageMedia = {
  mediaId?: string;
  url?: string | null;
  mimeType?: string;
  filename?: string;
  size?: number;
  kind?: MediaKind;
};

export type MessageRow = {
  _id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  messageType?: string;
  status: string;
  statusDetail?: string;
  createdAt: string;
  senderUserId?: string;
  media?: MessageMedia;
  isAutomated?: boolean;
};

/** How much of WhatsApp's 24-hour free-form reply window is left. */
export type ServiceWindow = {
  /** False only when the window is provably shut. */
  open: boolean;
  /** False for conversations that predate window tracking — claim nothing then. */
  known: boolean;
  expiresAt: string | null;
  minutesLeft: number;
};

export type ChatActivityRow = {
  _id: string;
  action: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  userId?: { name?: string; email?: string };
};

/** Everything the details rail needs for one conversation, in one call. */
export type ChatDetail = {
  chat: ChatRow;
  serviceWindow: ServiceWindow;
  groups: { _id: string; name: string }[];
  activity: ChatActivityRow[];
};

/** Canned reply an agent drops into the composer. Ours, not a Meta template. */
export type QuickReply = {
  _id: string;
  title: string;
  body: string;
  shortcut?: string;
  mediaId?: string;
  useCount?: number;
};

export type ChatNote = {
  _id: string;
  body: string;
  createdAt: string;
  userId?: { _id?: string; name?: string; email?: string };
};

export type LeadCounts = {
  new: number;
  in_progress: number;
  qualified: number;
  won: number;
  lost: number;
  total: number;
  unassigned: number;
};

export type AssignmentCandidate = {
  userId: string;
  role: 'company_admin' | 'agent';
  openLeadCount: number;
  lastAssignedAt: number;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  keywords?: string[];
  adIds?: string[];
  campaignNames?: string[];
  whatsappNumberIds?: string[];
  crmLabel?: string;
  active?: boolean;
};

/** An ad or post that has actually produced leads, for the product/rule mapping UI. */
export type AdSource = {
  sourceId: string;
  sourceType?: string;
  headline?: string;
  leadCount: number;
  lastSeenAt?: string;
  productId?: string;
  productName?: string;
};

export type AutoResponseTrigger =
  | 'first_inbound'
  | 'every_inbound'
  | 'keyword'
  | 'outside_hours'
  | 'no_agent_reply';

export type AutoResponseBusinessHours = {
  timezone?: string;
  startMinute: number;
  endMinute: number;
  weekdays?: number[];
};

export type AutoResponseRule = {
  _id: string;
  name: string;
  enabled?: boolean;
  priority?: number;
  trigger: AutoResponseTrigger;
  productId?: string | null;
  adIds?: string[];
  campaignNames?: string[];
  whatsappNumberIds?: string[];
  keywords?: string[];
  adLeadsOnly?: boolean;
  businessHours?: AutoResponseBusinessHours | null;
  actionType?: 'text' | 'template';
  body?: string;
  templateId?: string | null;
  mediaId?: string | null;
  delaySeconds?: number;
  delayMinutes?: number;
  throttle?: 'once_per_chat' | 'once_per_day' | 'always';
  stats?: { sent?: number; failed?: number; lastSentAt?: string; lastError?: string };
};

export type CompanyRow = {
  _id: string;
  name: string;
  slug?: string;
};

export type TeamMember = {
  _id: string;
  role: 'company_admin' | 'agent';
  /** Whether the round-robin includes this member. */
  availableForLeads: boolean;
  createdAt?: string;
  userId: { _id: string; email?: string; name?: string; mustChangePassword?: boolean } | null;
  /** Open leads currently sitting with this member. */
  openLeadCount: number;
};

export type CrmBridgePushMode = 'ad_only' | 'all_inbound';

/** Bridge that forwards WhatsApp leads into the client's own CRM. */
export type CrmBridgeConfig = {
  enabled: boolean;
  /** Both the base URL and an API key are saved. */
  configured: boolean;
  crmBaseUrl?: string;
  apiKeyConfigured: boolean;
  pushMode: CrmBridgePushMode;
  leadSourceLabel?: string;
  lastPushAt?: string;
  lastPushStatus?: string;
  lastPushError?: string;
  totalPushed: number;
  totalFailed: number;
};
