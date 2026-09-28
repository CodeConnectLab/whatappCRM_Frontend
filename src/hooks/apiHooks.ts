import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { useAuthStore } from '../store/authStore.ts';
import type {
  ActivityLogRow,
  AssignmentCandidate,
  AutoResponseRule,
  Campaign,
  ChatNote,
  ChatRow,
  CompanyRow,
  Contact,
  ContactGroup,
  ContactImportResult,
  MessageRow,
  MetaWhatsappConfig,
  CrmBridgeConfig,
  CrmBridgePushMode,
  LeadCounts,
  LeadStatus,
  MediaKind,
  Paginated,
  Product,
  TeamMember,
  Template,
  TemplateCategory,
  TransactionRow,
  TwilioAccountRow,
  Wallet,
  WhatsappNumber,
  WorkspaceSummary,
} from '../types/api.ts';

export function useWalletQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['wallet', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Wallet>('/api/wallet')).data,
  });
}

export function useTransactionsQuery(page: number) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['transactions', companyId, page],
    enabled: Boolean(companyId),
    queryFn: async () =>
      (await api.get<Paginated<TransactionRow>>('/api/wallet/transactions', { params: { page, limit: 20 } }))
        .data,
  });
}

export function useAdminCompaniesQuery(page: number) {
  const isSuper = useAuthStore((s) => s.user?.isSuperAdmin);
  return useQuery({
    queryKey: ['admin-companies', page],
    enabled: Boolean(isSuper),
    queryFn: async () =>
      (await api.get<Paginated<CompanyRow>>('/api/admin/companies', { params: { page, limit: 20 } })).data,
  });
}

export function useTeamQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['team', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<TeamMember[]>('/api/team')).data,
  });
}

export function useContactsQuery(page: number, search: string) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['contacts', companyId, page, search],
    enabled: Boolean(companyId),
    queryFn: async () =>
      (
        await api.get<Paginated<Contact>>('/api/contacts', {
          params: { page, limit: 20, ...(search.trim() ? { search: search.trim() } : {}) },
        })
      ).data,
  });
}

export function useContactGroupsQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['contact-groups', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<ContactGroup[]>('/api/contact-groups')).data,
  });
}

export function useCampaignsQuery(page: number) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['campaigns', companyId, page],
    enabled: Boolean(companyId),
    queryFn: async () =>
      (await api.get<Paginated<Campaign>>('/api/campaigns', { params: { page, limit: 20 } })).data,
  });
}

export function useTemplatesQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['templates', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Template[]>('/api/templates')).data,
  });
}

export function useWhatsappNumbersQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['whatsapp-numbers', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<WhatsappNumber[]>('/api/twilio/numbers')).data,
  });
}

export function useTwilioAccountsQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['twilio-accounts', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<TwilioAccountRow[]>('/api/twilio/accounts')).data,
  });
}

export function useWorkspaceSummaryQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['workspace-summary', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<WorkspaceSummary>('/api/workspace/summary')).data,
  });
}

export function useMetaWhatsappConfigQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  const canReadMeta = Boolean(companyId) && workspaceRole === 'company_admin';
  return useQuery({
    queryKey: ['meta-whatsapp-config', companyId],
    enabled: canReadMeta,
    queryFn: async () => (await api.get<MetaWhatsappConfig>('/api/meta/whatsapp-config')).data,
    refetchInterval: (q) =>
      q.state.data?.webhookVerificationStatus === 'pending' && q.state.data?.webhookUrl ? 5000 : false,
  });
}

export function useUpsertMetaWhatsappConfigMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      accessToken?: string;
      appSecret?: string;
      wabaId?: string;
      appId?: string;
      webhookVerifyToken?: string;
      regenerateWebhookVerifyToken?: boolean;
    }) => (await api.post<MetaWhatsappConfig>('/api/meta/whatsapp-config', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['meta-whatsapp-config', companyId] });
      void qc.invalidateQueries({ queryKey: ['workspace-summary', companyId] });
    },
  });
}

