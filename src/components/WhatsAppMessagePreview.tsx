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
            className="rounded-[3px] border border-warn-line bg-warn-soft px-0.5 font-mono text-[0.9em] text-warn"
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
  const rendered = useMemo(
    () => applyTemplatePreview(props.body || ' ', sample),
    [props.body, sample.name, sample.phone, sample.email],
  );

  const displayBody = props.showRawPlaceholders ? props.body : rendered;
  const safeImage = props.imageUrl?.trim();

  return (
    <div className="flex min-h-[180px] flex-col rounded-card border border-line bg-subtle p-4">
      {props.caption ? (
        <p className="mb-3 text-center text-2xs uppercase tracking-[0.06em] text-ink-4">{props.caption}</p>
      ) : null}
      <div className="flex flex-1 flex-col items-end justify-end gap-2">
        <div className="max-w-[95%] overflow-hidden rounded-[10px] rounded-br-[3px] border border-brand-line bg-brand-soft">
          {safeImage ? (
            <img
              src={safeImage}
              alt=""
              className="max-h-48 w-full border-b border-brand-line object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
          <div className="px-3 py-2.5 text-base leading-relaxed text-ink">
            {props.showRawPlaceholders ? (
              <HighlightPlaceholders text={displayBody || 'Your message…'} />
            ) : (
              <span className="whitespace-pre-wrap break-words">{displayBody || 'Your message…'}</span>
            )}
          </div>
        </div>
        <p className="self-center text-2xs text-ink-4">
          {props.showRawPlaceholders
            ? 'Highlighted tokens are filled per contact when sending.'
            : 'Preview with sample data'}
        </p>
      </div>
    </div>
  );
}
