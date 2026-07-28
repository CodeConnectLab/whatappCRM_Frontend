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
  Campaign,
  ChatRow,
  CompanyRow,
  Contact,
  ContactGroup,
  ContactImportResult,
  MessageRow,
  MetaWhatsappConfig,
  Paginated,
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

export function useActivityLogsQuery(page: number) {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['activity-logs', companyId, page],
    enabled: Boolean(companyId),
    queryFn: async () =>
      (await api.get<Paginated<ActivityLogRow>>('/api/activity-logs', { params: { page, limit: 25 } })).data,
  });
}

export function useChatsQuery() {
  const companyId = useAuthStore((s) => s.companyId);
  return useQuery({
    queryKey: ['chats', companyId],
    enabled: Boolean(companyId),
    queryFn: async () => (await api.get<ChatRow[]>('/api/chats')).data,
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
    mutationFn: async ({ chatId, body }: { chatId: string; body: string }) =>
      (await api.post<MessageRow>(`/api/chats/${chatId}/messages`, { body })).data,
    onSuccess: (_data, { chatId }) => {
      void qc.invalidateQueries({ queryKey: ['messages', companyId, chatId] });
      void qc.invalidateQueries({ queryKey: ['chats', companyId] });
    },
  });
}
