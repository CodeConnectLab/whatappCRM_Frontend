import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean;
};

export type MembershipSummary = {
  companyId: string;
  companyName: string;
  role: 'company_admin' | 'agent';
};

export type MeResponse = {
  user: AuthUser;
  memberships: MembershipSummary[];
  companies?: { id: string; name: string; slug: string }[];
};

function deriveWorkspaceRole(
  user: AuthUser | null,
  companyId: string | null,
  memberships: MembershipSummary[],
): 'company_admin' | 'agent' | null {
  if (!user) return null;
  if (user.isSuperAdmin) return 'company_admin';
  if (!companyId) return null;
  const m = memberships.find((x) => x.companyId === companyId);
  if (!m) return null;
  return m.role === 'company_admin' ? 'company_admin' : 'agent';
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  companyId: string | null;
  companyName: string | null;
  memberships: MembershipSummary[];
  workspaceRole: 'company_admin' | 'agent' | null;
  theme: 'light' | 'dark';
  sessionReady: boolean;
  setAuth: (input: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    companyId?: string | null;
    companyName?: string | null;
  }) => void;
  setTokens: (access: string, refresh: string) => void;
  setCompany: (companyId: string | null, companyName?: string | null) => void;
  applyMe: (data: MeResponse) => void;
  setSessionReady: (ready: boolean) => void;
  logout: () => void;
  toggleTheme: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      companyId: null,
      companyName: null,
      memberships: [],
      workspaceRole: null,
      theme: 'light',
      sessionReady: false,
      setAuth: ({ accessToken, refreshToken, user, companyId, companyName }) => {
        const memberships = get().memberships;
        const cid = companyId ?? get().companyId;
        set({
          accessToken,
          refreshToken,
          user,
          companyId: cid,
          companyName: companyName ?? get().companyName,
          workspaceRole: deriveWorkspaceRole(user, cid, memberships),
        });
      },
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setCompany: (companyId, companyName) => {
        const { user, memberships } = get();
        set({
          companyId,
          companyName: companyName ?? get().companyName,
          workspaceRole: deriveWorkspaceRole(user, companyId, memberships),
        });
      },
      applyMe: (data) => {
        const { user, memberships } = data;
        const prevCompanyId = get().companyId;
        let nextCompanyId: string | null = prevCompanyId;

        if (!user.isSuperAdmin) {
          const stillMember =
            prevCompanyId && memberships.some((m) => m.companyId === prevCompanyId);
          nextCompanyId = stillMember ? prevCompanyId : (memberships[0]?.companyId ?? null);
        } else if (prevCompanyId && !memberships.some((m) => m.companyId === prevCompanyId)) {
          // Super admin may work in a company they do not belong to — keep selection.
          nextCompanyId = prevCompanyId;
        }

        const companyName =
          memberships.find((m) => m.companyId === nextCompanyId)?.companyName ??
          get().companyName;

        set({
          user,
          memberships,
          companyId: nextCompanyId,
          companyName: companyName ?? null,
          workspaceRole: deriveWorkspaceRole(user, nextCompanyId, memberships),
          sessionReady: true,
        });
      },
      setSessionReady: (sessionReady) => set({ sessionReady }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          companyId: null,
          companyName: null,
          memberships: [],
          workspaceRole: null,
          sessionReady: false,
        }),
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next === 'dark');
          }
          return { theme: next };
        }),
    }),
    {
      name: 'wtsp-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
        companyId: s.companyId,
        companyName: s.companyName,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark' && typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      },
    },
  ),
);
