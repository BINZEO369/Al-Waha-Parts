import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Policies',
  description:
    'Browse AL-WAHA customer, product, shipping, warranty and legal policies.',
};

const policies = [
  {
    title: 'Trademark Disclaimer',
    bangla: 'ট্রেডমার্ক সংক্রান্ত ঘোষণা',
    description: 'Third-party vehicle marks, identification and compatibility.',
    href: '/policies/trademark-disclaimer',
  },
  {
    title: 'Copyright Disclaimer',
    bangla: 'কপিরাইট সংক্রান্ত ঘোষণা',
    description: 'Copyright ownership, permitted use and complaints.',
    href: '/policies/copyright-disclaimer',
  },
  {
    title: 'Product Disclaimer',
    bangla: 'পণ্য সংক্রান্ত ঘোষণা',
    description: 'Product details, fitment, pricing and use information.',
    href: '/policies/product-disclaimer',
  },
  {
    title: 'Privacy Policy',
    bangla: 'গোপনীয়তা নীতিমালা',
    description: 'How personal information is collected and protected.',
    href: '/policies/privacy-policy',
  },
  {
    title: 'Terms & Conditions',
    bangla: 'শর্তাবলি',
    description: 'Terms for using the AL-WAHA website and services.',
    href: '/policies/terms-and-conditions',
  },
  {
    title: 'Return & Refund Policy',
    bangla: 'পণ্য ফেরত ও অর্থ ফেরত নীতিমালা',
    description: 'Return eligibility, cancellations and refunds.',
    href: '/policies/return-refund-policy',
  },
  {
    title: 'Warranty Policy',
    bangla: 'ওয়ারেন্টি নীতিমালা',
    description: 'Warranty coverage, exclusions and claims.',
    href: '/policies/warranty-policy',
  },
  {
    title: 'Customer Complaints & Suggestions Policy',
    bangla: 'গ্রাহক অভিযোগ ও পরামর্শ নীতিমালা',
    description: 'How to submit feedback and request complaint reviews.',
    href: '/policies/customer-complaints-suggestions',
  },
  {
    title: 'Shipping & Delivery Policy',
    bangla: 'শিপিং ও ডেলিভারি নীতিমালা',
    description: 'Delivery areas, charges, tracking and delivery support.',
    href: '/policies/shipping-delivery',
  },
];

export default function PoliciesPage() {
  return (
    <main className="page-shell policies-index-page">
      <style>{`
        .policies-index-page { max-width: 1120px; }
        .policies-index-page .policies-intro { margin-bottom: 30px; }
        .policies-index-page .eyebrow { color: var(--red); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .policies-index-page h1 { margin: 10px 0 12px; font-family: 'Montserrat', sans-serif; font-size: clamp(34px, 5vw, 52px); line-height: 1.08; letter-spacing: -.045em; }
        .policies-index-page .policies-lead { max-width: 660px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.75; }
        .policies-index-page .policies-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .policies-index-page .policy-card { min-height: 190px; padding: 20px; display: flex; flex-direction: column; align-items: flex-start; border: 1px solid var(--line); border-left: 3px solid var(--red); border-radius: 15px; background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(255,248,248,.82)); box-shadow: 0 8px 24px rgba(26,31,38,.055), inset 0 1px 0 rgba(255,255,255,.9); color: var(--ink); text-decoration: none; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .policies-index-page .policy-card:hover { transform: translateY(-3px); border-color: rgba(229,28,35,.35); box-shadow: 0 15px 30px rgba(26,31,38,.1), inset 0 1px 0 rgba(255,255,255,.95); }
        .policies-index-page .policy-card:focus-visible { outline: 3px solid rgba(229,28,35,.32); outline-offset: 3px; }
        .policies-index-page .policy-card-top { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
        .policies-index-page .policy-number { color: var(--red); font-size: 10px; font-weight: 800; letter-spacing: .12em; }
        .policies-index-page .policy-card-action { padding: 6px 9px; border: 1px solid rgba(229,28,35,.18); border-radius: 999px; background: rgba(229,28,35,.06); color: var(--red); font-size: 9px; font-weight: 700; }
        .policies-index-page .policy-card-title { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 700; line-height: 1.45; }
        .policies-index-page .policy-card-bangla { margin-top: 3px; color: var(--muted); font-size: 11px; line-height: 1.5; }
        .policies-index-page .policy-card-description { margin-top: auto; padding-top: 15px; color: var(--muted); font-size: 11px; line-height: 1.65; }
        @media (max-width: 900px) { .policies-index-page .policies-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) {
          .policies-index-page { padding-top: 42px; }
          .policies-index-page .policies-grid { grid-template-columns: 1fr; gap: 10px; }
          .policies-index-page .policy-card { min-height: 155px; padding: 17px; }
          .policies-index-page .policy-card-top { margin-bottom: 12px; }
        }
      `}</style>

      <header className="policies-intro">
        <p className="eyebrow">AL-WAHA · Information</p>
        <h1>Policies</h1>
        <p className="policies-lead">
          Browse our policies for products, orders, customer support and website use. Choose a policy
          below to read the full details.
        </p>
      </header>

      <nav className="policies-grid" aria-label="All AL-WAHA policies">
        {policies.map((policy, index) => (
          <Link className="policy-card" href={policy.href} key={policy.href}>
            <span className="policy-card-top">
              <span className="policy-number">POLICY {String(index + 1).padStart(2, '0')}</span>
              <span className="policy-card-action">View policy&nbsp; →</span>
            </span>
            <span className="policy-card-title">{policy.title}</span>
            <span className="policy-card-bangla" lang="bn">{policy.bangla}</span>
            <span className="policy-card-description">{policy.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
