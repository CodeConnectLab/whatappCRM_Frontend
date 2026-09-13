import { FormEvent, useState } from 'react';
import {
  useTwilioAccountsQuery,
  useUpsertTwilioMutation,
  useUpsertWhatsappNumberMutation,
} from '../../hooks/apiHooks.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { WorkspaceCard } from '../workspace/WorkspaceSurface.tsx';

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
        <form onSubmit={onTwilio} className="flex flex-col gap-3.5">
          <p className="text-sm leading-relaxed text-ink-3">
            Link your Twilio account. The auth token is stored encrypted and never returned to the browser.
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="dc-label">
              <span className="dc-label-text">Account SID</span>
              <input
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                placeholder="ACxxxxxxxx"
                className="dc-input font-mono text-sm"
                required
              />
            </label>
            <label className="dc-label">
              <span className="dc-label-text">Auth token</span>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="••••••••"
                className="dc-input"
                required
              />
            </label>
          </div>
          <label className="dc-label">
            <span className="dc-label-text">
              Friendly name <span className="font-normal text-ink-4">(optional)</span>
            </span>
            <input
              value={twilioFriendly}
              onChange={(e) => setTwilioFriendly(e.target.value)}
              placeholder="Production subaccount"
              className="dc-input"
            />
          </label>
          <div className="flex border-t border-line-soft pt-3.5">
            <button
              type="submit"
              disabled={upsertTwilio.isPending || !companyId}
              className="dc-btn dc-btn-primary ml-auto"
            >
              {upsertTwilio.isPending ? 'Saving…' : 'Save Twilio account'}
            </button>
          </div>
        </form>
      </WorkspaceCard>

      <WorkspaceCard title="Twilio WhatsApp sender">
        <form onSubmit={onNumber} className="flex flex-col gap-3.5">
          <label className="dc-label">
            <span className="dc-label-text">Twilio account</span>
            <select
              value={waAccountId}
              onChange={(e) => setWaAccountId(e.target.value)}
              className="dc-select"
              required
            >
              <option value="">Select account</option>
              {(accounts.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountSid} {a.friendlyName ? `(${a.friendlyName})` : ''}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className="dc-label">
              <span className="dc-label-text">WhatsApp-enabled number (E.164)</span>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1…"
                className="dc-input font-mono text-sm"
                required
              />
            </label>
            <label className="dc-label">
              <span className="dc-label-text">
                Display label <span className="font-normal text-ink-4">(optional)</span>
              </span>
              <input
                value={waFriendly}
                onChange={(e) => setWaFriendly(e.target.value)}
                placeholder="Support line"
                className="dc-input"
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-base text-ink-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="dc-checkbox"
            />
            Set as default outbound sender
          </label>
          <div className="flex border-t border-line-soft pt-3.5">
            <button
              type="submit"
              disabled={upsertWa.isPending || !companyId}
              className="dc-btn dc-btn-primary ml-auto"
            >
              {upsertWa.isPending ? 'Saving…' : 'Save Twilio sender'}
            </button>
          </div>
        </form>
      </WorkspaceCard>
    </>
  );
}
