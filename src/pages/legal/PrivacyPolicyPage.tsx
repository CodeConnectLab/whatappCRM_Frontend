import {
  LegalLayout,
  LegalList,
  LegalNote,
  LegalSection,
  LegalSubhead,
  LegalTable,
} from './LegalLayout.tsx';
import {
  API_URL,
  APP_URL,
  CONTACT_EMAIL,
  EFFECTIVE_DATE,
  GRIEVANCE_OFFICER,
  INFRA,
  LAST_UPDATED,
  LEGAL_ENTITY,
  LEGAL_ENTITY_DESCRIPTOR,
  PRODUCT_NAME,
  REGISTERED_ADDRESS_LINES,
  RETENTION,
} from './legalConfig.ts';

const TOC = [
  { id: 'who-we-are', title: 'Who we are, and our role' },
  { id: 'what-we-collect', title: 'What data we collect' },
  { id: 'why-we-process', title: 'Why we process it' },
  { id: 'whatsapp-meta', title: 'WhatsApp and Meta platform data' },
  { id: 'sharing', title: 'Who we share data with' },
  { id: 'retention', title: 'How long we keep data' },
  { id: 'security', title: 'How we protect data' },
  { id: 'your-rights', title: 'Your rights' },
  { id: 'end-consumers', title: 'If you messaged a business on WhatsApp' },
  { id: 'children', title: 'Children' },
  { id: 'cookies', title: 'Cookies and browser storage' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'grievance', title: 'Grievance Officer' },
  { id: 'governing-law', title: 'Governing law' },
  { id: 'contact', title: 'Contact and dates' },
];

