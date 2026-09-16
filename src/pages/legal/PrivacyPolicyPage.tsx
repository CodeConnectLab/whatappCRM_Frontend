import {
  Fill,
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
  CONTACT_PHONE_FILL,
  EFFECTIVE_DATE,
  EMAIL_PROVIDER_FILL,
  GRIEVANCE_OFFICER,
  HOSTING_PROVIDER_FILL,
  HOSTING_REGION,
  LAST_UPDATED,
  LEGAL_ENTITY,
  LEGAL_ENTITY_SUFFIX_FILL,
  PRODUCT_NAME,
  REGISTERED_ADDRESS_LINES,
  RETENTION,
} from './legalConfig.ts';

const TOC = [
  { id: 'who-we-are', title: 'Who we are, and our role' },
  { id: 'what-we-collect', title: 'What data we collect' },
  { id: 'why-we-process', title: 'Why we process it, and our lawful basis' },
  { id: 'whatsapp-meta', title: 'WhatsApp and Meta platform data' },
  { id: 'sharing', title: 'Who we share data with' },
  { id: 'retention', title: 'How long we keep data' },
  { id: 'security', title: 'How we protect data' },
  { id: 'your-rights', title: 'Your rights, and how to use them' },
  { id: 'end-consumers', title: 'If you messaged a business on WhatsApp' },
  { id: 'children', title: 'Children' },
  { id: 'cookies', title: 'Cookies and browser storage' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'grievance', title: 'Grievance Officer' },
  { id: 'governing-law', title: 'Governing law and jurisdiction' },
  { id: 'contact', title: 'Contact us, and dates' },
];

