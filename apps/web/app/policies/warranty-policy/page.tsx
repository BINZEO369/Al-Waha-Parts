import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warranty Policy',
  description:
    'Warranty providers, periods, coverage, claims and customer rights for AL-WAHA automotive parts.',
};

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      'AL-WAHA is committed to providing customers with transparent information regarding product warranties.',
      'Warranty periods and conditions may vary depending on the product, manufacturer, supplier and applicable warranty terms.',
    ],
  },
  {
    title: 'Warranty Provider',
    paragraphs: [
      'A product warranty may be provided by AL-WAHA, the manufacturer or the supplier.',
      'The warranty provider and applicable warranty conditions shall be specified in the relevant product information, invoice or warranty documentation.',
    ],
  },
  {
    title: 'Warranty Period',
    paragraphs: [
      'Warranty periods may vary between products.',
      'The applicable warranty period and commencement date shall be determined according to the relevant product warranty terms.',
    ],
  },
  {
    title: 'Warranty Coverage',
    paragraphs: [
      'The types of manufacturing defects, material defects or other issues covered by a warranty shall be determined according to the applicable warranty terms.',
    ],
  },
  {
    title: 'Warranty Exclusions',
    intro: 'Depending on the applicable warranty terms, warranty coverage may not apply in circumstances involving:',
    bullets: [
      'Improper installation',
      'Misuse or improper operation',
      'Unauthorised modifications',
      'Normal wear and tear',
      'Accidental or external damage',
      'Failure to follow product specifications',
      'Violation of applicable warranty conditions',
    ],
    note: 'Mandatory customer rights under applicable law shall remain unaffected.',
  },
  {
    title: 'Installation Requirements',
    paragraphs: [
      'Where specific installation requirements apply to a product warranty, such requirements shall be stated in the relevant warranty terms.',
      'Professional installation by a qualified technician is recommended where appropriate.',
    ],
  },
  {
    title: 'Warranty Claims',
    intro: 'Customers may submit warranty claims with the following information:',
    bullets: [
      'Order number or invoice',
      'Product name and part number',
      'Warranty information',
      'Description of the issue',
      'Relevant photographs or documentation',
    ],
  },
  {
    title: 'Warranty Inspection',
    paragraphs: [
      'Products may be inspected to assess warranty claims.',
      'Where necessary, products may be referred to the manufacturer or supplier for inspection.',
    ],
  },
  {
    title: 'Warranty Resolution',
    paragraphs: [
      'Where a warranty claim is approved, repair, replacement, refund or another appropriate resolution shall be provided in accordance with the applicable warranty terms and law.',
    ],
  },
  {
    title: 'Warranty Shipping',
    paragraphs: [
      'Responsibility for shipping costs associated with warranty claims shall be determined according to the applicable warranty terms and legal requirements.',
    ],
  },
  {
    title: 'Legal Rights',
    paragraphs: [
      'Nothing in this Warranty Policy shall restrict mandatory consumer rights, statutory warranties or other rights available under applicable law.',
    ],
  },
  {
    title: 'Warranty Contact',
    paragraphs: ['For warranty enquiries or claims, please contact:'],
    contact: true,
  },
];

export default function WarrantyPolicyPage() {
  return (
    <main className="page-shell policy-page warranty-policy-page">
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
        .policy-page .policy-note { margin-top: 12px !important; padding: 12px 14px; border-radius: 8px; background: #fff6f6; color: var(--ink) !important; font-size: 12px !important; }
        .policy-page .policy-contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .policy-page .policy-contact-grid > div { min-width: 0; padding: 13px 14px; border: 1px solid #f1d9db; border-radius: 10px; background: #fff6f6; }
        .policy-page .policy-contact-grid strong { display: block; margin-bottom: 5px; color: var(--muted); font-size: 10px; }
        .policy-page .policy-contact-grid a { color: var(--red); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
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
        <h1>Warranty Policy</h1>
        <p className="policy-lead">
          Information about warranty providers, periods, coverage, claims and customer rights.
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
            {section.note && <p className="policy-note">{section.note}</p>}
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
