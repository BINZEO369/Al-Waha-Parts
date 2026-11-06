import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description:
    'Return eligibility, refund processing, cancellation and customer rights for AL-WAHA orders.',
};

const sections = [
  {
    title: 'Return Eligibility',
    paragraphs: [
      'Products may be returned if they are incorrect, damaged, defective, or otherwise eligible under applicable laws.',
      'Returned products must be unused, uninstalled, undamaged, and accompanied by their original packaging and accessories, where applicable.',
    ],
  },
  {
    title: 'Non-Returnable Products',
    paragraphs: [
      'Products that have been installed, used, modified, or damaged due to improper handling may not be eligible for return, except where required by applicable law.',
    ],
  },
  {
    title: 'Return Requests',
    paragraphs: [
      'Customers must contact AL-WAHA Customer Support and provide their order number, product details, and reason for return. Return instructions must be obtained before sending products back.',
    ],
  },
  {
    title: 'Inspection',
    paragraphs: [
      'Returned products may be inspected to determine eligibility for a return, replacement, or refund.',
    ],
  },
  {
    title: 'Refunds',
    paragraphs: [
      'Approved refunds will be issued through the original payment method or another agreed lawful method. Processing times may vary depending on the payment provider.',
    ],
  },
  {
    title: 'Return Shipping',
    paragraphs: [
      'Return shipping costs will be determined according to the reason for return and applicable laws.',
    ],
  },
  {
    title: 'Order Cancellation',
    paragraphs: [
      'Orders may be cancelled before dispatch, subject to applicable conditions. Dispatched orders are subject to the return policy.',
    ],
  },
  {
    title: 'Consumer Rights',
    paragraphs: [
      'Nothing in this policy limits or excludes mandatory consumer rights under the applicable laws of the Kingdom of Saudi Arabia.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [],
    contact: true,
  },
];

export default function ReturnRefundPolicyPage() {
  return (
    <main className="page-shell policy-page return-refund-policy-page">
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
        .policy-page .policy-contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .policy-page .policy-contact-grid > div { min-width: 0; padding: 13px 14px; border: 1px solid #f1d9db; border-radius: 10px; background: #fff6f6; }
        .policy-page .policy-contact-grid strong { display: block; margin-bottom: 5px; color: var(--muted); font-size: 10px; }
        .policy-page .policy-contact-grid a { color: var(--red); font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p { font-size: 12px; }
          .policy-page .policy-contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Customer Care</p>
        <h1>Return &amp; Refund Policy</h1>
        <p className="policy-lead">
          Information about return eligibility, refund processing, order cancellation and customer
          rights.
        </p>
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
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