export function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle={`How ${LEGAL_ENTITY} handles data in ${PRODUCT_NAME}, the WhatsApp Business inbox for teams.`}
    >
      {/* ---- Framing: processor vs controller, stated before anything else ---- */}
      <LegalNote>
        <strong>Read this first.</strong> {PRODUCT_NAME} is software we sell to businesses. When a
        business connects its WhatsApp number to our platform, that business decides what data is
        collected from its customers and why — it is the <strong>data controller</strong>. We only
        store and move that data on the business's instructions — we are the{' '}
        <strong>data processor</strong>. If you are a consumer who messaged a business on WhatsApp,
        you are not our user: you are that business's customer, and the business answers for your
        data. Section 9 tells you exactly what to do if you want your data deleted.
      </LegalNote>

      {/* ---- Table of contents ---- */}
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
          {PRODUCT_NAME} is operated by {LEGAL_ENTITY} <Fill>{LEGAL_ENTITY_SUFFIX_FILL}</Fill>, a
          company registered in India. The web app runs at{' '}
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
          The product is a multi-tenant B2B platform. A business connects its own WhatsApp Business
          number — through Meta's WhatsApp Business Cloud API — and its staff answer customer
          conversations from a shared web inbox. Each business gets its own isolated{' '}
          <strong>workspace</strong>.
        </p>

        <LegalSubhead>Three groups of people, and who is responsible for each</LegalSubhead>
        <LegalTable head={['Who', 'Relationship to us', 'Who is responsible']}>
          <tr>
            <td>
              <strong>Business customers</strong> — the company that buys a workspace
            </td>
            <td>Our direct customer</td>
            <td>
              They are the controller for their customers' data. We are their processor. For their
              own staff account data (names, emails, logins) we are the controller.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Agents and admins</strong> — staff who log in to a workspace
            </td>
            <td>Our direct users</td>
            <td>
              We hold their account data to run the service, on their employer's instruction.
            </td>
          </tr>
          <tr>
            <td>
              <strong>End consumers</strong> — people who message a business on WhatsApp
            </td>
            <td>
              <strong>Not our users.</strong> We never contact them, and we have no relationship
              with them.
            </td>
            <td>
              The business they messaged. We process those messages only because that business told
              us to.
            </td>
          </tr>
        </LegalTable>
        <p>
          This distinction matters in practice: we cannot decide on our own to delete, export or
          hand over a workspace's conversations. We act on the business's instruction, or where the
          law requires it of us.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="what-we-collect" n={2} title="What data we collect">
        <p>This is the full list. Nothing else is collected.</p>

        <LegalSubhead>2.1 Business user account data (our direct users)</LegalSubhead>
        <LegalList>
          <li>Name and email address.</li>
          <li>
            Password, stored only as a bcrypt hash (work factor 12). We never store, log or display
            a password in plain text, and we cannot recover one for you.
          </li>
          <li>Workspace / company name and your role in it (company admin or agent).</li>
          <li>Session tokens — a short-lived JWT access token and a refresh token.</li>
          <li>
            An activity audit log: which user performed which configuration action, and when.
          </li>
        </LegalList>

        <LegalSubhead>2.2 Connected account credentials (supplied by the business)</LegalSubhead>
        <LegalList>
          <li>
            Meta App ID, Meta App Secret, WhatsApp Business Account ID, Phone Number ID, long-lived
            access token and webhook verify token.
          </li>
          <li>Optionally, a Twilio account SID and auth token.</li>
          <li>Optionally, the business's own CRM base URL and CRM API key.</li>
        </LegalList>
        <p>
          Every one of these secrets is encrypted at rest with AES-256-GCM. After you save a
          credential it is never displayed back to you in full, and it is never shared with anyone
          other than the service it authenticates to.
        </p>

        <LegalSubhead>
          2.3 End-customer conversation data (processed for the business)
        </LegalSubhead>
        <LegalList>
          <li>The WhatsApp phone number, in E.164 format, of the person messaging the business.</li>
          <li>The WhatsApp public profile display name.</li>
          <li>
            Full message content: text bodies, media captions, button and list-reply titles, shared
            location names and coordinates, contact-card names, and reaction emoji.
          </li>
          <li>Media identifiers for images, video, audio, documents and stickers.</li>
          <li>
            Message metadata: the WhatsApp message ID, timestamp, direction, delivery status (sent,
            delivered, read, failed) and any failure reason.
          </li>
        </LegalList>

        <LegalSubhead>2.4 Advertising attribution data (Click-to-WhatsApp ads)</LegalSubhead>
        <p>
          When someone starts a chat by tapping a Meta ad, Meta attaches a referral object to that
          first message. We store what Meta sends:
        </p>
        <LegalList>
          <li>
            <code className="font-mono text-sm">ctwa_clid</code> — Meta's click identifier for that
            ad tap.
          </li>
          <li>
            <code className="font-mono text-sm">source_id</code> (the ad or post ID),{' '}
            <code className="font-mono text-sm">source_type</code> ("ad" or "post"), and{' '}
            <code className="font-mono text-sm">source_url</code>.
          </li>
          <li>The ad's headline, body text, media type and media URLs.</li>
        </LegalList>
        <p>
          <strong>Why:</strong> so the business can see which advertisement produced which enquiry
          and work out what its advertising is actually returning. Without it, every enquiry looks
          identical and ad spend cannot be measured.
        </p>
        <p>
          <strong>Where it comes from:</strong> Meta supplies this with the message. We do not
          collect it from anyone's device, we do not track people across websites, and we run no
          advertising pixels or SDKs.
        </p>

        <LegalSubhead>2.5 Contacts and campaigns</LegalSubhead>
        <LegalList>
          <li>
            Contacts the business uploads by CSV or creates by hand: name, phone number, email,
            tags and free-form metadata fields the business defines.
          </li>
          <li>Message templates the business writes and submits to Meta for approval.</li>
          <li>Broadcast campaign records and the delivery outcome for each recipient.</li>
        </LegalList>

        <LegalSubhead>2.6 Billing and usage</LegalSubhead>
        <LegalList>
          <li>The workspace's message credit balance.</li>
          <li>A ledger of credit debits, one entry per message sent.</li>
        </LegalList>

        <LegalSubhead>2.7 Technical logs</LegalSubhead>
        <LegalList>
          <li>Server logs: IP address, request path, user agent and timestamp.</li>
          <li>
            Raw inbound webhook payloads from Meta and Twilio, kept short-term so we can debug a
            message that did not arrive.
          </li>
        </LegalList>

        <LegalSubhead>2.8 What we never do</LegalSubhead>
        <LegalList>
          <li>
            We do <strong>not</strong> sell, rent or trade personal data to anyone, ever.
          </li>
          <li>
            We do <strong>not</strong> use message content to train AI or machine-learning models.
          </li>
          <li>
            We do <strong>not</strong> use end-customer data for our own marketing.
          </li>
          <li>
            We do <strong>not</strong> read a workspace's conversations, except when the business
            asks us to in order to fix a problem, or where the law requires it.
          </li>
          <li>
            We do <strong>not</strong> combine or cross-reference data between different customer
            workspaces.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 3 */}
      <LegalSection id="why-we-process" n={3} title="Why we process it, and our lawful basis">
        <LegalTable head={['Data', 'Why we process it', 'Lawful basis']}>
          <tr>
            <td>Account data (2.1)</td>
            <td>To create logins, authenticate users, and apply role-based permissions.</td>
            <td>Performance of our contract with the business customer.</td>
          </tr>
          <tr>
            <td>Audit log (2.1)</td>
            <td>
              So a workspace admin can see who changed a setting, and so we can investigate misuse.
            </td>
            <td>Legitimate interest in security and accountability.</td>
          </tr>
          <tr>
            <td>Connected credentials (2.2)</td>
            <td>
              To call Meta's or Twilio's API on the business's behalf and to verify incoming
              webhooks.
            </td>
            <td>Performance of contract; the business supplies these deliberately.</td>
          </tr>
          <tr>
            <td>Conversation data (2.3)</td>
            <td>
              To deliver, display, store and search the messages between a business and its
              customers.
            </td>
            <td>
              Processed on the business's documented instruction. The business is responsible for
              having a valid basis — normally the consumer's consent or its own contract with them.
            </td>
          </tr>
          <tr>
            <td>Ad attribution (2.4)</td>
            <td>To attribute an enquiry to the advertisement that produced it.</td>
            <td>
              The business's legitimate interest in measuring its own advertising, on its
              instruction.
            </td>
          </tr>
          <tr>
            <td>Contacts and campaigns (2.5)</td>
            <td>To send template messages and broadcasts the business has set up.</td>
            <td>
              The business's instruction. The business must hold valid opt-in from every recipient
              (see our Terms).
            </td>
          </tr>
          <tr>
            <td>Billing and usage (2.6)</td>
            <td>To meter message credits, invoice correctly, and keep tax records.</td>
            <td>Performance of contract; legal obligation under Indian tax and accounting law.</td>
          </tr>
          <tr>
            <td>Technical logs (2.7)</td>
            <td>To keep the service up, diagnose failed deliveries, and detect abuse.</td>
            <td>Legitimate interest in security and service reliability.</td>
          </tr>
          <tr>
            <td>Transactional email to our users</td>
            <td>Password resets, security notices, service and billing notifications.</td>
            <td>Performance of contract. These are not marketing and cannot be opted out of.</td>
          </tr>
        </LegalTable>
        <p>
          Where consent is the basis for something, it can be withdrawn at any time — see section 8.
          Withdrawing consent does not undo processing that already happened lawfully.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 4 */}
      <LegalSection id="whatsapp-meta" n={4} title="WhatsApp and Meta platform data">
        <LegalNote>
          Data we obtain through Meta's APIs is used for exactly one purpose: providing the
          messaging service to the business that authorised the connection. It is not sold, not
          repurposed, and not shared with anyone else.
        </LegalNote>
        <p>
          {PRODUCT_NAME} connects to the <strong>WhatsApp Business Cloud API</strong> operated by
          Meta Platforms. A business customer supplies its own Meta credentials, which authorises us
          to send and receive messages for its WhatsApp Business number.
        </p>
        <LegalSubhead>What we do with Meta platform data</LegalSubhead>
        <LegalList>
          <li>
            Deliver outbound messages and campaigns that the authorising business composed and sent.
          </li>
          <li>Receive inbound messages and show them in that business's inbox.</li>
          <li>Record delivery status so the business knows whether a message arrived.</li>
          <li>
            Store ad-referral data (section 2.4) so the business can attribute enquiries to its own
            advertising.
          </li>
          <li>
            Submit message templates the business wrote to Meta for approval, and report the
            outcome back.
          </li>
        </LegalList>
        <LegalSubhead>What we never do with Meta platform data</LegalSubhead>
        <LegalList>
          <li>Sell it, license it, or transfer it to a data broker or any other third party.</li>
          <li>Use it to train AI or machine-learning models, ours or anyone else's.</li>
          <li>Use it to build advertising profiles, or for our own marketing.</li>
          <li>Merge it with another workspace's data, or with data from any other source.</li>
          <li>Retain it after the authorising business asks us to delete it (see section 6).</li>
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
          sponsored by, or acting as an agent of Meta Platforms, Inc. or any of its group companies.
          "WhatsApp" and "Meta" are their trademarks, used here only to describe what our software
          connects to.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 5 */}
      <LegalSection id="sharing" n={5} title="Who we share data with">
        <p>
          We share data with the following sub-processors, and with nobody else. Each receives only
          what it needs to do its job.
        </p>
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
              <strong>
                <Fill>{HOSTING_PROVIDER_FILL}</Fill>
              </strong>
            </td>
            <td>All application data at rest, and media files in S3-compatible object storage.</td>
            <td>Server hosting and file storage. Region: {HOSTING_REGION}.</td>
          </tr>
          <tr>
            <td>
              <strong>MongoDB Atlas</strong>
            </td>
            <td>The primary database: accounts, chats, messages, contacts, campaigns, ledgers.</td>
            <td>Managed database hosting, in {HOSTING_REGION}.</td>
          </tr>
          <tr>
            <td>
              <strong>Redis</strong>
            </td>
            <td>Transient job payloads — queued campaign sends and background jobs.</td>
            <td>
              Job queueing. Entries are short-lived and removed once the job completes.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Twilio</strong>
            </td>
            <td>Message content and recipient numbers — only for workspaces that choose Twilio.</td>
            <td>
              An alternative message transport. If a workspace uses Meta only, Twilio receives
              nothing.
            </td>
          </tr>
          <tr>
            <td>
              <strong>The business customer's own CRM</strong>
            </td>
            <td>Lead details and ad-attribution fields from its own conversations.</td>
            <td>
              Only when that workspace switches the CRM bridge on and supplies its own CRM URL and
              API key. The business chooses whether this runs, what it pushes, and can switch it off
              at any time in Settings. We never send data to a CRM we chose.
            </td>
          </tr>
          <tr>
            <td>
              <strong>
                <Fill>{EMAIL_PROVIDER_FILL}</Fill>
              </strong>
            </td>
            <td>Our users' names and email addresses.</td>
            <td>Sending transactional email — password resets and service notices.</td>
          </tr>
        </LegalTable>
        <p>
          We will also disclose data where we are legally compelled to — a binding court order,
          summons or lawful demand from an Indian authority. Where we are allowed to tell the
          affected business first, we will.
        </p>
        <p>
          If {LEGAL_ENTITY} is ever merged or acquired, customer data may transfer to the successor
          entity. It would remain subject to a policy no less protective than this one, and
          customers would be notified before any transfer takes effect.
        </p>
        <LegalSubhead>Transfers outside India</LegalSubhead>
        <p>
          Our infrastructure is provisioned in {HOSTING_REGION}, so data normally stays in India.
          Some processing happens outside India anyway: Meta operates the WhatsApp Cloud API
          globally, Twilio and our email provider run international infrastructure, and our
          providers may replicate data to other regions for resilience or route support requests
          through staff abroad.
        </p>
        <p>
          Where that happens, we rely on contractual safeguards with each provider — data processing
          agreements with confidentiality, security and purpose-limitation terms, and Standard
          Contractual Clauses where the provider offers them — and we transfer only to countries not
          restricted by the Government of India under the Digital Personal Data Protection Act,
          2023.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 6 */}
      <LegalSection id="retention" n={6} title="How long we keep data">
        <LegalTable head={['Data', 'How long we keep it']}>
          <tr>
            <td>Conversations, messages, media and contacts</td>
            <td>
              For as long as the workspace is active. Deleted within{' '}
              <strong>{RETENTION.conversationDaysAfterClosure} days</strong> of the account being
              closed, or sooner if the business asks.
            </td>
          </tr>
          <tr>
            <td>Business user accounts and workspace settings</td>
            <td>
              Deleted within {RETENTION.conversationDaysAfterClosure} days of account closure.
            </td>
          </tr>
          <tr>
            <td>Connected credentials (Meta, Twilio, CRM)</td>
            <td>
              Deleted immediately when you remove them in Settings, and at account closure. We do
              not keep a copy.
            </td>
          </tr>
          <tr>
            <td>Server logs</td>
            <td>
              <strong>{RETENTION.serverLogDays} days</strong>, then deleted automatically.
            </td>
          </tr>
          <tr>
            <td>Raw webhook payload logs</td>
            <td>
              <strong>{RETENTION.webhookLogDays} days</strong>, then deleted automatically.
            </td>
          </tr>
          <tr>
            <td>Billing records, invoices and the credit ledger</td>
            <td>
              <strong>{RETENTION.billingYears} years</strong>, as required by Indian tax and
              accounting law. Kept even after the account closes, and not deletable on request.
            </td>
          </tr>
          <tr>
            <td>Configuration audit log</td>
            <td>
              {RETENTION.billingYears} years where it forms part of a billing or compliance record;
              otherwise deleted with the workspace.
            </td>
          </tr>
          <tr>
            <td>Encrypted backups</td>
            <td>
              Rotated out within <strong>{RETENTION.backupDays} days</strong>. Deleted records
              persist in a backup only until that backup ages out, and are never restored into the
              live service.
            </td>
          </tr>
        </LegalTable>
      </LegalSection>

      {/* ------------------------------------------------------------------ 7 */}
      <LegalSection id="security" n={7} title="How we protect data">
        <LegalList>
          <li>
            <strong>Encryption of stored credentials.</strong> Every third-party secret — Meta app
            secrets and access tokens, Twilio auth tokens, CRM API keys — is encrypted at rest with
            AES-256-GCM, an authenticated cipher, with a unique initialisation vector per value.
          </li>
          <li>
            <strong>Password hashing.</strong> Passwords are hashed with bcrypt at work factor 12
            and are never stored or logged in plain text.
          </li>
          <li>
            <strong>Encryption in transit.</strong> All traffic to the app and API runs over HTTPS /
            TLS. Plain HTTP is not served.
          </li>
          <li>
            <strong>Webhook signature verification.</strong> Inbound Meta webhooks are verified
            against the <code className="font-mono text-sm">X-Hub-Signature-256</code> header, so a
            forged payload cannot inject messages into a workspace. Twilio webhooks are validated
            against Twilio's own signature.
          </li>
          <li>
            <strong>Role-based access control.</strong> Every API request is authorised against the
            caller's role (company admin or agent) before it touches data.
          </li>
          <li>
            <strong>Per-workspace isolation.</strong> Every query is scoped to the caller's
            workspace. One workspace cannot read, search or export another's chats, contacts or
            credentials.
          </li>
          <li>
            <strong>Short-lived sessions.</strong> Access tokens expire quickly and are renewed
            through a separate refresh token, which is revoked at logout.
          </li>
          <li>
            <strong>Least-privilege staff access.</strong> Access to production data is limited to
            the few staff who need it to operate the service, and is used for support and
            troubleshooting only.
          </li>
        </LegalList>
        <p>
          No system is perfectly secure, and we will not claim otherwise. If a breach affects
          personal data we hold, we will notify the affected business customers and the Data
          Protection Board of India without undue delay, as the DPDP Act requires.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 8 */}
      <LegalSection id="your-rights" n={8} title="Your rights, and how to use them">
        <p>
          If you are a business customer or one of its users, write to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          from your registered email address. We respond within {GRIEVANCE_OFFICER.responseDays}{' '}
          days.
        </p>
        <LegalTable head={['Right', 'What it means', 'How to use it']}>
          <tr>
            <td>Access</td>
            <td>A copy of the personal data we hold about you, and a summary of processing.</td>
            <td>Email us, or read most of it directly in the app.</td>
          </tr>
          <tr>
            <td>Correction</td>
            <td>Fix data that is wrong, incomplete or out of date.</td>
            <td>Edit it in Settings, or email us.</td>
          </tr>
          <tr>
            <td>Deletion</td>
            <td>Erase your account or your workspace's data.</td>
            <td>
              See the{' '}
              <a className="text-brand hover:text-brand-strong" href="/data-deletion">
                Data Deletion page
              </a>
              .
            </td>
          </tr>
          <tr>
            <td>Portability</td>
            <td>Your contacts, chats and campaign records in a machine-readable format.</td>
            <td>Export from the app, or ask us for a JSON/CSV export.</td>
          </tr>
          <tr>
            <td>Objection</td>
            <td>Object to processing we base on legitimate interest.</td>
            <td>
              Email us with your reason. We stop unless we have grounds that override yours, and we
              will explain which.
            </td>
          </tr>
          <tr>
            <td>Withdraw consent</td>
            <td>Withdraw consent where consent is what we relied on.</td>
            <td>
              Email us, or switch the feature off in Settings. As easy to withdraw as it was to
              give.
            </td>
          </tr>
          <tr>
            <td>Nominate</td>
            <td>
              Name someone to exercise these rights for you if you die or become incapacitated (a
              DPDP Act right).
            </td>
            <td>Email us their details.</td>
          </tr>
          <tr>
            <td>Complain</td>
            <td>Raise a grievance about how we handled your data.</td>
            <td>
              Our Grievance Officer (section 13), then the Data Protection Board of India if you are
              not satisfied.
            </td>
          </tr>
        </LegalTable>
        <p>
          We may ask you to confirm your identity before we act, to make sure we are not handing
          your data to someone else. There is no charge unless a request is repetitive or clearly
          excessive.
        </p>
        <p>
          <strong>One limit worth stating plainly.</strong> For conversation data inside a
          workspace, we are the processor. If you ask us to delete or export data that belongs to a
          business's workspace, we must forward that request to the business and act on its
          instruction — see section 9.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 9 */}
      <LegalSection id="end-consumers" n={9} title="If you messaged a business on WhatsApp">
        <p>
          You are not our user, and we did not collect your data for ourselves. A business you
          contacted on WhatsApp uses our software to read and answer your messages. That business
          decides what to keep and for how long.
        </p>
        <LegalSubhead>To have your data deleted</LegalSubhead>
        <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-ink-4">
          <li>
            <strong>Contact the business directly.</strong> This is the fastest route — it can
            delete your conversation itself, from its own inbox. Ask it to delete your chat history
            and contact record.
          </li>
          <li>
            <strong>Or write to us</strong> at{' '}
            <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . Include the WhatsApp number you messaged from, the name or WhatsApp number of the
            business you contacted, and what you want deleted. We will identify the workspace, pass
            your request to that business, and carry out its instruction. We will confirm back to
            you within {GRIEVANCE_OFFICER.responseDays} days.
          </li>
        </ol>
        <p>
          We cannot delete a business's records on our own initiative, because they are not ours to
          decide about — but we will not ignore your request either, and we will tell you what
          happened to it. The step-by-step version is on the{' '}
          <a className="text-brand hover:text-brand-strong" href="/data-deletion">
            Data Deletion page
          </a>
          .
        </p>
        <p>
          Deleting data from this platform does not delete the messages on your own phone, or
          anything WhatsApp itself holds. For that, see{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://www.whatsapp.com/legal/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp's privacy policy
          </a>
          .
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 10 */}
      <LegalSection id="children" n={10} title="Children">
        <p>
          {PRODUCT_NAME} is a business tool and is not directed at anyone under 18. We do not
          knowingly create accounts for minors, and we do not knowingly process a child's personal
          data for our own purposes. Under India's DPDP Act, processing a child's data requires
          verifiable parental consent, and we do not run tracking or behavioural advertising
          directed at children — we run none at all.
        </p>
        <p>
          Business customers must not use the platform to target children. If you believe a minor
          has an account with us, or that a workspace is processing a child's data unlawfully,
          write to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{' '}
          and we will investigate and delete what we can.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 11 */}
      <LegalSection id="cookies" n={11} title="Cookies and browser storage">
        <p>Here is everything the web app stores in your browser.</p>
        <LegalTable head={['What', 'Where', 'Why']}>
          <tr>
            <td>
              JWT access token and refresh token, your user profile, and your current workspace
            </td>
            <td>
              <code className="font-mono text-sm">localStorage</code>, key{' '}
              <code className="font-mono text-sm">wtsp-auth</code>
            </td>
            <td>
              To keep you signed in between page loads. Cleared when you log out or clear site data.
            </td>
          </tr>
          <tr>
            <td>UI preferences, such as light or dark theme</td>
            <td>
              <code className="font-mono text-sm">localStorage</code>, same key
            </td>
            <td>To keep the interface the way you left it.</td>
          </tr>
        </LegalTable>
        <LegalNote>
          <strong>No analytics cookies. No advertising cookies. No tracking pixels. None.</strong>{' '}
          We do not run Google Analytics, a Meta Pixel, or any third-party tracker on this app or on
          these legal pages. Nothing here follows you to other websites.
        </LegalNote>
        <p>
          The storage above is strictly necessary to run a logged-in session, which is why there is
          no cookie banner to dismiss. If you block it, you cannot stay signed in.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 12 */}
      <LegalSection id="changes" n={12} title="Changes to this policy">
        <p>
          When this policy changes we update the "Last updated" date at the top of the page and
          publish the new version here.
        </p>
        <LegalList>
          <li>
            <strong>Material changes</strong> — a new category of data, a new sub-processor, a new
            purpose, or a longer retention period — are emailed to workspace admins at least{' '}
            <strong>14 days</strong> before they take effect, and shown as a notice in the app.
          </li>
          <li>
            <strong>Minor changes</strong> — wording, clarifications, corrected contact details —
            take effect when published.
          </li>
        </LegalList>
        <p>
          We do not apply material changes retroactively to data already collected without a lawful
          basis for doing so. Continuing to use the service after a change takes effect means you
          accept the updated policy; if you do not, you can close your account and ask us to delete
          your data.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 13 */}
      <LegalSection id="grievance" n={13} title="Grievance Officer">
        <p>
          As required by India's Digital Personal Data Protection Act, 2023 and the Information
          Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or
          Information) Rules, 2011, we have appointed a Grievance Officer. Write to them about
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

            <dt className="text-sm font-medium text-ink-3">Phone</dt>
            <dd className="text-md text-ink">
              <Fill>{CONTACT_PHONE_FILL}</Fill>
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
              {GRIEVANCE_OFFICER.responseDays} days of receipt.
            </dd>
          </dl>
        </div>
        <p>
          If you are not satisfied with the outcome, you may complain to the Data Protection Board
          of India under the DPDP Act, 2023.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 14 */}
      <LegalSection id="governing-law" n={14} title="Governing law and jurisdiction">
        <p>
          This policy is governed by the laws of India, including the Digital Personal Data
          Protection Act, 2023, the Information Technology Act, 2000 and the rules made under them.
        </p>
        <p>
          The courts at Mumbai, Maharashtra, India have exclusive jurisdiction over any dispute
          arising out of this policy, and you and we submit to that jurisdiction.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 15 */}
      <LegalSection id="contact" n={15} title="Contact us, and dates">
        <div className="dc-card-pad">
          <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <dt className="text-sm font-medium text-ink-3">Operator</dt>
            <dd className="text-md text-ink">
              {LEGAL_ENTITY} <Fill>{LEGAL_ENTITY_SUFFIX_FILL}</Fill>
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

            <dt className="text-sm font-medium text-ink-3">Phone</dt>
            <dd className="text-md text-ink">
              <Fill>{CONTACT_PHONE_FILL}</Fill>
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