export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`How ${LEGAL_ENTITY} handles data in ${PRODUCT_NAME}, a WhatsApp Business inbox for teams.`}
    >
      <LegalNote>
        <strong>Read this first.</strong> {PRODUCT_NAME} is software we sell to businesses. When a
        business connects its WhatsApp Business number, that business decides what data is collected
        from its customers and why — it is the <strong>data controller</strong>. We store and move
        that data only on its instructions — we are the <strong>data processor</strong>. If you are
        a consumer who messaged a business on WhatsApp, you are not our user: you are that
        business's customer. Section 9 tells you how to get your data deleted.
      </LegalNote>

      <nav aria-label="Table of contents" className="dc-card-pad">
        <h2 className="text-md font-semibold text-ink">On this page</h2>
        <ol className="mt-3 grid list-decimal gap-1.5 pl-5 marker:text-ink-4 sm:grid-cols-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-md text-brand hover:text-brand-strong">
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ------------------------------------------------------------------ 1 */}
      <LegalSection id="who-we-are" n={1} title="Who we are, and our role">
        <p>
          {PRODUCT_NAME} is operated by {LEGAL_ENTITY}, {LEGAL_ENTITY_DESCRIPTOR}. The web app runs
          at{' '}
          <a className="text-brand hover:text-brand-strong" href={APP_URL}>
            {APP_URL}
          </a>{' '}
          and its API at{' '}
          <a className="text-brand hover:text-brand-strong" href={API_URL}>
            {API_URL}
          </a>
          .
        </p>
        <p>
          A business connects its own WhatsApp Business number through Meta's WhatsApp Business
          Cloud API, and its staff answer customer conversations from a shared web inbox. Each
          business gets an isolated <strong>workspace</strong>.
        </p>
        <LegalTable head={['Who', 'Relationship to us', 'Who is responsible for their data']}>
          <tr>
            <td>
              <strong>Business customers</strong> and their staff
            </td>
            <td>Our direct customers and users</td>
            <td>
              We are the controller for their account data, and their processor for everything in
              their workspace.
            </td>
          </tr>
          <tr>
            <td>
              <strong>End consumers</strong> who message a business
            </td>
            <td>
              <strong>Not our users.</strong> We never contact them.
            </td>
            <td>The business they messaged. We act only on that business's instruction.</td>
          </tr>
        </LegalTable>
        <p>
          This matters in practice: we cannot decide on our own to delete, export or disclose a
          workspace's conversations. We act on the business's instruction, or where law requires it.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="what-we-collect" n={2} title="What data we collect">
        <LegalSubhead>Business account data (our direct users)</LegalSubhead>
        <p>
          Name, email address, workspace name, role (admin or agent), a hashed password, session
          tokens, and a log of which user changed which setting and when. Passwords are stored only
          as a hash — never in plain text, and we cannot recover one for you.
        </p>

        <LegalSubhead>Connected account credentials (supplied by the business)</LegalSubhead>
        <p>
          Meta App ID and secret, WhatsApp Business Account ID, Phone Number ID, access token and
          webhook verify token. Optionally Twilio credentials, and the business's own CRM URL and
          API key. All of these are encrypted at rest, are never shown back in full after saving,
          and are used only to reach the service they authenticate to.
        </p>

        <LegalSubhead>Conversation data (processed for the business)</LegalSubhead>
        <p>
          The phone number and WhatsApp profile name of the person messaging the business, the
          content of the messages (text, captions, button and list replies, shared locations,
          contact cards, reactions), identifiers for any media sent, and message metadata —
          WhatsApp message ID, timestamp, direction and delivery status.
        </p>

        <LegalSubhead>Ad attribution (Click-to-WhatsApp)</LegalSubhead>
        <p>
          When someone starts a chat by tapping a Meta ad, Meta attaches a referral object to that
          first message. We store what Meta sends — the click identifier, the ad or post ID and
          URL, and the ad's headline and body — so the business can tell which advertisement
          produced which enquiry. Meta supplies this with the message; we do not collect it from
          anyone's device, and we run no tracking pixels or advertising SDKs.
        </p>

        <LegalSubhead>Contacts, campaigns, billing and logs</LegalSubhead>
        <p>
          Contacts the business uploads or creates (name, phone, email, tags), message templates it
          submits to Meta, campaign records and delivery outcomes, its message credit balance and
          ledger, and server logs containing IP address, request path, user agent and timestamp.
        </p>

        <LegalSubhead>What we never do</LegalSubhead>
        <LegalList>
          <li>We do not sell, rent or trade personal data.</li>
          <li>We do not use message content to train AI or machine-learning models.</li>
          <li>We do not use end-customer data for our own marketing.</li>
          <li>
            We do not read a workspace's conversations, except when the business asks us to in order
            to fix a problem, or where law requires it.
          </li>
          <li>We do not combine data across different customer workspaces.</li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 3 */}
      <LegalSection id="why-we-process" n={3} title="Why we process it">
        <LegalTable head={['Data', 'Purpose', 'Basis']}>
          <tr>
            <td>Account data and audit log</td>
            <td>Create logins, authenticate users, apply permissions, show admins what changed.</td>
            <td>Performance of our contract with the business.</td>
          </tr>
          <tr>
            <td>Connected credentials</td>
            <td>Call Meta's or Twilio's API for the business and verify inbound webhooks.</td>
            <td>Performance of contract — the business supplies these deliberately.</td>
          </tr>
          <tr>
            <td>Conversation and ad attribution data</td>
            <td>Deliver, display and store messages; attribute an enquiry to the ad behind it.</td>
            <td>
              Processed on the business's instruction. The business is responsible for having a
              valid basis, normally its customer's consent.
            </td>
          </tr>
          <tr>
            <td>Contacts and campaigns</td>
            <td>Send the template messages and broadcasts the business has set up.</td>
            <td>
              The business's instruction. It must hold valid opt-in from every recipient (see our
              Terms).
            </td>
          </tr>
          <tr>
            <td>Billing and usage</td>
            <td>Meter credits, invoice correctly, keep tax records.</td>
            <td>Performance of contract; legal obligation under Indian tax law.</td>
          </tr>
          <tr>
            <td>Server logs</td>
            <td>Keep the service running, diagnose failed deliveries, detect abuse.</td>
            <td>Legitimate interest in security and reliability.</td>
          </tr>
        </LegalTable>
        <p>Where we rely on consent, it can be withdrawn at any time — see section 8.</p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 4 */}
      <LegalSection id="whatsapp-meta" n={4} title="WhatsApp and Meta platform data">
        <LegalNote>
          Data we obtain through Meta's APIs is used for one purpose only: providing the messaging
          service to the business that authorised the connection. It is not sold, not repurposed,
          and not shared with anyone else.
        </LegalNote>
        <p>
          {PRODUCT_NAME} connects to the <strong>WhatsApp Business Cloud API</strong> operated by
          Meta Platforms. The business customer supplies its own Meta credentials, which authorise
          us to send and receive messages for its WhatsApp Business number.
        </p>
        <LegalSubhead>What we do with it</LegalSubhead>
        <p>
          Deliver the messages and campaigns the authorising business composed, receive inbound
          messages into that business's inbox, record delivery status, store ad-referral data so the
          business can attribute its own enquiries, and submit the business's message templates to
          Meta for approval.
        </p>
        <LegalSubhead>What we never do with it</LegalSubhead>
        <LegalList>
          <li>Sell it, license it, or transfer it to a data broker or any other third party.</li>
          <li>Use it to train AI or machine-learning models.</li>
          <li>Use it to build advertising profiles, or for our own marketing.</li>
          <li>Merge it with another workspace's data, or with data from any other source.</li>
          <li>Keep it once the authorising business asks us to delete it.</li>
        </LegalList>
        <p>
          We handle this data in accordance with Meta's{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://developers.facebook.com/terms/"
            target="_blank"
            rel="noreferrer"
          >
            Platform Terms
          </a>
          ,{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://developers.facebook.com/devpolicy/"
            target="_blank"
            rel="noreferrer"
          >
            Developer Policies
          </a>{' '}
          and the{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://business.whatsapp.com/policy"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Business Messaging Policy
          </a>
          . Messages in transit across WhatsApp are also governed by{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://www.whatsapp.com/legal/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp's own privacy policy
          </a>
          , which we do not control.
        </p>
        <p>
          {LEGAL_ENTITY} is an independent software vendor. We are not affiliated with, endorsed by,
          or acting as an agent of Meta Platforms, Inc. or any of its group companies. "WhatsApp"
          and "Meta" are their trademarks, used here only to describe what our software connects to.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 5 */}
      <LegalSection id="sharing" n={5} title="Who we share data with">
        <p>These are our sub-processors. Each receives only what it needs.</p>
        <LegalTable head={['Who', 'What it receives', 'Why']}>
          <tr>
            <td>
              <strong>Meta Platforms</strong> (WhatsApp Business Cloud API)
            </td>
            <td>Message content, recipient phone numbers, template content.</td>
            <td>
              To deliver and receive WhatsApp messages. Governed by Meta's{' '}
              <a
                className="text-brand hover:text-brand-strong"
                href="https://www.whatsapp.com/legal/business-terms"
                target="_blank"
                rel="noreferrer"
              >
                business terms
              </a>{' '}
              and{' '}
              <a
                className="text-brand hover:text-brand-strong"
                href="https://www.whatsapp.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                privacy policy
              </a>
              .
            </td>
          </tr>
          <tr>
            <td>
              <strong>{INFRA.serverProvider}</strong>
            </td>
            <td>Application data on our servers, and media files in object storage.</td>
            <td>Hosting and file storage, in {INFRA.serverRegion}.</td>
          </tr>
          <tr>
            <td>
              <strong>{INFRA.database}</strong>
            </td>
            <td>The primary database: accounts, chats, contacts, campaigns, ledgers.</td>
            <td>Managed database hosting, in {INFRA.databaseRegion}.</td>
          </tr>
          <tr>
            <td>
              <strong>{INFRA.frontendHost}</strong>
            </td>
            <td>Ordinary web server access logs — IP address, user agent, pages requested.</td>
            <td>Serving the web app. No message content passes through it.</td>
          </tr>
          <tr>
            <td>
              <strong>Twilio</strong>
            </td>
            <td>Message content and recipient numbers.</td>
            <td>
              Only for workspaces that choose Twilio instead of Meta. Otherwise Twilio receives
              nothing.
            </td>
          </tr>
          <tr>
            <td>
              <strong>The business's own CRM</strong>
            </td>
            <td>Lead details from its own conversations.</td>
            <td>
              Only when that business switches the CRM bridge on and supplies its own CRM
              credentials. This returns the business's data to a system it controls, and it can
              switch it off at any time.
            </td>
          </tr>
        </LegalTable>
        <p>
          We also disclose data where legally compelled — a binding court order or lawful demand
          from an Indian authority. If the {PRODUCT_NAME} business is sold or transferred, customer
          data may pass to the acquirer under a policy no less protective than this one, and
          customers would be told first.
        </p>
        <LegalSubhead>Transfers outside India</LegalSubhead>
        <p>
          Our servers, database and file storage are all in {INFRA.serverRegion}, so conversations,
          contacts and media stay in India at rest. Some processing happens abroad regardless: Meta
          operates the WhatsApp Cloud API globally, Twilio runs international infrastructure, and{' '}
          {INFRA.frontendHost} serves the web app from edge locations worldwide. Where that happens
          we rely on data processing agreements with each provider carrying confidentiality,
          security and purpose-limitation terms.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 6 */}
      <LegalSection id="retention" n={6} title="How long we keep data">
        <LegalTable head={['Data', 'How long']}>
          <tr>
            <td>Conversations, messages, media and contacts</td>
            <td>
              While the workspace is active. Deleted within{' '}
              <strong>{RETENTION.conversationDaysAfterClosure} days</strong> of account closure, or
              sooner if the business asks.
            </td>
          </tr>
          <tr>
            <td>Business accounts and workspace settings</td>
            <td>
              Deleted within {RETENTION.conversationDaysAfterClosure} days of account closure.
            </td>
          </tr>
          <tr>
            <td>Connected credentials</td>
            <td>Deleted as soon as you remove them in Settings, and at account closure.</td>
          </tr>
          <tr>
            <td>Server and webhook logs</td>
            <td>
              <strong>{RETENTION.serverLogDays} days</strong>, then deleted automatically.
            </td>
          </tr>
          <tr>
            <td>Billing records and the credit ledger</td>
            <td>
              <strong>{RETENTION.billingYears} years</strong>, as Indian tax and accounting law
              requires. Not deletable on request.
            </td>
          </tr>
          <tr>
            <td>Encrypted backups</td>
            <td>
              Rotated out within <strong>{RETENTION.backupDays} days</strong>. Deleted records are
              never restored into the live service.
            </td>
          </tr>
        </LegalTable>
      </LegalSection>

      {/* ------------------------------------------------------------------ 7 */}
      <LegalSection id="security" n={7} title="How we protect data">
        <LegalList>
          <li>
            Third-party credentials — Meta, Twilio and CRM secrets — are encrypted at rest with
            AES-256.
          </li>
          <li>Passwords are stored as bcrypt hashes, never in plain text.</li>
          <li>All traffic to the app and API runs over HTTPS. Plain HTTP is not served.</li>
          <li>
            Inbound webhooks are rejected unless their cryptographic signature verifies, so a forged
            payload cannot inject messages into a workspace.
          </li>
          <li>Every request is authorised against the user's role before it reaches data.</li>
          <li>
            Every query is scoped to one workspace. A workspace cannot read, search or export
            another's data.
          </li>
          <li>
            Access to production data is limited to staff who need it to operate the service, and is
            used only for support and troubleshooting.
          </li>
        </LegalList>
        <p>
          If a breach affects personal data we hold, we will notify the affected businesses and the
          Data Protection Board of India without undue delay, as the DPDP Act requires.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 8 */}
      <LegalSection id="your-rights" n={8} title="Your rights">
        <p>
          If you are a business customer or one of its users, write to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          from your registered email address. We respond within {GRIEVANCE_OFFICER.responseDays}{' '}
          days.
        </p>
        <LegalTable head={['Right', 'How to use it']}>
          <tr>
            <td>
              <strong>Access</strong> — a copy of the data we hold about you
            </td>
            <td>Email us, or read most of it directly in the app.</td>
          </tr>
          <tr>
            <td>
              <strong>Correction</strong> — fix data that is wrong or out of date
            </td>
            <td>Edit it in Settings, or email us.</td>
          </tr>
          <tr>
            <td>
              <strong>Deletion</strong> — erase your account or workspace data
            </td>
            <td>
              See the{' '}
              <a className="text-brand hover:text-brand-strong" href="/data-deletion">
                Data Deletion page
              </a>
              .
            </td>
          </tr>
          <tr>
            <td>
              <strong>Portability</strong> — your data in a machine-readable format
            </td>
            <td>Export from the app, or ask us.</td>
          </tr>
          <tr>
            <td>
              <strong>Objection and withdrawal of consent</strong>
            </td>
            <td>
              Email us, or switch the feature off in Settings. Withdrawing is as easy as consenting.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Complain</strong>
            </td>
            <td>
              Our Grievance Officer (section 13), then the Data Protection Board of India if you are
              not satisfied.
            </td>
          </tr>
        </LegalTable>
        <p>
          We may ask you to confirm your identity first, so we do not hand your data to someone
          else. One limit worth stating plainly: for data inside a business's workspace we are the
          processor, so we must forward your request to that business and act on its instruction —
          see section 9.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 9 */}
      <LegalSection id="end-consumers" n={9} title="If you messaged a business on WhatsApp">
        <p>
          You are not our user. A business you contacted uses our software to read and answer your
          messages, and it decides what to keep.
        </p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-ink-4">
          <li>
            <strong>Contact the business directly.</strong> This is fastest — it can delete your
            conversation itself, from its own inbox.
          </li>
          <li>
            <strong>Or write to us</strong> at{' '}
            <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . Include the WhatsApp number you messaged from, the business you contacted, and what
            you want deleted. We will find the workspace, pass your request to that business, carry
            out its instruction, and confirm back to you within {GRIEVANCE_OFFICER.responseDays}{' '}
            days.
          </li>
        </ol>
        <p>
          The step-by-step version is on the{' '}
          <a className="text-brand hover:text-brand-strong" href="/data-deletion">
            Data Deletion page
          </a>
          . Deleting data here does not delete messages on your own phone, or anything WhatsApp
          itself holds.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 10 */}
      <LegalSection id="children" n={10} title="Children">
        <p>
          {PRODUCT_NAME} is a business tool and is not directed at anyone under 18. We do not
          knowingly create accounts for minors, and we run no tracking or behavioural advertising —
          none at all. Business customers must not use the platform to target children.
        </p>
        <p>
          If you believe a minor has an account with us, write to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          and we will investigate and delete what we can.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 11 */}
      <LegalSection id="cookies" n={11} title="Cookies and browser storage">
        <p>
          The web app stores two things in your browser's local storage: your sign-in tokens, so you
          stay logged in between page loads, and interface preferences such as light or dark theme.
          Both are cleared when you log out or clear site data.
        </p>
        <LegalNote>
          <strong>No analytics cookies. No advertising cookies. No tracking pixels. None.</strong>{' '}
          We run no third-party tracker on this app or on these legal pages. Nothing here follows
          you to other websites.
        </LegalNote>
        <p>
          That storage is strictly necessary to run a signed-in session, which is why there is no
          cookie banner. If you block it, you cannot stay signed in.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 12 */}
      <LegalSection id="changes" n={12} title="Changes to this policy">
        <p>
          When this policy changes we update the "Last updated" date and publish the new version
          here. Material changes — a new category of data, a new sub-processor, a new purpose, or a
          longer retention period — are emailed to workspace admins at least{' '}
          <strong>14 days</strong> before they take effect. Minor clarifications take effect on
          publication.
        </p>
        <p>
          Continuing to use the service after a change takes effect means you accept the updated
          policy. If you do not, you can close your account and ask us to delete your data.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 13 */}
      <LegalSection id="grievance" n={13} title="Grievance Officer">
        <p>
          As required by India's Digital Personal Data Protection Act, 2023 and the Information
          Technology Rules, 2011, we have appointed a Grievance Officer. Write to them about
          anything to do with your data or this policy.
        </p>
        <div className="dc-card-pad">
          <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm font-medium text-ink-3">Name</dt>
            <dd className="text-md text-ink">{GRIEVANCE_OFFICER.name}</dd>

            <dt className="text-sm font-medium text-ink-3">Designation</dt>
            <dd className="text-md text-ink">{GRIEVANCE_OFFICER.designation}</dd>

            <dt className="text-sm font-medium text-ink-3">Email</dt>
            <dd className="text-md text-ink">
              <a
                className="text-brand hover:text-brand-strong"
                href={`mailto:${GRIEVANCE_OFFICER.email}`}
              >
                {GRIEVANCE_OFFICER.email}
              </a>{' '}
              (also{' '}
              <a
                className="text-brand hover:text-brand-strong"
                href={`mailto:${GRIEVANCE_OFFICER.altEmail}`}
              >
                {GRIEVANCE_OFFICER.altEmail}
              </a>
              )
            </dd>

            <dt className="text-sm font-medium text-ink-3">Postal address</dt>
            <dd className="text-md text-ink">
              <address className="not-italic leading-relaxed">
                {REGISTERED_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </dd>

            <dt className="text-sm font-medium text-ink-3">Response timeline</dt>
            <dd className="text-md text-ink">
              Acknowledged within {GRIEVANCE_OFFICER.acknowledgeHours} hours; resolved within{' '}
              {GRIEVANCE_OFFICER.responseDays} days.
            </dd>
          </dl>
        </div>
        <p>
          If you are not satisfied with the outcome, you may complain to the Data Protection Board
          of India.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 14 */}
      <LegalSection id="governing-law" n={14} title="Governing law">
        <p>
          This policy is governed by the laws of India, including the Digital Personal Data
          Protection Act, 2023 and the Information Technology Act, 2000. The courts at Mumbai,
          Maharashtra have exclusive jurisdiction.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 15 */}
      <LegalSection id="contact" n={15} title="Contact and dates">
        <div className="dc-card-pad">
          <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm font-medium text-ink-3">Operator</dt>
            <dd className="text-md text-ink">
              {LEGAL_ENTITY} — {LEGAL_ENTITY_DESCRIPTOR}
            </dd>

            <dt className="text-sm font-medium text-ink-3">Registered address</dt>
            <dd className="text-md text-ink">
              <address className="not-italic leading-relaxed">
                {REGISTERED_ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </dd>

            <dt className="text-sm font-medium text-ink-3">Email</dt>
            <dd className="text-md text-ink">
              <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </dd>

            <dt className="text-sm font-medium text-ink-3">Effective date</dt>
            <dd className="text-md text-ink">{EFFECTIVE_DATE}</dd>

            <dt className="text-sm font-medium text-ink-3">Last updated</dt>
            <dd className="text-md text-ink">{LAST_UPDATED}</dd>
          </dl>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