export function useCrmBridgeQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  return useQuery({
    queryKey: ['crm-bridge', companyId],
    enabled: Boolean(companyId) && workspaceRole === 'company_admin',
    queryFn: async () => (await api.get<CrmBridgeConfig>('/api/crm/bridge')).data,
  });
}

export function useUpsertCrmBridgeMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      enabled?: boolean;
      crmBaseUrl?: string;
      crmApiKey?: string;
      pushMode?: CrmBridgePushMode;
      leadSourceLabel?: string;
    }) => (await api.post<CrmBridgeConfig>('/api/crm/bridge', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm-bridge', companyId] });
    },
  });
}

/** Sends a throwaway lead so credentials can be proven before real traffic depends on them. */
export function useTestCrmBridgeMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async () =>
      (await api.post<{ ok: boolean; message: string }>('/api/crm/bridge/test')).data,
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['crm-bridge', companyId] });
    },
  });
}

export function useDisconnectCrmBridgeMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async () => (await api.delete<{ ok: boolean }>('/api/crm/bridge')).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crm-bridge', companyId] });
    },
  });
}

export function useActivityLogsQuery(page: number) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['activity-logs', companyId, page],
    enabled: Boolean(companyId),
    queryFn: async () =>
      (await api.get<Paginated<ActivityLogRow>>('/api/activity-logs', { params: { page, limit: 25 } })).data,
  });
}

export type ChatFilters = {
  /** Ignored for agents — the server pins them to their own leads. */
  assigned?: 'mine' | 'unassigned' | 'all' | string;
  status?: LeadStatus | 'open';
  productId?: string;
  adOnly?: boolean;
};

export function useChatsQuery(filters: ChatFilters = {}) {
  const companyId = useAuthStore((s) => s.companyId);
  const params: Record<string, string> = {};
  if (filters.assigned) params.assigned = filters.assigned;
  if (filters.status) params.status = filters.status;
  if (filters.productId) params.productId = filters.productId;
  if (filters.adOnly) params.adOnly = 'true';

  return useQuery({
    queryKey: ['chats', companyId, params],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<ChatRow[]>('/api/chats', { params })).data,
  });
}

export function useLeadCountsQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['lead-counts', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<LeadCounts>('/api/leads/counts')).data,
  });
}

/** Who the round-robin would consider, with each member's live load. Admin-only. */
export function useAssignmentCandidatesQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  return useQuery({
    queryKey: ['lead-assignees', companyId],
    enabled: Boolean(companyId) && workspaceRole === 'company_admin',
    queryFn: async () => (await api.get<AssignmentCandidate[]>('/api/leads/assignees')).data,
  });
}

function invalidateLeadViews(qc: ReturnType<typeof useQueryClient>, companyId: string | null) {
  void qc.invalidateQueries({ queryKey: ['chats', companyId] });
  void qc.invalidateQueries({ queryKey: ['lead-counts', companyId] });
  void qc.invalidateQueries({ queryKey: ['lead-assignees', companyId] });
  void qc.invalidateQueries({ queryKey: ['team', companyId] });
}

export function useReassignLeadMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ chatId, assignedTo }: { chatId: string; assignedTo: string | null }) =>
      (await api.patch(`/api/chats/${chatId}/assignment`, { assignedTo })).data,
    onSuccess: () => invalidateLeadViews(qc, companyId),
  });
}

export function useUpdateLeadStatusMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ chatId, status }: { chatId: string; status: LeadStatus }) =>
      (await api.patch<ChatRow>(`/api/chats/${chatId}/status`, { status })).data,
    onSuccess: () => invalidateLeadViews(qc, companyId),
  });
}

/** Spreads the unassigned backlog over the rotation — used after hiring an agent. */
export function useDistributeLeadsMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async () =>
      (await api.post<{ assigned: number }>('/api/leads/distribute')).data,
    onSuccess: () => invalidateLeadViews(qc, companyId),
  });
}

