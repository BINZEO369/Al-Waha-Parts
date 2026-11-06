import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description:
    'Shipping, delivery areas, order processing, tracking and delivery support policy for AL-WAHA.',
};

const sections = [
  {
    title: 'Introduction',
    paragraphs: [
      "AL-WAHA arranges shipping and delivery of ordered products to customers' designated delivery addresses.",
    ],
  },
  {
    title: 'Delivery Areas',
    paragraphs: [
      'Delivery services shall be available in designated regions, cities and locations.',
      'Availability of delivery services to a particular location shall be verified during order processing.',
    ],
  },
  {
    title: 'Delivery Charges',
    paragraphs: [
      'Delivery charges may depend on product type, delivery location, shipment size and the logistics service used.',
      'Applicable delivery charges shall be communicated to customers before order confirmation.',
    ],
  },
  {
    title: 'Estimated Delivery Time',
    paragraphs: [
      'Estimated delivery times may depend on delivery location, stock availability, order processing and logistics provider arrangements.',
      'Where applicable, estimated delivery times shall be communicated before order completion.',
    ],
  },
  {
    title: 'Order Processing',
    paragraphs: [
      'Following order confirmation and payment verification, products shall be prepared for shipment.',
      'Processing times may vary depending on stock availability and other circumstances.',
    ],
  },
  {
    title: 'Delivery Tracking',
    paragraphs: [
      'Where tracking services are available, customers may use the provided tracking information to monitor delivery status.',
    ],
  },
  {
    title: 'Delivery Address',
    paragraphs: [
      'Customers must provide accurate and complete delivery addresses.',
      'Requests to change delivery addresses may be accepted before shipment, subject to order status and logistics conditions.',
    ],
  },
  {
    title: 'Failed Delivery',
    paragraphs: [
      'Where delivery cannot be completed due to an incorrect address, recipient unavailability, communication issues or other circumstances, AL-WAHA may contact the customer to arrange further delivery steps.',
      'Additional delivery charges may apply where permitted and applicable.',
    ],
  },
  {
    title: 'Delivery Delays',
    paragraphs: [
      'Where delivery is delayed beyond the expected timeframe, AL-WAHA shall provide appropriate updates and assistance where applicable.',
      'Customers shall retain their delay-related rights under applicable law.',
    ],
  },
  {
    title: 'Damaged Shipments',
    paragraphs: [
      'Customers may contact Customer Support if a package or product is received damaged.',
      'Photographs, order numbers and other relevant information may be requested.',
    ],
  },
  {
    title: 'Delivery Confirmation',
    paragraphs: [
      'Delivery confirmation or other appropriate evidence may be provided through the relevant logistics provider.',
    ],
  },
  {
    title: 'Contact Information',
    paragraphs: ['For shipping and delivery enquiries or complaints, please contact:'],
    contact: true,
  },
];

export default function ShippingDeliveryPolicyPage() {
  return (
    <main className="page-shell policy-page shipping-policy-page">
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
        .policy-page .policy-effective-date { margin-top: 18px !important; color: var(--muted); font-size: 11px !important; }
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
        <h1>Shipping &amp; Delivery Policy</h1>
        <p className="policy-lead">
          Information about delivery areas, charges, order processing, tracking and delivery support.
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
