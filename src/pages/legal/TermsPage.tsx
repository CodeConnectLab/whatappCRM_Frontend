import {
  Fill,
  LegalLayout,
  LegalList,
  LegalNote,
  LegalSection,
  LegalSubhead,
} from './LegalLayout.tsx';
import {
  APP_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE_FILL,
  EFFECTIVE_DATE,
  LAST_UPDATED,
  LEGAL_ENTITY,
  LEGAL_ENTITY_SUFFIX_FILL,
  PRODUCT_NAME,
  REGISTERED_ADDRESS_LINES,
  RETENTION,
} from './legalConfig.ts';

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle={`The agreement between ${LEGAL_ENTITY} and any business using ${PRODUCT_NAME}.`}
    >
      <LegalNote>
        These terms are between {LEGAL_ENTITY} and the business that opens a workspace. By creating
        an account, or letting your staff use one, you accept them on behalf of your business. If
        you are not authorised to bind your business, do not create an account.
      </LegalNote>

      {/* ------------------------------------------------------------------ 1 */}
      <LegalSection id="service" n={1} title="What the service is">
        <p>
          {PRODUCT_NAME} is a multi-tenant web application at{' '}
          <a className="text-brand hover:text-brand-strong" href={APP_URL}>
            {APP_URL}
          </a>
          . It lets your business connect its own WhatsApp Business number through Meta's WhatsApp
          Business Cloud API (or through Twilio) and manage customer conversations from a shared
          inbox.
        </p>
        <p>The service includes:</p>
        <LegalList>
          <li>A shared inbox with real-time inbound and outbound WhatsApp messaging.</li>
          <li>Contact management, including CSV import.</li>
          <li>Message templates, submitted through us to Meta for approval.</li>
          <li>Broadcast campaigns with per-recipient delivery reporting.</li>
          <li>Per-user roles, a configuration audit log, and message credit accounting.</li>
          <li>An optional bridge that pushes leads into your own CRM.</li>
        </LegalList>
        <p>
          We provide software. We do not provide the WhatsApp network itself, do not guarantee that
          Meta will approve your templates or your WhatsApp Business Account, and do not control
          Meta's pricing, rate limits or policy decisions.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 2 */}
      <LegalSection id="eligibility" n={2} title="Who can use it">
        <LegalList>
          <li>You must be a business or other legal entity, or acting for one.</li>
          <li>Every user must be at least 18 years old. The service is not for consumers.</li>
          <li>
            You must be able to enter a binding contract, and must not be barred from receiving our
            services under Indian law or under Meta's or Twilio's terms.
          </li>
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
          You are the data controller for your customers' data. These obligations are yours, not
          ours, and breaching them is the fastest way to lose both your workspace and your WhatsApp
          Business Account.
        </p>

        <LegalSubhead>3.1 Opt-in</LegalSubhead>
        <LegalList>
          <li>
            Obtain valid, documented opt-in from every person before you message them. The opt-in
            must make clear that they will receive WhatsApp messages, and from which business.
          </li>
          <li>Keep proof of that opt-in, and produce it if we or Meta ask.</li>
          <li>
            Honour opt-outs immediately. If someone asks you to stop, stop — across every campaign
            and every template.
          </li>
          <li>
            Never upload a purchased, scraped or rented contact list, and never message numbers that
            did not opt in to hear from <em>you</em>.
          </li>
        </LegalList>

        <LegalSubhead>3.2 Meta's policies</LegalSubhead>
        <p>
          Your use of the service is also governed by Meta's rules, which apply to you directly.
          Read and follow:
        </p>
        <LegalList>
          <li>
            the{' '}
            <a
              className="text-brand hover:text-brand-strong"
              href="https://business.whatsapp.com/policy"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Business Messaging Policy
            </a>
            ;
          </li>
          <li>
            the{' '}
            <a
              className="text-brand hover:text-brand-strong"
              href="https://www.whatsapp.com/legal/commerce-policy"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Commerce Policy
            </a>
            , which lists goods and services that may not be sold over WhatsApp;
          </li>
          <li>
            the{' '}
            <a
              className="text-brand hover:text-brand-strong"
              href="https://www.whatsapp.com/legal/business-terms"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Business Terms
            </a>{' '}
            and Meta's{' '}
            <a
              className="text-brand hover:text-brand-strong"
              href="https://developers.facebook.com/terms/"
              target="_blank"
              rel="noreferrer"
            >
              Platform Terms
            </a>
            .
          </li>
        </LegalList>
        <p>
          If Meta suspends or restricts your WhatsApp Business Account or phone number, the service
          stops working for you, and there is nothing we can do about it on your behalf. Fees
          already paid are not refunded in that situation.
        </p>

        <LegalSubhead>3.3 Your account and credentials</LegalSubhead>
        <LegalList>
          <li>
            Keep login credentials confidential, use a strong unique password, and remove staff
            accounts promptly when people leave.
          </li>
          <li>
            The Meta, Twilio and CRM credentials you enter are yours. You confirm you are entitled
            to use them and to authorise us to use them on your behalf.
          </li>
          <li>Tell us at once if you suspect unauthorised access to your workspace.</li>
        </LegalList>

        <LegalSubhead>3.4 Data protection compliance</LegalSubhead>
        <LegalList>
          <li>
            Give your customers a privacy notice of your own, and a lawful basis for the messaging
            you do.
          </li>
          <li>
            Answer your customers' access, correction and deletion requests. Where you need us to
            act, instruct us and we will.
          </li>
          <li>
            Do not upload special-category data — health records, financial account credentials,
            government ID numbers, biometric data — into contact fields or metadata.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 4 */}
      <LegalSection id="acceptable-use" n={4} title="Acceptable use">
        <p>You must not use the service to:</p>
        <LegalList>
          <li>send spam, bulk unsolicited messages, or messages to people who did not opt in;</li>
          <li>
            send anything unlawful, fraudulent, deceptive, defamatory, obscene, hateful, or
            threatening;
          </li>
          <li>
            impersonate another business or person, or misrepresent who is sending a message;
          </li>
          <li>
            promote goods or services prohibited by the WhatsApp Commerce Policy or by Indian law;
          </li>
          <li>
            run phishing, malware distribution, or any attempt to obtain credentials or payment
            details under false pretences;
          </li>
          <li>
            target children, or send age-restricted content to anyone without checking their age;
          </li>
          <li>
            probe, scan, overload, reverse-engineer, scrape or circumvent rate limits or access
            controls on our systems;
          </li>
          <li>
            resell, sublicense or provide the service to a third party as your own product without a
            written reseller agreement from us;
          </li>
          <li>
            attempt to reach another workspace's data, or use the service to build a competing
            product.
          </li>
        </LegalList>
        <p>
          We do not monitor your conversations. If we receive a credible report of abuse, or Meta
          notifies us of a policy breach in your workspace, we may investigate the minimum necessary
          to assess it.
        </p>
      </LegalSection>

      {/* ------------------------------------------------------------------ 5 */}
      <LegalSection id="credits" n={5} title="Message credits, fees and billing">
        <LegalList>
          <li>
            The service runs on prepaid <strong>message credits</strong>. Sending a message debits
            your workspace's balance, recorded in a ledger you can view at any time.
          </li>
          <li>
            Current prices for credits and subscription plans are those quoted to you in writing or
            shown in the app at the time of purchase:{' '}
            <Fill>pricing terms — plan fees, credit rate, and minimum top-up</Fill>.
          </li>
          <li>
            If your balance runs out, outbound sending and campaigns stop until you top up. Inbound
            messages continue to arrive.
          </li>
          <li>
            Credits are prepaid and <strong>non-refundable</strong>, except where a refund is
            required by law or where we are plainly at fault for a failed charge. Unused credits are
            forfeited when the account closes.
          </li>
          <li>
            Charges Meta or Twilio levy for conversations are separate from our fees and are
            governed by your agreement with them.
          </li>
          <li>
            Fees are exclusive of GST and other applicable Indian taxes, which are added at the
            prevailing rate.
          </li>
          <li>
            We may change prices on <strong>30 days'</strong> written notice. Credits already bought
            keep their original rate.
          </li>
          <li>
            A message debited and handed to Meta for delivery is chargeable even if the recipient
            never reads it. We do not refund credits for messages Meta rejects for policy reasons on
            your side.
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
          <li>
            You can export your data at any time while your account is active, and ask us for an
            export.
          </li>
          <li>
            We own the software, the interface and our trademarks. These terms give you a
            non-exclusive, non-transferable right to use the service while your account is in good
            standing — nothing more.
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
            We aim to keep the service available and will give advance notice of planned maintenance
            where we can. Service level commitment:{' '}
            <Fill>uptime SLA, e.g. "99.5% monthly" — or state that no SLA is offered</Fill>.
          </li>
          <li>
            Support runs by email at{' '}
            <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . Response target: <Fill>support response target, e.g. "1 business day"</Fill>.
          </li>
          <li>
            We will not access your conversations for support unless you ask us to, or the law
            requires it.
          </li>
          <li>
            Outages caused by Meta, Twilio, or your own connected credentials are outside our
            control and outside any SLA.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 8 */}
      <LegalSection id="suspension" n={8} title="Suspension and termination">
        <LegalSubhead>By you</LegalSubhead>
        <p>
          Close your account at any time by writing to{' '}
          <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          . Export anything you want to keep first — see the{' '}
          <a className="text-brand hover:text-brand-strong" href="/data-deletion">
            Data Deletion page
          </a>{' '}
          for what happens next.
        </p>

        <LegalSubhead>By us</LegalSubhead>
        <p>We may suspend or terminate a workspace if:</p>
        <LegalList>
          <li>you breach these terms, particularly the opt-in and acceptable use sections;</li>
          <li>
            Meta or Twilio requires it, or your WhatsApp Business Account is disabled by Meta;
          </li>
          <li>fees go unpaid after written notice;</li>
          <li>we are legally compelled to;</li>
          <li>
            your use threatens the security, stability or lawful operation of the platform for
            others.
          </li>
        </LegalList>
        <p>
          We give notice and a chance to fix the problem where circumstances allow. For serious
          abuse, a legal order, or an active security threat, suspension may be immediate — we will
          tell you why afterwards.
        </p>

        <LegalSubhead>After termination</LegalSubhead>
        <LegalList>
          <li>Access ends and unused credits are forfeited.</li>
          <li>
            Your data is deleted within {RETENTION.conversationDaysAfterClosure} days — export
            before then.
          </li>
          <li>
            Billing and tax records are kept for {RETENTION.billingYears} years, as Indian law
            requires.
          </li>
          <li>
            Sections 6, 9, 10, 11 and 12 survive termination.
          </li>
        </LegalList>
      </LegalSection>

      {/* ------------------------------------------------------------------ 9 */}
      <LegalSection id="no-meta-affiliation" n={9} title="We are not Meta">
        <LegalNote>
          {LEGAL_ENTITY} is an independent software vendor. We are <strong>not</strong> affiliated
          with, endorsed by, sponsored by, certified by, or acting as an agent of Meta Platforms,
          Inc., WhatsApp LLC, or any of their group companies. We are equally independent of Twilio
          Inc.
        </LegalNote>
        <LegalList>
          <li>
            "WhatsApp", "Meta", "Facebook", "Instagram" and "Twilio" are trademarks of their
            respective owners, used here only to describe what our software connects to.
          </li>
          <li>
            We are a technology provider that integrates with the WhatsApp Business Cloud API. We do
            not operate the WhatsApp service, set its prices, or make its policy decisions.
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
      <LegalSection id="warranties" n={10} title="Disclaimers">
        <p>
          The service is provided <strong>"as is"</strong> and <strong>"as available"</strong>. To
          the maximum extent Indian law allows, we disclaim all implied warranties of
          merchantability, fitness for a particular purpose, and non-infringement.
        </p>
        <p>We do not warrant that:</p>
        <LegalList>
          <li>the service will be uninterrupted, error-free, or free of every security flaw;</li>
          <li>every message will be delivered — delivery depends on Meta, on networks, and on the
            recipient's device;</li>
          <li>Meta will approve your templates, your account, or keep either approved;</li>
          <li>the service meets any regulatory requirement specific to your industry.</li>
        </LegalList>
      </LegalSection>

      {/* ----------------------------------------------------------------- 11 */}
      <LegalSection id="liability" n={11} title="Limitation of liability">
        <p>To the maximum extent permitted by Indian law:</p>
        <LegalList>
          <li>
            Neither party is liable for indirect, incidental, special, consequential or punitive
            damages, or for lost profits, lost revenue, lost business opportunity, lost goodwill, or
            lost or corrupted data.
          </li>
          <li>
            Our total aggregate liability for all claims in any 12-month period is capped at the
            total fees you actually paid us in the 12 months before the event giving rise to the
            claim.
          </li>
          <li>
            We are not liable for anything caused by Meta or Twilio — suspension of your account,
            message delivery failures, policy changes, pricing changes, or platform downtime.
          </li>
          <li>
            We are not liable for your own breach of opt-in rules, of Meta's policies, or of data
            protection law.
          </li>
        </LegalList>
        <p>
          Nothing here limits liability that cannot be limited by law, including liability for fraud
          or for death or personal injury caused by negligence.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 12 */}
      <LegalSection id="indemnity" n={12} title="Indemnity">
        <p>
          You will indemnify and hold harmless {LEGAL_ENTITY}, its directors, employees and
          contractors against any claim, demand, penalty, loss or cost (including reasonable legal
          fees) arising from:
        </p>
        <LegalList>
          <li>messages you sent through the service, and their content;</li>
          <li>your failure to obtain or honour opt-in and opt-out;</li>
          <li>
            your breach of these terms, of Meta's or Twilio's policies, or of any applicable law
            including data protection and consumer protection law;
          </li>
          <li>
            a claim by one of your customers about how their personal data was handled in your
            workspace;
          </li>
          <li>your infringement of a third party's intellectual property or privacy rights.</li>
        </LegalList>
        <p>
          We will notify you promptly of any such claim and let you control the defence, provided
          any settlement that affects us has our written consent.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 13 */}
      <LegalSection id="changes" n={13} title="Changes to these terms">
        <p>
          We may update these terms. Material changes — pricing structure, liability, acceptable
          use, or termination rights — are emailed to workspace admins at least{' '}
          <strong>30 days</strong> before they take effect. Minor clarifications take effect on
          publication, with the "Last updated" date changed.
        </p>
        <p>
          If you do not accept a material change, close your account before it takes effect.
          Continuing to use the service afterwards means you accept the updated terms.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 14 */}
      <LegalSection id="general" n={14} title="General">
        <LegalList>
          <li>
            <strong>Entire agreement.</strong> These terms, the Privacy Policy and any written order
            form are the whole agreement between us, and replace any prior discussion.
          </li>
          <li>
            <strong>Severability.</strong> If a clause is held unenforceable, the rest stays in
            force.
          </li>
          <li>
            <strong>No waiver.</strong> Not enforcing a term once does not waive it.
          </li>
          <li>
            <strong>Assignment.</strong> You may not assign these terms without our written consent.
            We may assign them to a successor in a merger or acquisition.
          </li>
          <li>
            <strong>Force majeure.</strong> Neither party is liable for delay caused by events
            beyond reasonable control, including third-party platform outages.
          </li>
          <li>
            <strong>Notices.</strong> We write to your registered workspace email; you write to{' '}
            <a className="text-brand hover:text-brand-strong" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </li>
          <li>
            <strong>Relationship.</strong> Nothing here creates a partnership, joint venture, agency
            or employment relationship.
          </li>
        </LegalList>
      </LegalSection>

      {/* ----------------------------------------------------------------- 15 */}
      <LegalSection id="governing-law" n={15} title="Governing law and disputes">
        <p>
          These terms are governed by the laws of India. The courts at Mumbai, Maharashtra have
          exclusive jurisdiction.
        </p>
        <p>
          Before starting proceedings, both sides will try in good faith to resolve the dispute by
          discussion for 30 days after written notice. Either party may still seek urgent injunctive
          relief at any time.
        </p>
      </LegalSection>

      {/* ----------------------------------------------------------------- 16 */}
      <LegalSection id="contact" n={16} title="Contact">
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