export function useChatNotesQuery(chatId: string | null) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['chat-notes', companyId, chatId],
    enabled: Boolean(companyId && chatId),
    queryFn: async () => (await api.get<ChatNote[]>(`/api/chats/${chatId}/notes`)).data,
  });
}

export function useAddChatNoteMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ chatId, body }: { chatId: string; body: string }) =>
      (await api.post<ChatNote>(`/api/chats/${chatId}/notes`, { body })).data,
    onSuccess: (_d, { chatId }) =>
      void qc.invalidateQueries({ queryKey: ['chat-notes', companyId, chatId] }),
  });
}

export function useDeleteChatNoteMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ chatId, noteId }: { chatId: string; noteId: string }) =>
      (await api.delete(`/api/chats/${chatId}/notes/${noteId}`)).data,
    onSuccess: (_d, { chatId }) =>
      void qc.invalidateQueries({ queryKey: ['chat-notes', companyId, chatId] }),
  });
}

export function useStartChatMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: { contactId: string; whatsappNumberId?: string }) =>
      (await api.post<ChatRow>('/api/chats', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['chats', companyId] }),
  });
}

const PAGE_SIZE = 40;

export function useChatMessagesInfiniteQuery(chatId: string | null) {
  const companyId = useAuthStore((s) => s.companyId);
  return useInfiniteQuery({
    queryKey: ['messages', companyId, chatId],
    enabled: Boolean(companyId && chatId),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<MessageRow[]>(`/api/chats/${chatId}/messages`, {
        params: {
          limit: PAGE_SIZE,
          ...(pageParam ? { before: pageParam } : {}),
        },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      const oldest = lastPage[0];
      return oldest?._id ? String(oldest._id) : undefined;
    },
  });
}

export function useInviteMemberMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: { email: string; role: 'company_admin' | 'agent' }) =>
      (await api.post('/api/team/invite', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['team', companyId] }),
  });
}

/**
 * Creates the login and the membership in one call. Replaces the old flow where the
 * person had to register themselves before an admin could add them.
 */
export function useCreateTeamUserMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      name: string;
      email: string;
      password: string;
      role: 'company_admin' | 'agent';
      availableForLeads?: boolean;
    }) =>
      (
        await api.post<{ member: TeamMember; reusedExistingLogin: boolean }>(
          '/api/team/users',
          body,
        )
      ).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['team', companyId] }),
  });
}

export function useUpdateTeamMemberMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({
      membershipId,
      ...body
    }: {
      membershipId: string;
      role?: 'company_admin' | 'agent';
      availableForLeads?: boolean;
    }) => (await api.patch<TeamMember>(`/api/team/members/${membershipId}`, body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team', companyId] });
      void qc.invalidateQueries({ queryKey: ['lead-assignees', companyId] });
    },
  });
}

export function useRemoveTeamMemberMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (membershipId: string) =>
      (await api.delete(`/api/team/members/${membershipId}`)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['team', companyId] });
      void qc.invalidateQueries({ queryKey: ['chats', companyId] });
      void qc.invalidateQueries({ queryKey: ['lead-counts', companyId] });
    },
  });
}

export function useResetMemberPasswordMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ membershipId, password }: { membershipId: string; password: string }) =>
      (await api.post(`/api/team/members/${membershipId}/password`, { password })).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['team', companyId] }),
  });
}

export function useChangeOwnPasswordMutation() {
  return useMutation({
    mutationFn: async (body: { currentPassword: string; password: string }) =>
      (await api.post<{ ok: boolean }>('/api/auth/change-password', body)).data,
  });
}

export function useCreateContactMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: { phone: string; name?: string; email?: string; tags?: string[] }) =>
      (await api.post<Contact>('/api/contacts', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts', companyId] });
    },
  });
}

export function useDeleteContactMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/contacts/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['contacts', companyId] }),
  });
}

