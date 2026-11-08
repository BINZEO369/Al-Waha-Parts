import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How AL-WAHA collects, uses, shares and protects personal information when you use its website.',
};

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'AL-WAHA respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and protect information when you access or use our website.',
    ],
  },
  {
    title: 'Information We Collect',
    intro: 'We may collect the following information:',
    bullets: [
      'Name and contact details.',
      'Email address and phone number.',
      'Delivery address.',
      'Account and order information.',
      'Vehicle information provided by customers.',
      'Payment transaction details.',
      'Website usage and technical information.',
    ],
  },
  {
    title: 'Use of Information',
    intro: 'We use collected information to:',
    bullets: [
      'Process orders, bookings, and customer requests.',
      'Provide products and services.',
      'Arrange deliveries and payments.',
      'Communicate with customers.',
      'Improve website performance and customer experience.',
      'Prevent fraud and maintain website security.',
      'Comply with applicable legal obligations.',
    ],
  },
  {
    title: 'Sharing of Information',
    paragraphs: [
      'We may share personal information with payment providers, delivery partners, service providers, and authorised authorities where necessary for business operations or legal compliance.',
      'We do not sell personal information to third parties.',
    ],
  },
  {
    title: 'Cookies and Tracking',
    paragraphs: [
      'Cookie choices are saved in the first-party alwaha_cookie_consent cookie for up to 180 days, with same-device local-storage fallback if cookies are blocked. The notice offers Allow and Reject; you can reopen Privacy choices at the bottom of the site to change your decision. Necessary storefront storage remains available either way.',
      'If you select Allow, AL-WAHA records the request IP address and page views/exits, sanitized page paths without query strings, visit timing, page title, a sanitized referrer, language, timezone, screen and viewport dimensions, and coarse browser, operating-system, and device categories. A device family/model may also be recorded when the browser exposes it; exact models are often unavailable. Approximate country, region, or city may be included when trusted hosting-proxy location metadata is available. Location can be unavailable or inaccurate.',
      'Analytics requests and database writes are not made when you select Reject. The analytics tables do not store raw user-agent strings, precise GPS coordinates, form entries, query strings, or cross-session device fingerprints. The IP address is stored in the consented session record and can be viewed only by verified AL-WAHA administrators through the protected admin system. Hosting/API infrastructure may also process IP addresses for request delivery and abuse prevention, and platform logs are handled under the applicable hosting provider terms. Analytics records are not sold.',
      'The current two-choice notice does not ask for optional preference cookies, so the car-brand guide dismissal is not persisted by that choice. Cart and language preferences use local browser storage for storefront functionality.',
    ],
  },
  {
    title: 'Data Security',
    paragraphs: [
      'AL-WAHA takes reasonable technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, or loss.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'Personal information is retained only for as long as necessary to fulfil its purposes, meet legal requirements, and resolve disputes.',
    ],
  },
  {
    title: 'Your Privacy Rights',
    paragraphs: [
      'Subject to applicable laws, customers may request access to, correction of, or deletion of their personal information, or exercise other applicable privacy rights.',
    ],
  },
  {
    title: 'Third-Party Websites',
    paragraphs: [
      'Our website may contain links to third-party websites. AL-WAHA is not responsible for the privacy practices or content of external websites.',
    ],
  },
  {
    title: 'Policy Updates',
    paragraphs: [
      'AL-WAHA may update this Privacy Policy from time to time. Changes will be published on this page with an updated revision date.',
    ],
  },
  {
    title: 'Contact Information',
    paragraphs: ['For privacy-related enquiries or requests:'],
    contact: true,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell policy-page privacy-policy-page">
      <style>{`
        .policy-page { max-width: 920px; }
        .policy-page .policy-intro { margin-bottom: 34px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
        .policy-page .policy-intro .eyebrow { color: var(--red); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .policy-page h1 { margin: 10px 0 12px; font-family: 'Montserrat', sans-serif; font-size: clamp(32px, 5vw, 48px); line-height: 1.08; letter-spacing: -.045em; }
        .policy-page .policy-lead { max-width: 680px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.75; }
        .policy-page .policy-dates { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 18px; color: var(--muted); font-size: 11px; }
        .policy-page .policy-sections { display: grid; gap: 12px; }
        .policy-page .policy-section { padding: 22px 24px; border: 1px solid var(--line); border-left: 3px solid var(--red); border-radius: 12px; background: #fff; box-shadow: 0 5px 18px rgba(26, 31, 38, .035); }
        .policy-page .policy-section h2 { margin: 0 0 9px; font-family: 'Montserrat', sans-serif; font-size: 16px; line-height: 1.35; }
        .policy-page .policy-section p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.8; }
        .policy-page .policy-section p + p { margin-top: 9px; }
        .policy-page .policy-section > ul { display: grid; gap: 7px; margin: 12px 0 0; padding-left: 21px; color: var(--muted); font-size: 13px; line-height: 1.65; }
        .policy-page .policy-contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .policy-page .policy-contact-grid > div { min-width: 0; padding: 13px 14px; border: 1px solid #f1d9db; border-radius: 10px; background: #fff6f6; }
        .policy-page .policy-contact-grid strong { display: block; margin-bottom: 5px; color: var(--muted); font-size: 10px; }
        .policy-page .policy-contact-grid a, .policy-page .policy-contact-grid span { color: var(--red); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p, .policy-page .policy-section > ul { font-size: 12px; }
          .policy-page .policy-contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Legal</p>
        <h1>Privacy Policy</h1>
        <p className="policy-lead">
          How AL-WAHA collects, uses, shares and protects information when you use our website.
        </p>
        <div className="policy-dates">
          <span>Effective Date: To be confirmed</span>
          <span>Last Updated: 7 November 2026</span>
        </div>
      </header>

      <div className="policy-sections">
        {sections.map((section, index) => (
          <section className="policy-section" key={section.title}>
            <h2>
              {index + 1}. {section.title}
            </h2>
            {section.intro && <p>{section.intro}</p>}
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
            {section.contact && (
              <div className="policy-contact-grid">
                <div>
                  <strong>AL-WAHA Email</strong>
                  <a href="mailto:hello.alwaha@proton.me">hello.alwaha@proton.me</a>
                </div>
                <div>
                  <strong>Address</strong>
                  <span>Al Waha Car Scrap, Al Jubail 35428, Saudi Arabia</span>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
