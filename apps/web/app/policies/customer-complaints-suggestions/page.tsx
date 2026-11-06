import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Complaints & Suggestions Policy',
  description:
    'How customers can submit complaints and suggestions to AL-WAHA and how they are reviewed.',
};

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'AL-WAHA values customer feedback, complaints and suggestions.',
      'This policy is intended to support effective problem resolution, service improvement and transparent business relationships.',
    ],
  },
  {
    title: 'Complaint Submission Channels',
    intro: 'Customers may submit complaints or suggestions through the following channels:',
    bullets: [
      'Email',
      'Customer Support Telephone',
      'Website Contact Form',
      'Website Complaint Form',
      'Other published communication channels',
    ],
  },
  {
    title: 'Complaint Categories',
    intro: 'Customers may submit complaints concerning:',
    bullets: [
      'Incorrect or incomplete product information',
      'Incorrect products supplied',
      'Damaged or defective products',
      'Order processing issues',
      'Payment-related issues',
      'Delivery delays',
      'Return and refund issues',
      'Warranty claims',
      'Customer service',
      'Privacy and personal data',
      'Website technical issues',
      'Other business-related matters',
    ],
  },
  {
    title: 'Information Required for Complaints',
    intro: 'To facilitate complaint review, customers may provide the following information where applicable:',
    bullets: [
      'Name',
      'Contact information',
      'Order number',
      'Product name',
      'Complaint subject',
      'Detailed description of the issue',
      'Relevant photographs or documentation',
    ],
  },
  {
    title: 'Complaint Acknowledgement',
    paragraphs: [
      'Following receipt of a complaint, AL-WAHA may provide an acknowledgement or complaint reference number where appropriate.',
    ],
  },
  {
    title: 'Complaint Review',
    paragraphs: [
      'Complaints shall be reviewed by the relevant department or Customer Support Team.',
      'Additional information or documentation may be requested from customers where necessary.',
    ],
  },
  {
    title: 'Complaint Response',
    paragraphs: [
      'AL-WAHA shall endeavour to respond within a reasonable timeframe based on the nature, complexity and verification requirements of the complaint.',
      'Where appropriate, customers shall be informed of the expected response or resolution timeframe.',
    ],
  },
  {
    title: 'Complaint Resolution',
    intro: 'Depending on the nature of the complaint, appropriate actions may include:',
    bullets: [
      'Providing clarification',
      'Correcting product information',
      'Correcting orders',
      'Processing returns or refunds',
      'Reviewing warranty claims',
      'Resolving delivery issues',
      'Providing technical assistance',
      'Taking other appropriate measures',
    ],
  },
  {
    title: 'Complaint Escalation',
    paragraphs: [
      'Where a customer is dissatisfied with the initial resolution, the customer may request further review.',
      'Where appropriate, the complaint may be escalated to the responsible officer or management.',
    ],
  },
  {
    title: 'Customer Rights',
    paragraphs: [
      'Nothing in this policy shall restrict mandatory consumer rights, legal remedies or complaint rights available under applicable law.',
    ],
  },
  {
    title: 'Suggestions and Feedback',
    paragraphs: [
      'Customers may submit suggestions and feedback to help AL-WAHA improve its products, services, website and business operations.',
    ],
  },
  {
    title: 'Contact Information',
    paragraphs: ['For complaints and suggestions, please contact:'],
    contact: true,
  },
];

export default function CustomerComplaintsPolicyPage() {
  return (
    <main className="page-shell policy-page complaints-policy-page">
      <style>{`
        .policy-page { max-width: 920px; }
        .policy-page .policy-intro { margin-bottom: 34px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
        .policy-page .policy-intro .eyebrow { color: var(--red); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .policy-page h1 { margin: 10px 0 12px; font-family: 'Montserrat', sans-serif; font-size: clamp(32px, 5vw, 48px); line-height: 1.08; letter-spacing: -.045em; }
        .policy-page .policy-lead { max-width: 680px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.75; }
        .policy-page .policy-sections { display: grid; gap: 12px; }
        .policy-page .policy-section { padding: 22px 24px; border: 1px solid var(--line); border-left: 3px solid var(--red); border-radius: 12px; background: #fff; box-shadow: 0 5px 18px rgba(26, 31, 38, .035); }
        .policy-page .policy-section h2 { margin: 0 0 9px; font-family: 'Montserrat', sans-serif; font-size: 16px; line-height: 1.35; }
        .policy-page .policy-section p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.8; }
        .policy-page .policy-section p + p { margin-top: 9px; }
        .policy-page .policy-section > ul { display: grid; gap: 7px; margin: 12px 0 0; padding-left: 21px; color: var(--muted); font-size: 13px; line-height: 1.65; }
        .policy-page .policy-contact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .policy-page .policy-contact-grid > div { min-width: 0; padding: 13px 14px; border: 1px solid #f1d9db; border-radius: 10px; background: #fff6f6; }
        .policy-page .policy-contact-grid strong { display: block; margin-bottom: 5px; color: var(--muted); font-size: 10px; }
        .policy-page .policy-contact-grid a, .policy-page .policy-contact-grid span { color: var(--ink); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        .policy-page .policy-effective-date { margin-top: 18px !important; color: var(--muted); font-size: 11px !important; }
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p, .policy-page .policy-section > ul { font-size: 12px; }
          .policy-page .policy-contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Customer Care</p>
        <h1>Customer Complaints &amp; Suggestions Policy</h1>
        <p className="policy-lead">
          How to share feedback or raise a concern, and how AL-WAHA reviews and responds to
          complaints.
        </p>
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
              <>
                <div className="policy-contact-grid">
                  <div>
                    <strong>Email</strong>
                    <a href="mailto:hello.alwaha@proton.me">hello.alwaha@proton.me</a>
                  </div>
                  <div>
                    <strong>Telephone</strong>
                    <a href="tel:0533866922">0533866922</a>
                  </div>
                  <div>
                    <strong>Business Hours</strong>
                    <span>Mon–Sat · 08:00–18:00</span>
                  </div>
                </div>
                <p className="policy-effective-date">
                  Effective Date: To be confirmed · Last Updated: 6 November 2026
                </p>
              </>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
