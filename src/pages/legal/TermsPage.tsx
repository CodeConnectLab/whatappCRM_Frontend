import { LegalLayout, LegalList, LegalNote, LegalSection, LegalSubhead } from './LegalLayout.tsx';
import {
  APP_URL,
  CONTACT_EMAIL,
  EFFECTIVE_DATE,
  LAST_UPDATED,
  LEGAL_ENTITY,
  LEGAL_ENTITY_DESCRIPTOR,
  LEGAL_ENTITY_PRINCIPALS,
  PRODUCT_NAME,
  REGISTERED_ADDRESS_LINES,
  RETENTION,
  SLA,
} from './legalConfig.ts';

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle={`The agreement between ${LEGAL_ENTITY} and any business using ${PRODUCT_NAME}.`}
    >
      <LegalNote>
        These terms are between {LEGAL_ENTITY} and the business that opens a workspace. By creating
        an account, or letting your staff use one, you accept them on behalf of your business.
      </LegalNote>

      {/* ------------------------------------------------------------------ 1 */}
      <LegalSection id="service" n={1} title="What the service is">
        <p>
          {PRODUCT_NAME} is a web application at{' '}
          <a className="text-brand hover:text-brand-strong" href={APP_URL}>
            {APP_URL}
          </a>
          . It lets your business connect its own WhatsApp Business number through Meta's WhatsApp
          Business Cloud API (or through Twilio) and manage customer conversations from a shared
          inbox, with contact management, message templates, campaigns, per-user roles and message
          credit accounting.
        </p>
        <p>
          We provide software. We do not provide the WhatsApp network itself, cannot guarantee that
          Meta will approve your templates or your WhatsApp Business Account, and do not control
          Meta's pricing, rate limits or policy decisions.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="eligibility" n={2} title="Who can use it">
        <LegalList>
          <li>You must be a business or other legal entity, or acting for one.</li>
          <li>Every user must be at least 18. The service is not for consumers.</li>
          <li>
            You must hold a valid WhatsApp Business Account and phone number of your own, or be
            authorised by its owner to operate it.
          </li>
          <li>You are responsible for everything your staff do in your workspace.</li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 3 */}
      <LegalSection id="your-obligations" n={3} title="Your obligations">
        <p>
          You are the data controller for your customers' data. These obligations are yours, and
          breaching them is the fastest way to lose both your workspace and your WhatsApp Business
          Account.
        </p>

        <LegalSubhead>Opt-in</LegalSubhead>
        <LegalList>
          <li>
            Obtain valid, documented opt-in from every person before you message them. The opt-in
            must make clear that they will receive WhatsApp messages, and from which business.
          </li>
          <li>Keep proof of that opt-in and produce it if we or Meta ask.</li>
          <li>Honour opt-outs immediately, across every campaign and template.</li>
          <li>
            Never upload a purchased, scraped or rented contact list, and never message numbers that
            did not opt in to hear from you.
          </li>
        </LegalList>

        <LegalSubhead>Meta's policies</LegalSubhead>
        <p>
          Meta's rules apply to you directly. Read and follow the{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://business.whatsapp.com/policy"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Business Messaging Policy
          </a>
          , the{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://www.whatsapp.com/legal/commerce-policy"
            target="_blank"
            rel="noreferrer"
          >
            Commerce Policy
          </a>{' '}
          and the{' '}
          <a
            className="text-brand hover:text-brand-strong"
            href="https://www.whatsapp.com/legal/business-terms"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Business Terms
          </a>
          . If Meta suspends or restricts your account or number, the service stops working for you
          and there is nothing we can do about it on your behalf.
        </p>

        <LegalSubhead>Your account and data protection</LegalSubhead>
        <LegalList>
          <li>
            Keep credentials confidential and remove staff accounts promptly when people leave. Tell
            us at once if you suspect unauthorised access.
          </li>
          <li>
            The Meta, Twilio and CRM credentials you enter are yours. You confirm you are entitled
            to use them and to authorise us to use them for you.
          </li>
          <li>
            Give your customers a privacy notice of your own, and answer their access, correction
            and deletion requests. Where you need us to act, instruct us and we will.
          </li>
          <li>
            Do not upload special-category data — health records, financial credentials, government
            ID numbers, biometric data — into contact fields.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 4 */}
      <LegalSection id="acceptable-use" n={4} title="Acceptable use">
        <p>You must not use the service to:</p>
        <LegalList>
          <li>send spam, bulk unsolicited messages, or messages to people who did not opt in;</li>
          <li>send anything unlawful, fraudulent, deceptive, defamatory, obscene or threatening;</li>
          <li>impersonate another business or person, or misrepresent who is sending a message;</li>
          <li>
            promote goods or services prohibited by the WhatsApp Commerce Policy or by Indian law;
          </li>
          <li>target children, or send age-restricted content without checking age;</li>
          <li>
            probe, overload, reverse-engineer or circumvent access controls on our systems, or reach
            another workspace's data;
          </li>
          <li>resell the service as your own product without a written agreement from us.</li>
        </LegalList>
        <p>
          We do not monitor your conversations. If we receive a credible abuse report, or Meta
          notifies us of a policy breach in your workspace, we may investigate the minimum necessary
          to assess it.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 5 */}
      <LegalSection id="credits" n={5} title="Message credits and billing">
        <LegalList>
          <li>
            The service runs on prepaid <strong>message credits</strong>. Sending a message debits
            your balance, recorded in a ledger you can view at any time.
          </li>
          <li>
            The price of credits and of any plan is the price we quoted you in writing, or the price
            shown in the app, at the time of purchase. We do not reprice a purchase after the fact.
          </li>
          <li>
            If your balance runs out, outbound sending stops until you top up. Inbound messages keep
            arriving.
          </li>
          <li>
            Credits are prepaid and <strong>non-refundable</strong>, except where a refund is
            required by law or we are at fault for a failed charge. Unused credits are forfeited
            when the account closes.
          </li>
          <li>
            Charges Meta or Twilio levy are separate from our fees and governed by your agreement
            with them. Our fees are exclusive of GST and other applicable Indian taxes.
          </li>
          <li>
            We may change prices on <strong>30 days'</strong> written notice. Credits already bought
            keep their original rate.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 6 */}
      <LegalSection id="your-data" n={6} title="Your data stays yours">
        <LegalList>
          <li>
            You own your contacts, conversations, templates, campaign records and media. We claim no
            ownership of them.
          </li>
          <li>
            You grant us a limited licence to host, store, transmit, display and back up that data,
            solely to provide the service to you. Nothing wider.
          </li>
          <li>
            We do not sell your data, do not use it to train AI or machine-learning models, and do
            not use it for our own marketing.
          </li>
          <li>You can export your data at any time while your account is active.</li>
          <li>
            We own the software, the interface and our trademarks. These terms give you a
            non-exclusive, non-transferable right to use the service while your account is in good
            standing.
          </li>
        </LegalList>
        <p>
          How we handle data is set out in our{' '}
          <a className="text-brand hover:text-brand-strong" href="/privacy">
            Privacy Policy
          </a>
          , which forms part of these terms.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 7 */}
      <LegalSection id="availability" n={7} title="Availability and support">
        <LegalList>
          <li>
            We target <strong>{SLA.uptime} uptime</strong> per calendar month for the web app and
            API. Planned maintenance is announced in advance where we can and is excluded from that
            calculation.
          </li>
          <li>
            Support runs by email at{' '}
            <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            , with a response target of <strong>{SLA.supportResponse}</strong>.
          </li>
          <li>
            We will not access your conversations for support unless you ask us to, or law requires
            it.
          </li>
          <li>
            Outages caused by Meta, Twilio or your own connected credentials are outside our control
            and outside that target.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 8 */}
      <LegalSection id="suspension" n={8} title="Suspension and termination">
        <p>
          You can close your account at any time by writing to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Export anything you want to keep first — see the{' '}
          <a className="text-brand hover:text-brand-strong" href="/data-deletion">
            Data Deletion page
          </a>
          .
        </p>
        <p>We may suspend or terminate a workspace if:</p>
        <LegalList>
          <li>you breach these terms, particularly the opt-in and acceptable use sections;</li>
          <li>Meta or Twilio requires it, or Meta disables your WhatsApp Business Account;</li>
          <li>fees go unpaid after written notice, or we are legally compelled to;</li>
          <li>your use threatens the security or lawful operation of the platform for others.</li>
        </LegalList>
        <p>
          We give notice and a chance to fix the problem where circumstances allow. For serious
          abuse, a legal order or an active security threat, suspension may be immediate.
        </p>
        <p>
          After termination, access ends and unused credits are forfeited. Your data is deleted
          within {RETENTION.conversationDaysAfterClosure} days. Billing and tax records are kept for{' '}
          {RETENTION.billingYears} years, as Indian law requires. Sections 6, 9, 10 and 11 survive.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 9 */}
      <LegalSection id="no-meta-affiliation" n={9} title="We are not Meta">
        <LegalNote>
          {LEGAL_ENTITY} is an independent software vendor. We are <strong>not</strong> affiliated
          with, endorsed by, sponsored by, certified by, or acting as an agent of Meta Platforms,
          Inc., WhatsApp LLC or any of their group companies. We are equally independent of Twilio
          Inc.
        </LegalNote>
        <LegalList>
          <li>
            "WhatsApp", "Meta" and "Twilio" are trademarks of their respective owners, used here
            only to describe what our software connects to.
          </li>
          <li>
            Your relationship with Meta is direct and governed by Meta's own terms. We cannot
            appeal, escalate or reverse Meta's decisions for you.
          </li>
          <li>
            Nothing we say about Meta's platform is a representation on Meta's behalf. Meta assumes
            no liability for this service.
          </li>
        </LegalList>
      </LegalSection>

      {/* ----------------------------------------------------------------- 10 */}
      <LegalSection id="liability" n={10} title="Disclaimers and limitation of liability">
        <p>
          The service is provided <strong>"as is"</strong>. To the maximum extent Indian law allows,
          we disclaim implied warranties of merchantability, fitness for a particular purpose and
          non-infringement. We do not warrant that the service will be uninterrupted or error-free,
          that every message will be delivered — delivery depends on Meta, on networks and on the
          recipient's device — or that Meta will approve or keep approving your templates and
          account.
        </p>
        <p>To the maximum extent permitted by Indian law:</p>
        <LegalList>
          <li>
            Neither party is liable for indirect, incidental, special or consequential damages, or
            for lost profits, lost business or lost data.
          </li>
          <li>
            Our total aggregate liability for all claims in any 12-month period is capped at the
            fees you actually paid us in the 12 months before the event giving rise to the claim.
          </li>
          <li>
            We are not liable for Meta's or Twilio's acts — account suspension, delivery failures,
            policy or pricing changes, or platform downtime — or for your own breach of opt-in
            rules, Meta's policies, or data protection law.
          </li>
        </LegalList>
        <p>
          Nothing here limits liability that cannot be limited by law, including for fraud or for
          death or personal injury caused by negligence.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 11 */}
      <LegalSection id="indemnity" n={11} title="Indemnity">
        <p>
          You will indemnify and hold harmless {LEGAL_ENTITY} and {LEGAL_ENTITY_PRINCIPALS} against
          any claim, penalty, loss or cost (including reasonable legal fees) arising from the
          messages you sent through the service, your failure to obtain or honour opt-in, your
          breach of these terms or of Meta's or Twilio's policies, a claim by one of your customers
          about how their data was handled in your workspace, or your infringement of a third
          party's rights.
        </p>
        <p>
          We will notify you promptly of any such claim and let you control the defence, provided
          any settlement that affects us has our written consent.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 12 */}
      <LegalSection id="general" n={12} title="Changes, general terms and governing law">
        <p>
          We may update these terms. Material changes — pricing structure, liability, acceptable use
          or termination rights — are emailed to workspace admins at least <strong>30 days</strong>{' '}
          before they take effect. Minor clarifications take effect on publication. If you do not
          accept a material change, close your account before it takes effect.
        </p>
        <LegalList>
          <li>
            These terms and the Privacy Policy are the whole agreement between us. If a clause is
            unenforceable, the rest stays in force, and not enforcing a term once does not waive it.
          </li>
          <li>
            You may not assign these terms without our written consent. We may assign them to a
            successor if the business is sold or transferred.
          </li>
          <li>
            Neither party is liable for delay caused by events beyond reasonable control, including
            third-party platform outages.
          </li>
          <li>
            Nothing here creates a partnership, joint venture, agency or employment relationship.
          </li>
          <li>
            These terms are governed by the laws of India, and the courts at Mumbai, Maharashtra
            have exclusive jurisdiction. Before starting proceedings both sides will try in good
            faith to resolve the dispute for 30 days after written notice.
          </li>
        </LegalList>
      </LegalSection>

      {/* ----------------------------------------------------------------- 13 */}
      <LegalSection id="contact" n={13} title="Contact">
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
