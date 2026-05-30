import { useMemo } from 'react';
import {
  applyTemplatePreview,
  DEFAULT_PREVIEW_SAMPLE,
  type PlaceholderSample,
} from '../lib/templatePlaceholders.ts';

function HighlightPlaceholders({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\{\{[^}]+\}\}$/.test(part) ? (
          <mark
            key={i}
            className="rounded px-0.5 font-mono text-[0.9em] text-amber-950 dark:bg-amber-500/35 dark:text-amber-50"
          >
            {part}
          </mark>
        ) : (
          <span key={i} className="whitespace-pre-wrap break-words">
            {part}
          </span>
        ),
      )}
    </>
  );
}

export function WhatsAppMessagePreview(props: {
  body: string;
  imageUrl?: string;
  /** When true, show placeholder tokens highlighted; when false, show sample-filled text */
  showRawPlaceholders?: boolean;
  sample?: PlaceholderSample;
  /** Optional label above the bubble */
  caption?: string;
}) {
  const sample = props.sample ?? DEFAULT_PREVIEW_SAMPLE;
  const rendered = useMemo(() => {
    return applyTemplatePreview(props.body || ' ', sample);
  }, [
    props.body,
    sample.name,
    sample.phone,
    sample.email,
  ]);

  const displayBody = props.showRawPlaceholders ? props.body : rendered;
  const safeImage = props.imageUrl?.trim();

  return (
    <div className="flex min-h-[200px] flex-col rounded-2xl border border-zinc-200/90 bg-[#e5ddd5] bg-[length:64px_64px] p-4 shadow-inner dark:border-zinc-700/80 dark:bg-[#0b141a] md:p-5">
      {props.caption ? (
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {props.caption}
        </p>
      ) : null}
      <div className="flex flex-1 flex-col items-end justify-end">
        <div
          className="max-w-[95%] overflow-hidden rounded-lg rounded-br-sm shadow-md ring-1 ring-black/5 dark:ring-white/10"
          style={{ boxShadow: '0 1px 0.5px rgba(0,0,0,.13)' }}
        >
          {safeImage ? (
            <div className="relative max-h-48 bg-zinc-900">
              <img
                src={safeImage}
                alt=""
                className="max-h-48 w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : null}
          <div className="bg-[#d9fdd3] px-3 py-2 text-[14px] leading-snug text-zinc-900 dark:bg-emerald-900/55 dark:text-emerald-50">
            {props.showRawPlaceholders ? (
              <HighlightPlaceholders text={displayBody || 'Your message…'} />
            ) : (
              <span className="whitespace-pre-wrap break-words">{displayBody || 'Your message…'}</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-zinc-500 dark:text-zinc-500">
          {props.showRawPlaceholders
            ? 'Tokens in amber are filled per contact when sending.'
            : 'Preview with sample data'}
        </p>
      </div>
    </div>
  );
}
