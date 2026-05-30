import { FormEvent, useState } from 'react';
import {
  useTwilioAccountsQuery,
  useUpsertTwilioMutation,
  useUpsertWhatsappNumberMutation,
} from '../../hooks/apiHooks.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { WorkspaceCard } from '../workspace/WorkspaceSurface.tsx';

const field =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

const primaryBtn =
  'rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 dark:shadow-emerald-900/30';

type Props = {
  onError: (message: string) => void;
};

export function TwilioSettingsPanels({ onError }: Props) {
  const companyId = useAuthStore((s) => s.companyId);

  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [twilioFriendly, setTwilioFriendly] = useState('');
  const [waAccountId, setWaAccountId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [waFriendly, setWaFriendly] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  const accounts = useTwilioAccountsQuery();
  const upsertTwilio = useUpsertTwilioMutation();
  const upsertWa = useUpsertWhatsappNumberMutation();

  async function onTwilio(e: FormEvent) {
    e.preventDefault();
    try {
      await upsertTwilio.mutateAsync({
        accountSid,
        authToken,
        friendlyName: twilioFriendly || undefined,
      });
      setAuthToken('');
    } catch (er) {
      onError(apiErrorMessage(er));
    }
  }

  async function onNumber(e: FormEvent) {
    e.preventDefault();
    try {
      await upsertWa.mutateAsync({
        provider: 'twilio',
        twilioAccountId: waAccountId,
        phoneNumber,
        friendlyName: waFriendly || undefined,
        isDefault,
      });
      setPhoneNumber('');
    } catch (er) {
      onError(apiErrorMessage(er));
    }
  }

  return (
    <>
      <WorkspaceCard title="Twilio account">
        <form onSubmit={onTwilio} className="space-y-4">
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Link your Twilio account. The auth token is stored encrypted and never returned to the browser.
          </p>
          <div>
            <label htmlFor="twilio-sid" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Account SID
            </label>
            <input
              id="twilio-sid"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              placeholder="ACxxxxxxxx"
              className={`${field} mt-1.5 font-mono text-[13px]`}
              required
            />
          </div>
          <div>
            <label htmlFor="twilio-token" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Auth token
            </label>
            <input
              id="twilio-token"
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="********"
              className={`${field} mt-1.5`}
              required
            />
          </div>
          <div>
            <label htmlFor="twilio-friendly" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Friendly name <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="twilio-friendly"
              value={twilioFriendly}
              onChange={(e) => setTwilioFriendly(e.target.value)}
              placeholder="Production subaccount"
              className={`${field} mt-1.5`}
            />
          </div>
          <button type="submit" disabled={upsertTwilio.isPending || !companyId} className={primaryBtn}>
            {upsertTwilio.isPending ? 'Saving…' : 'Save Twilio account'}
          </button>
        </form>
      </WorkspaceCard>

      <WorkspaceCard title="Twilio WhatsApp sender">
        <form onSubmit={onNumber} className="space-y-4">
          <div>
            <label htmlFor="wa-account" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Twilio account
            </label>
            <select
              id="wa-account"
              value={waAccountId}
              onChange={(e) => setWaAccountId(e.target.value)}
              className={`${field} mt-1.5`}
              required
            >
              <option value="">Select account</option>
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountSid} {a.friendlyName ? `(${a.friendlyName})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wa-phone" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              WhatsApp-enabled number (E.164)
            </label>
            <input
              id="wa-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1"
              className={`${field} mt-1.5 font-mono text-[13px]`}
              required
            />
          </div>
          <div>
            <label htmlFor="wa-label" className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Display label <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="wa-label"
              value={waFriendly}
              onChange={(e) => setWaFriendly(e.target.value)}
              placeholder="Support line"
              className={`${field} mt-1.5`}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-900"
            />
            Set as default outbound sender
          </label>
          <button type="submit" disabled={upsertWa.isPending || !companyId} className={primaryBtn}>
            {upsertWa.isPending ? 'Saving…' : 'Save Twilio sender'}
          </button>
        </form>
      </WorkspaceCard>
    </>
  );
}
