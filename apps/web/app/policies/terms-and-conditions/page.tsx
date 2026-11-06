import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms governing access to and use of the AL-WAHA website, products, services and online features.',
};

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'These Terms & Conditions govern access to and use of the AL-WAHA website, including its products, services, and online features. By accessing or using this website, you agree to these terms.',
    ],
  },
  {
    title: 'Website Use',
    paragraphs: [
      'Users must provide accurate information and use the website lawfully. Any fraudulent, abusive, or unauthorised activity is prohibited.',
    ],
  },
  {
    title: 'Products and Information',
    paragraphs: [
      'AL-WAHA endeavours to provide accurate product descriptions, specifications, prices, and availability. Product images may differ slightly from actual products.',
      'Customers are responsible for verifying vehicle compatibility and product suitability before purchase.',
    ],
  },
  {
    title: 'Orders and Payments',
    paragraphs: [
      'All orders and bookings are subject to confirmation and availability. AL-WAHA reserves the right to reject or cancel orders where necessary, including pricing errors, stock limitations, or suspected fraudulent activity, subject to applicable law.',
      'Customers must provide accurate order and payment information.',
    ],
  },
  {
    title: 'Delivery',
    paragraphs: [
      'Delivery times are estimates and may vary due to operational circumstances, location, or external factors. Delivery charges and applicable conditions will be communicated where relevant.',
    ],
  },
  {
    title: 'Returns and Refunds',
    paragraphs: [
      'Returns, replacements, cancellations, and refunds are governed by the AL-WAHA Return & Refund Policy and applicable Saudi Arabian laws.',
    ],
  },
  {
    title: 'Warranty',
    paragraphs: [
      'Products may be subject to manufacturer, supplier, or AL-WAHA warranties where applicable. Warranty coverage and conditions are governed by the relevant Warranty Policy.',
    ],
  },
  {
    title: 'Intellectual Property',
    paragraphs: [
      'Website content, photographs, text, designs, and materials are protected by applicable intellectual property laws. Vehicle manufacturer trademarks and logos remain the property of their respective owners.',
      'Unauthorised reproduction, distribution, or commercial use of website content is prohibited.',
    ],
  },
  {
    title: 'Limitation of Liability',
    paragraphs: [
      'AL-WAHA shall not be responsible for losses arising from improper product installation, misuse, or failure to verify compatibility, except where liability cannot be excluded under applicable law.',
    ],
  },
  {
    title: 'Website Availability',
    paragraphs: [
      'AL-WAHA may modify, suspend, or discontinue website features or services where necessary for maintenance, security, or operational purposes.',
    ],
  },
  {
    title: 'Governing Law',
    paragraphs: [
      'These Terms & Conditions shall be governed by the applicable laws and regulations of the Kingdom of Saudi Arabia.',
    ],
  },
  {
    title: 'Amendments',
    paragraphs: [
      'AL-WAHA reserves the right to update these Terms & Conditions at any time. Updated terms will be published on this website.',
    ],
  },
  {
    title: 'Contact Information',
    paragraphs: [],
    contact: true,
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="page-shell policy-page terms-policy-page">
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
        .policy-page .policy-contact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .policy-page .policy-contact-grid > div { min-width: 0; padding: 13px 14px; border: 1px solid #f1d9db; border-radius: 10px; background: #fff6f6; }
        .policy-page .policy-contact-grid strong { display: block; margin-bottom: 5px; color: var(--muted); font-size: 10px; }
        .policy-page .policy-contact-grid a, .policy-page .policy-contact-grid span { color: var(--red); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p { font-size: 12px; }
          .policy-page .policy-contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Legal</p>
        <h1>Terms &amp; Conditions</h1>
        <p className="policy-lead">
          Terms governing access to and use of the AL-WAHA website, products and services.
        </p>
        <div className="policy-dates">
          <span>Effective Date: To be confirmed</span>
          <span>Last Updated: 6 November 2026</span>
        </div>
      </header>

      <div className="policy-sections">
        {sections.map((section, index) => (
          <section className="policy-section" key={section.title}>
            <h2>
              {index + 1}. {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.contact && (
              <div className="policy-contact-grid">
                <div>
                  <strong>Email</strong>
                  <a href="mailto:hello.alwaha@proton.me">hello.alwaha@proton.me</a>
                </div>
                <div>
                  <strong>Phone</strong>
                  <a href="tel:0533866922">0533866922</a>
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