export async function downloadContactsImportTemplate(): Promise<void> {
  const res = await api.get<Blob>('/api/contacts/import/template', { responseType: 'blob' });
  const blob = res.data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts-import-template.csv';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useImportContactsMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (input: { file: File; groupName?: string }) => {
      const body = new FormData();
      body.append('file', input.file);
      const gn = input.groupName?.trim();
      if (gn) {
        body.append('groupName', gn);
      }
      const { data } = await api.post<ContactImportResult>('/api/contacts/import', body, {
        transformRequest: (data, headers) => {
          if (data instanceof FormData) {
            if (typeof headers.delete === 'function') {
              headers.delete('Content-Type');
            } else {
              delete (headers as Record<string, unknown>)['Content-Type'];
            }
          }
          return data;
        },
      });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['contacts', companyId] });
      void qc.invalidateQueries({ queryKey: ['contact-groups', companyId] });
    },
  });
}

export function useCreateCampaignMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      name: string;
      templateId?: string;
      whatsappNumberId: string;
      contactGroupIds?: string[];
      contactIds?: string[];
      scheduledAt?: string;
    }) => (await api.post<Campaign>('/api/campaigns', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['campaigns', companyId] }),
  });
}

export function useCampaignActionMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'start' | 'pause' | 'resume' | 'delete' }) => {
      if (action === 'delete') return (await api.delete(`/api/campaigns/${id}`)).data;
      return (await api.post(`/api/campaigns/${id}/${action}`)).data;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['campaigns', companyId] }),
  });
}

export function useTemplateMutations() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  const create = useMutation({
    mutationFn: async (body: {
      name: string;
      body: string;
      language?: string;
      imageUrl?: string;
      category?: TemplateCategory;
    }) => (await api.post<Template>('/api/templates', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['templates', companyId] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/templates/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['templates', companyId] }),
  });
  /** Sends the template to Meta for review; status becomes PENDING. */
  const submit = useMutation({
    mutationFn: async (id: string) => (await api.post<Template>(`/api/templates/${id}/submit`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['templates', companyId] }),
  });
  /** Pulls the latest approval status for every template from Meta. */
  const sync = useMutation({
    mutationFn: async () =>
      (await api.post<{ checked: number; updated: number; remote: number }>('/api/templates/sync')).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['templates', companyId] }),
  });
  return { create, remove, submit, sync };
}

export function useAdminCreateCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string }) => (await api.post<CompanyRow>('/api/admin/companies', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-companies'] }),
  });
}

export function useAdminCreditWalletMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { companyId: string; amount: number; reason?: string }) =>
      (await api.post('/api/admin/wallet/credit', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-companies'] });
      void qc.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useUpdateCompanySettingsMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      name?: string;
      settings?: Record<string, unknown>;
      whatsappProvider?: 'twilio' | 'meta';
    }) => (await api.patch('/api/settings/company', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['wallet', companyId] });
      void qc.invalidateQueries({ queryKey: ['workspace-summary', companyId] });
    },
  });
}

export function useUpsertTwilioMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: { accountSid: string; authToken: string; friendlyName?: string }) =>
      (await api.post('/api/twilio/accounts', body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['twilio-accounts', companyId] }),
  });
}

export function useUpsertWhatsappNumberMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async (body: {
      provider?: 'twilio' | 'meta';
      twilioAccountId?: string;
      metaPhoneNumberId?: string;
      phoneNumber: string;
      friendlyName?: string;
      isDefault?: boolean;
    }) => (await api.post<WhatsappNumber>('/api/twilio/numbers', body)).data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['whatsapp-numbers', companyId] });
      void qc.invalidateQueries({ queryKey: ['workspace-summary', companyId] });
    },
  });
}

export function useSendChatMessageMutation() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  return useMutation({
    mutationFn: async ({
      chatId,
      body,
      mediaId,
    }: {
      chatId: string;
      body?: string;
      mediaId?: string;
    }) =>
      (
        await api.post<MessageRow>(`/api/chats/${chatId}/messages`, {
          ...(body ? { body } : {}),
          ...(mediaId ? { mediaId } : {}),
        })
      ).data,
    onSuccess: (_data, { chatId }) => {
      void qc.invalidateQueries({ queryKey: ['messages', companyId, chatId] });
      void qc.invalidateQueries({ queryKey: ['chats', companyId] });
    },
  });
}

