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
              Go to <strong>Settings</strong> and remove the saved Meta credentials (and Twilio, if
              used). They are erased from our database at once. You can also revoke our access from
              your own Meta Business Manager, under Business Settings &rarr; Apps.
            </p>
          </Step>
          <Step n={3} title="Email us to close the workspace">
            <p>
              Write to{' '}
              <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{' '}
              from your registered admin email address, with the subject{' '}
              <strong>"Delete my workspace"</strong>. Include your workspace / company name and the
              WhatsApp Business phone number connected to it.
            </p>
          </Step>
          <Step n={4} title="We confirm, then delete">
            <p>
              We verify the request came from a workspace admin, confirm by email, and then delete.
              Deletion completes within{' '}
              <strong>{RETENTION.deletionSlaDays} days</strong> of confirmation, and in every case
              within {RETENTION.conversationDaysAfterClosure} days of the account closing. You get a
              written confirmation when it is done.
            </p>
          </Step>
        </ol>
        <p>
          Deleting individual records instead of the whole workspace? You can delete a single
          contact or chat yourself from the app, at any time. That removes it from our live database
          immediately.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="end-consumer" n={2} title="If you messaged a business on WhatsApp">
        <p>
          You are not our user. A business you contacted uses our software to read and reply to your
          messages, and that business — not us — decides what to keep. You have two routes, and the
          first is faster.
        </p>

        <LegalSubhead>Route A — ask the business directly (fastest)</LegalSubhead>
        <p>
          Message the business on the same WhatsApp number you used, or email it, and ask it to
          delete your chat history and contact record. It can do that itself, immediately, from its
          own inbox. It is also the party legally responsible for your data.
        </p>

        <LegalSubhead>Route B — write to us</LegalSubhead>
        <p>
          If the business does not respond, or you would rather come to us, email{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          with the subject <strong>"Data deletion request"</strong>.
        </p>
        <ol className="flex flex-col gap-4">
          <Step n={1} title="Tell us who you are and what to delete">
            <p>Include all of the following, or we may not be able to find your records:</p>
            <LegalList>
              <li>
                <strong>The WhatsApp phone number you messaged from</strong>, in full international
                format (for example +91 98765 43210). This is how we locate your records.
              </li>
              <li>
                <strong>The business you contacted</strong> — its name, or the WhatsApp number you
                messaged.
              </li>
              <li>
                <strong>What you want deleted</strong> — your whole conversation history, your
                contact record, or both.
              </li>
              <li>
                <strong>Roughly when</strong> you contacted the business, if you remember. It helps
                us find the right workspace.
              </li>
            </LegalList>
            <p>
              Do not send us ID documents, passwords, or payment details. We do not need them and
              will not keep them.
            </p>
          </Step>
          <Step n={2} title="We acknowledge and identify the workspace">
            <p>
              We acknowledge within {GRIEVANCE_OFFICER.acknowledgeHours} hours, find the business
              whose workspace holds your data, and pass your request to it. We may ask you one
              follow-up question to confirm it is your number.
            </p>
          </Step>
          <Step n={3} title="The business instructs, we delete">
            <p>
              As the data processor we act on the controlling business's instruction. We follow up
              if it does not respond. We complete deletion and write back to you within{' '}
              <strong>{RETENTION.deletionSlaDays} days</strong> of receiving your request, telling
              you what was deleted or why it was not.
            </p>
          </Step>
        </ol>
        <p>
          Deleting your data here does <strong>not</strong> delete messages stored on your own
          phone, or on the business's other systems, or anything WhatsApp itself holds.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 3 */}
      <LegalSection id="what-is-deleted" n={3} title="What gets deleted, and what is kept">
        <LegalTable head={['Data', 'Deleted?', 'Detail']}>
          <tr>
            <td>Chat threads and message content</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Text, captions, locations, contact cards, reactions — all removed.</td>
          </tr>
          <tr>
            <td>Media files (images, video, audio, documents)</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Removed from object storage along with their identifiers.</td>
          </tr>
          <tr>
            <td>Contact records, tags and metadata</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Including name, phone number and email.</td>
          </tr>
          <tr>
            <td>Ad-attribution data (ctwa_clid, ad IDs, ad content)</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Deleted with the conversation it was attached to.</td>
          </tr>
          <tr>
            <td>Business user accounts and workspace settings</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Workspace deletion only.</td>
          </tr>
          <tr>
            <td>Connected credentials (Meta, Twilio, CRM)</td>
            <td>
              <span className="dc-badge dc-badge-brand">Deleted</span>
            </td>
            <td>Erased as soon as you remove them in Settings. We keep no copy.</td>
          </tr>
          <tr>
            <td>Server and webhook logs</td>
            <td>
              <span className="dc-badge">Expires</span>
            </td>
            <td>
              Deleted automatically after {RETENTION.serverLogDays} days. Not searchable by phone
              number, so they are aged out rather than individually purged.
            </td>
          </tr>
          <tr>
            <td>Encrypted backups</td>
            <td>
              <span className="dc-badge">Expires</span>
            </td>
            <td>
              Rotated out within {RETENTION.backupDays} days. Deleted data is never restored into
              the live service.
            </td>
          </tr>
          <tr>
            <td>Billing records, invoices, credit ledger</td>
            <td>
              <span className="dc-badge dc-badge-warn">Retained</span>
            </td>
            <td>
              Kept {RETENTION.billingYears} years. Indian tax and accounting law requires it, so we
              cannot delete these on request. They contain workspace and payment records, not
              conversation content.
            </td>
          </tr>
          <tr>
            <td>Records needed for a legal claim or a lawful order</td>
            <td>
              <span className="dc-badge dc-badge-warn">Retained</span>
            </td>
            <td>
              Only where a live dispute, investigation or binding order requires it, and only for as
              long as that lasts.
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
            <dd className="text-md text-ink">{LEGAL_ENTITY}, India</dd>

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
