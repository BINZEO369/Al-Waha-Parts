import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Disclaimer',
  description:
    'Product information, vehicle compatibility, pricing and use disclaimer for AL-WAHA automotive parts.',
};

const sections = [
  {
    title: 'Product Information',
    paragraphs: [
      'Product names, descriptions, specifications, part numbers, prices, photographs and other information displayed on the AL-WAHA website are provided to assist customers in identifying and selecting automotive parts.',
    ],
  },
  {
    title: 'Vehicle Compatibility',
    paragraphs: [
      'Product compatibility may depend on vehicle brand, model, model year, engine type, part number and other technical specifications.',
      'A product should not be assumed to be compatible with every vehicle solely because the vehicle belongs to the same brand or model range.',
    ],
  },
  {
    title: 'Compatibility Verification',
    paragraphs: [
      'Customers are encouraged to verify product compatibility before completing a purchase.',
      'Where compatibility is uncertain, customers may contact AL-WAHA Customer Support before placing an order.',
    ],
  },
  {
    title: 'Product Photographs',
    paragraphs: [
      'Product photographs displayed on the website may differ slightly from the actual product in colour, size, packaging or other visual characteristics.',
      'The actual product specifications and descriptions shall be considered when identifying product characteristics.',
    ],
  },
  {
    title: 'Genuine, OEM and Aftermarket Products',
    paragraphs: [
      'Product descriptions identifying items as Genuine, Original, OEM or Aftermarket shall be based on verified product information and relevant supplier documentation.',
      'Products shall not be represented as Genuine, Original or OEM without an appropriate basis for such claims.',
    ],
  },
  {
    title: 'Part Numbers',
    paragraphs: [
      'Manufacturer part numbers and reference numbers may be used to assist customers in identifying suitable automotive parts.',
      'Such identifiers are provided for identification and compatibility purposes.',
    ],
  },
  {
    title: 'Pricing and Availability',
    paragraphs: [
      'Product prices, stock availability and specifications may change.',
      'Applicable prices and availability shall be communicated during order processing and confirmation.',
    ],
  },
  {
    title: 'Installation and Use',
    paragraphs: [
      'Customers are encouraged to seek assistance from qualified technicians where professional installation is necessary.',
      'Incorrect installation, improper use or failure to follow applicable specifications may result in product damage or performance issues.',
    ],
  },
  {
    title: 'Product Information Errors',
    paragraphs: [
      'Customers may contact AL-WAHA Customer Support if any product description, specification or compatibility information appears incorrect or incomplete.',
    ],
  },
  {
    title: 'Customer Rights',
    paragraphs: [
      'Nothing in this disclaimer shall limit any mandatory customer rights relating to returns, refunds, warranties or consumer protection under applicable law.',
    ],
  },
];

export default function ProductDisclaimerPage() {
  return (
    <main className="page-shell policy-page">
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
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p { font-size: 12px; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Legal</p>
        <h1>Product Disclaimer</h1>
        <p className="policy-lead">
          Important information about product details, vehicle compatibility, pricing and use.
        </p>
      </header>

      <div className="policy-sections">
        {sections.map((section, index) => (
          <section className="policy-section" key={section.title}>
            <h2>
              {index + 1}. {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