export type UploadedAttachment = {
  mediaId: string;
  url: string;
  kind: MediaKind;
  mimeType: string;
  size: number;
  filename: string;
};

/**
 * Presign, PUT straight to storage, then confirm the size.
 *
 * The file never passes through the API — the browser uploads to the bucket itself,
 * which keeps a 100 MB PDF off the Node process. The confirm step is what records the
 * real size, and the server needs it to apply WhatsApp's per-type limits on send.
 */
export async function uploadChatAttachment(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedAttachment> {
  const contentType = file.type || 'application/octet-stream';
  const { data: presigned } = await api.post<{
    uploadUrl: string;
    mediaId: string;
    url: string;
    kind: MediaKind;
  }>('/api/media/presign', { filename: file.name, contentType, size: file.size });

  // A bare fetch, not `api`: the presigned URL carries its own signature and our
  // Authorization header would invalidate it.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presigned.uploadUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error('Upload failed — check your connection'));
    xhr.send(file);
  });

  const { data: completed } = await api.post<{
    mediaId: string;
    url: string;
    kind: MediaKind;
    mimeType: string;
    size: number;
  }>(`/api/media/${presigned.mediaId}/complete`, { size: file.size });

  return { ...completed, filename: file.name };
}

/** Re-signs an attachment whose read URL has expired mid-session. */
export async function refreshMediaUrl(mediaId: string): Promise<string> {
  const { data } = await api.get<{ url: string }>(`/api/media/${mediaId}/url`);
  return data.url;
}

/* --------------------------------------------------- products & automation */

export function useProductsQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['products', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<Product[]>('/api/products')).data,
  });
}

export type ProductInput = {
  name: string;
  description?: string;
  keywords?: string[];
  adIds?: string[];
  campaignNames?: string[];
  whatsappNumberIds?: string[];
  crmLabel?: string;
  active?: boolean;
};

export function useProductMutations() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['products', companyId] });

  const create = useMutation({
    mutationFn: async (body: ProductInput) => (await api.post<Product>('/api/products', body)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...body }: ProductInput & { id: string }) =>
      (await api.patch<Product>(`/api/products/${id}`, body)).data,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/products/${id}`)).data,
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useAutoResponsesQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  const workspaceRole = useAuthStore((s) => s.workspaceRole);
  return useQuery({
    queryKey: ['auto-responses', companyId],
    enabled: Boolean(companyId) && workspaceRole === 'company_admin',
    queryFn: async () => (await api.get<AutoResponseRule[]>('/api/auto-responses')).data,
  });
}

export type AutoResponseInput = Partial<Omit<AutoResponseRule, '_id' | 'stats'>> & {
  name?: string;
};

export function useAutoResponseMutations() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.companyId);
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['auto-responses', companyId] });

  const create = useMutation({
    mutationFn: async (body: AutoResponseInput) =>
      (await api.post<AutoResponseRule>('/api/auto-responses', body)).data,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...body }: AutoResponseInput & { id: string }) =>
      (await api.patch<AutoResponseRule>(`/api/auto-responses/${id}`, body)).data,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/api/auto-responses/${id}`)).data,
    onSuccess: invalidate,
  });
  /** Dry run: which rule would answer a lead that said this? */
  const preview = useMutation({
    mutationFn: async (body: {
      messageBody: string;
      productId?: string;
      adSourceId?: string;
      adHeadline?: string;
      isAdLead?: boolean;
    }) =>
      (
        await api.post<{
          match: { ruleId: string; name: string; actionType: string; body?: string } | null;
        }>('/api/auto-responses/preview', body)
      ).data,
  });
  return { create, update, remove, preview };
}
