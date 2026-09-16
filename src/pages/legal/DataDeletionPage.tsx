import { ReactNode } from 'react';
import {
  LegalLayout,
  LegalList,
  LegalNote,
  LegalSection,
  LegalSubhead,
  LegalTable,
} from './LegalLayout.tsx';
import {
  APP_URL,
  CONTACT_EMAIL,
  EFFECTIVE_DATE,
  GRIEVANCE_OFFICER,
  LAST_UPDATED,
  LEGAL_ENTITY,
  LEGAL_ENTITY_DESCRIPTOR,
  PRODUCT_NAME,
  RETENTION,
} from './legalConfig.ts';

/** Numbered step in a procedure. */
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="dc-avatar mt-0.5 h-6 w-6 shrink-0 text-xs tabular-nums">{n}</span>
      <div className="flex flex-col gap-1.5">
        <strong className="text-md text-ink">{title}</strong>
        <div className="flex flex-col gap-2 text-md leading-relaxed text-ink-2">{children}</div>
      </div>
    </li>
  );
}

export function DataDeletionPage() {
  return (
    <LegalLayout
      title="Data Deletion Instructions"
      subtitle={`How to have your data deleted from ${PRODUCT_NAME}. No login needed to read this page.`}
    >
      <LegalNote>
        <strong>Which one are you?</strong>
        <br />
        If you <strong>run a business</strong> that uses {PRODUCT_NAME} to answer WhatsApp messages,
        read section 1.
        <br />
        If you <strong>messaged a business</strong> on WhatsApp and want your conversation deleted,
        read section 2.
      </LegalNote>

      {/* ------------------------------------------------------------------ 1 */}
      <LegalSection id="business-customer" n={1} title="If you are a business customer">
        <p>
          Deleting your workspace removes everything inside it: user accounts, chats, messages,
          media, contacts, templates, campaigns and connected credentials.
        </p>
        <ol className="flex flex-col gap-4">
          <Step n={1} title="Export anything you want to keep">
            <p>
              Sign in at{' '}
              <a className="text-brand hover:text-brand-strong" href={APP_URL}>
                {APP_URL}
              </a>{' '}
              and export your contacts and chat history. Once deletion runs, nothing can be
              recovered.
            </p>
          </Step>
          <Step n={2} title="Disconnect your Meta and Twilio credentials">
            <p>
              In <strong>Settings</strong>, remove the saved credentials. They are erased from our
              database at once. You can also revoke our access from your own Meta Business Manager.
            </p>
          </Step>
          <Step n={3} title="Email us to close the workspace">
            <p>
              Write to{' '}
              <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              from your registered admin email, with the subject{' '}
              <strong>"Delete my workspace"</strong>. Include your workspace name and the WhatsApp
              Business number connected to it.
            </p>
          </Step>
          <Step n={4} title="We confirm, then delete">
            <p>
              We verify the request came from a workspace admin and delete within{' '}
              <strong>{RETENTION.deletionSlaDays} days</strong> of confirmation. You get written
              confirmation when it is done.
            </p>
          </Step>
        </ol>
        <p>
          You can also delete a single contact or chat yourself from the app at any time. That
          removes it from our live database immediately.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="end-consumer" n={2} title="If you messaged a business on WhatsApp">
        <p>
          You are not our user. A business you contacted uses our software to read and reply to your
          messages, and that business — not us — decides what to keep. You have two routes.
        </p>

        <LegalSubhead>Route A — ask the business directly (fastest)</LegalSubhead>
        <p>
          Message the business on the same WhatsApp number you used, or email it, and ask it to
          delete your chat history and contact record. It can do that itself, immediately, and it is
          the party legally responsible for your data.
        </p>

        <LegalSubhead>Route B — write to us</LegalSubhead>
        <p>
          If the business does not respond, email{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          with the subject <strong>"Data deletion request"</strong> and include:
        </p>
        <LegalList>
          <li>
            <strong>The WhatsApp number you messaged from</strong>, in full international format
            (for example +91 98765 43210). This is how we locate your records.
          </li>
          <li>
            <strong>The business you contacted</strong> — its name, or the WhatsApp number you
            messaged.
          </li>
          <li>
            <strong>What you want deleted</strong> — your conversation history, your contact record,
            or both.
          </li>
        </LegalList>
        <p>
          Please do not send ID documents, passwords or payment details. We do not need them and
          will not keep them.
        </p>
        <p>
          We acknowledge within {GRIEVANCE_OFFICER.acknowledgeHours} hours, identify the business
          whose workspace holds your data, and pass your request to it. As the data processor we act
          on that business's instruction. We complete deletion and write back to you within{' '}
          <strong>{RETENTION.deletionSlaDays} days</strong>, telling you what was deleted or why it
          was not.
        </p>
        <p>
          Deleting your data here does not delete messages stored on your own phone, on the
          business's other systems, or anything WhatsApp itself holds.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 3 */}
      <LegalSection id="what-is-deleted" n={3} title="What gets deleted, and what is kept">
        <LegalTable head={['Data', 'Outcome']}>
          <tr>
            <td>Chat threads and message content</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
          </tr>
          <tr>
            <td>Media files — images, video, audio, documents</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
          </tr>
          <tr>
            <td>Contact records, tags and ad-attribution data</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
          </tr>
          <tr>
            <td>User accounts, workspace settings and connected credentials</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span> on workspace deletion
            </td>
          </tr>
          <tr>
            <td>Server logs and encrypted backups</td>
            <td>
              <span className="dc-badge">Expires</span> — logs after {RETENTION.serverLogDays} days,
              backups within {RETENTION.backupDays} days. Deleted data is never restored into the
              live service.
            </td>
          </tr>
          <tr>
            <td>Billing records, invoices and the credit ledger</td>
            <td>
              <span className="dc-badge dc-badge-warn">Retained</span> {RETENTION.billingYears}{' '}
              years, as Indian tax law requires. These hold workspace and payment records, not
              conversation content.
            </td>
          </tr>
        </LegalTable>
      </LegalSection>

      {/* ------------------------------------------------------------------ 4 */}
      <LegalSection id="contact" n={4} title="Where to write, and how fast we reply">
        <div className="dc-card-pad">
          <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm font-medium text-ink-3">Deletion requests</dt>
            <dd className="text-md text-ink">
              <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </dd>

            <dt className="text-sm font-medium text-ink-3">Subject line</dt>
            <dd className="text-md text-ink">
              "Delete my workspace" or "Data deletion request"
            </dd>

            <dt className="text-sm font-medium text-ink-3">Acknowledgement</dt>
            <dd className="text-md text-ink">
              Within {GRIEVANCE_OFFICER.acknowledgeHours} hours
            </dd>

            <dt className="text-sm font-medium text-ink-3">Completed within</dt>
            <dd className="text-md text-ink">{RETENTION.deletionSlaDays} days</dd>

            <dt className="text-sm font-medium text-ink-3">If you are unhappy</dt>
            <dd className="text-md text-ink">
              Escalate to our Grievance Officer, {GRIEVANCE_OFFICER.name} (
              {GRIEVANCE_OFFICER.designation}) at{' '}
              <a
                className="text-brand hover:text-brand-strong"
                href={`mailto:${GRIEVANCE_OFFICER.email}`}
              >
                {GRIEVANCE_OFFICER.email}
              </a>
              . Full details in the{' '}
              <a className="text-brand hover:text-brand-strong" href="/privacy#grievance">
                Privacy Policy
              </a>
              .
            </dd>

            <dt className="text-sm font-medium text-ink-3">Operator</dt>
            <dd className="text-md text-ink">
              {LEGAL_ENTITY} — {LEGAL_ENTITY_DESCRIPTOR}
            </dd>

            <dt className="text-sm font-medium text-ink-3">Effective date</dt>
            <dd className="text-md text-ink">{EFFECTIVE_DATE}</dd>

            <dt className="text-sm font-medium text-ink-3">Last updated</dt>
            <dd className="text-md text-ink">{LAST_UPDATED}</dd>
          </dl>
        </div>
        <p className="text-sm text-ink-3">
          This page lives permanently at{' '}
          <a className="text-brand hover:text-brand-strong" href={`${APP_URL}/data-deletion`}>
            {APP_URL}/data-deletion
          </a>{' '}
          and never requires a login.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
