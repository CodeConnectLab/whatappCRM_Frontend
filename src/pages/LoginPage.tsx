import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { apiErrorMessage } from '../lib/errors.ts';
import { useAuthStore } from '../store/authStore.ts';
import { IconMoon, IconSun, LogoMark } from '../components/Icons.tsx';

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
        }>('/api/auth/register', {
          email,
          password,
          name,
          companyName,
        });
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
      <div className="absolute right-4 top-4 z-10 md:right-8 md:top-8">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 md:border-zinc-200 md:bg-white md:text-zinc-700 md:shadow-sm md:hover:bg-zinc-50 dark:md:border-zinc-700 dark:md:bg-zinc-900 dark:md:text-zinc-200"
          onClick={() => toggleTheme()}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5 md:text-zinc-700" />}
        </button>
      </div>

      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-11 shadow-lg" />
            <div>
              <p className="text-lg font-bold tracking-tight">WTSP Console</p>
              <p className="text-sm text-emerald-100/90">WhatsApp operations hub</p>
            </div>
          </div>
          <p className="mt-12 max-w-sm text-lg font-medium leading-relaxed text-white/95">
            Run campaigns, templates, and live chats — multi-tenant, credit-aware, production-ready.
          </p>
        </div>
        <p className="relative text-xs text-emerald-200/80">© {new Date().getFullYear()} Your workspace</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 md:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-10 w-10" />
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">WTSP Console</p>
              <p className="text-xs text-zinc-500">Sign in to continue</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-card dark:border-zinc-800/80 dark:bg-zinc-900 sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create workspace'}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === 'login' ? 'Sign in with your company account' : 'Register to get started'}
            </p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500"
              >
                {mode === 'login' ? 'Sign in' : 'Create company'}
              </button>
            </form>

            <button
              type="button"
              className="mt-4 w-full text-center text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
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
    <label className="block">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{props.label}</span>
      <input
        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
        value={props.value}
        type={props.type ?? 'text'}
        autoComplete={props.autoComplete}
        onChange={(e) => props.onChange(e.target.value)}
        required
      />
    </label>
  );
}
