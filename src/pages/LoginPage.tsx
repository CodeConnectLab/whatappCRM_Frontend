import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { useAuthStore } from '../store/authStore.ts';
import { IconCheck, IconMoon, IconSun, LogoMark } from '../components/Icons.tsx';

const HIGHLIGHTS = [
  'Shared inbox with realtime WhatsApp threads',
  'Approved templates and scheduled campaigns',
  'Credit-aware, multi-tenant workspaces',
];

export function LoginPage() {
  const token = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  const theme = useAuthStore((s) => s.theme);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (token) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        const { data } = await api.post<{
          accessToken: string;
          refreshToken: string;
          user: { id: string; email: string; name: string; isSuperAdmin?: boolean };
        }>('/api/auth/login', { email, password });
        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            isSuperAdmin: data.user.isSuperAdmin,
          },
        });
      } else {
        const { data } = await api.post<{
          accessToken: string;
          refreshToken: string;
          user: { id: string; email: string; name: string; isSuperAdmin?: boolean };
          company: { id: string; name: string };
        }>('/api/auth/register', { email, password, name, companyName });
        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            id: String(data.user.id),
            email: data.user.email,
            name: data.user.name,
            isSuperAdmin: data.user.isSuperAdmin,
          },
          companyId: String(data.company.id),
          companyName: data.company.name,
        });
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 overflow-y-auto">
      <button
        type="button"
        className="dc-btn dc-btn-sm absolute right-4 top-4 z-10 w-[30px] px-0 md:right-6 md:top-6"
        onClick={() => toggleTheme()}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
      </button>

      {/* Brand rail */}
      <aside className="hidden w-[42%] max-w-[520px] flex-col justify-between border-r border-line bg-surface p-10 lg:flex">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-md font-semibold text-ink">WTSP Console</span>
              <span className="text-xs text-ink-4">Business account</span>
            </div>
          </div>

          <p className="mt-10 max-w-sm text-2xl font-semibold leading-snug tracking-[-0.01em] text-ink">
            One place to run WhatsApp for your whole team.
          </p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {HIGHLIGHTS.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-base text-ink-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <IconCheck className="h-2.5 w-2.5" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-4">© {new Date().getFullYear()} Your workspace</p>
      </aside>

      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <LogoMark className="h-8 w-8" />
            <div className="flex flex-col leading-tight">
              <span className="text-md font-semibold text-ink">WTSP Console</span>
              <span className="text-xs text-ink-4">Sign in to continue</span>
            </div>
          </div>

          <div className="rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7">
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink">
              {mode === 'login' ? 'Welcome back' : 'Create workspace'}
            </h1>
            <p className="mt-1 text-base text-ink-3">
              {mode === 'login' ? 'Sign in with your company account' : 'Register to get started'}
            </p>

            <form className="mt-5 flex flex-col gap-3.5" onSubmit={onSubmit}>
              {mode === 'register' ? (
                <>
                  <Field label="Your name" value={name} onChange={setName} />
                  <Field label="Company name" value={companyName} onChange={setCompanyName} />
                </>
              ) : null}
              <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {error ? <p className="dc-note dc-note-danger">{error}</p> : null}

              <button type="submit" className="dc-btn dc-btn-primary mt-1 h-10 w-full font-medium">
                {mode === 'login' ? 'Sign in' : 'Create company'}
              </button>
            </form>

            <button
              type="button"
              className="mt-3.5 w-full text-center text-base text-brand hover:text-brand-strong"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="dc-label">
      <span className="dc-label-text">{props.label}</span>
      <input
        className="dc-input"
        value={props.value}
        type={props.type ?? 'text'}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        required
      />
    </label>
  );
}
