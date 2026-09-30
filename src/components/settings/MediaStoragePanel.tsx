import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api.ts';
import { apiErrorMessage } from '../../lib/errors.ts';
import { IconCheck, IconClose, IconRefresh } from '../Icons.tsx';
import { CardNote, WorkspaceAlert, WorkspaceAlertError, WorkspaceCard } from '../workspace/WorkspaceSurface.tsx';

type DiagnosticStep = { step: string; ok: boolean; detail?: string; code?: string };

type MediaDiagnostics = {
  ok: boolean;
  configured: boolean;
  bucket?: string;
  region?: string;
  endpoint?: string;
  steps: DiagnosticStep[];
  advice: string[];
};

/**
 * Proves whether attachments actually work.
 *
 * Every media problem here looks the same from the app — "upload failed" — because
 * signing an upload URL is local crypto that succeeds even when the bucket is missing
 * or the credentials cannot write. This runs the real round trip on the server and
 * reports which step broke and what to change.
 */
export function MediaStoragePanel() {
  const run = useMutation({
    mutationFn: async () => (await api.get<MediaDiagnostics>('/api/media/diagnostics')).data,
  });

  const result = run.data;

  return (
    <WorkspaceCard
      title="Media storage"
      action={
        <button
          type="button"
          className="dc-btn dc-btn-sm"
          disabled={run.isPending}
          onClick={() => run.mutate()}
        >
          <IconRefresh className="h-3.5 w-3.5" />
          {run.isPending ? 'Testing…' : 'Test media storage'}
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <CardNote>
          Images, videos and documents are uploaded straight from the browser to your
          storage bucket, and incoming WhatsApp files are copied into it within minutes of
          arriving. If attachments are failing, run this — it writes a test file, reads it
          back, and names the step that broke.
        </CardNote>

        {run.isError ? <WorkspaceAlertError>{apiErrorMessage(run.error)}</WorkspaceAlertError> : null}

        {result ? (
          <>
            {result.ok ? (
              <WorkspaceAlert tone="brand">
                Storage is working. The server can write to the bucket and read it back.
              </WorkspaceAlert>
            ) : (
              <WorkspaceAlert tone="danger">
                Attachments will not work until the failing step below is fixed.
              </WorkspaceAlert>
            )}

            {result.bucket ? (
              <div className="flex flex-wrap gap-1.5">
                <span className="dc-badge font-mono text-2xs">{result.bucket}</span>
                {result.region ? (
                  <span className="dc-badge font-mono text-2xs">{result.region}</span>
                ) : null}
                {result.endpoint ? (
                  <span className="dc-badge font-mono text-2xs">{result.endpoint}</span>
                ) : null}
              </div>
            ) : null}

            <ol className="flex flex-col gap-1.5">
              {result.steps.map((s) => (
                <li
                  key={s.step}
                  className="flex items-start gap-2 rounded-control border border-line-soft bg-subtle px-2.5 py-2"
                >
                  <span
                    className={`mt-0.5 shrink-0 ${s.ok ? 'text-brand-ink' : 'text-danger'}`}
                    aria-hidden
                  >
                    {s.ok ? <IconCheck className="h-3.5 w-3.5" /> : <IconClose className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex min-w-0 flex-col gap-px">
                    <span className="text-sm text-ink">{s.step}</span>
                    {s.detail || s.code ? (
                      <span className="break-words font-mono text-2xs text-ink-4">
                        {[s.code, s.detail].filter(Boolean).join(' · ')}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>

            {result.advice.length ? (
              <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-3">
                <span className="text-sm font-medium text-ink">What to do</span>
                <ul className="flex list-disc flex-col gap-1.5 pl-4">
                  {result.advice.map((a) => (
                    <li key={a} className="text-sm leading-relaxed text-ink-2">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </WorkspaceCard>
  );
}
