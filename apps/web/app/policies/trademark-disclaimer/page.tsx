import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trademark Disclaimer',
  description:
    'Trademark ownership, identification, compatibility and independent-business disclaimer for AL-WAHA.',
};

const sections = [
  {
    title: 'General Statement',
    content:
      'AL-WAHA is an independent automotive parts business. All vehicle manufacturer names, trademarks, logos, brand identifiers and model names displayed on this website are the property of their respective owners.',
  },
  {
    title: 'Brand Identification',
    content:
      'Vehicle brands, model names, model years and related identifiers are used solely for vehicle identification, product identification and compatibility purposes.',
  },
  {
    title: 'Independent Business',
    content:
      'AL-WAHA is not an official website, authorised dealer, authorised distributor or official representative of any vehicle manufacturer unless such authorisation or relationship is expressly stated.',
  },
  {
    title: 'No Affiliation or Endorsement',
    content:
      'The display of any vehicle manufacturer’s name, trademark, logo or brand identifier on this website does not imply any affiliation, partnership, sponsorship, endorsement or authorisation by the respective manufacturer.',
  },
  {
    title: 'Trademark Ownership',
    content:
      'All third-party trademarks, logos, brand names and related identifiers remain the property of their respective owners.',
  },
  {
    title: 'Purpose of Trademark Use',
    content:
      'Third-party brand identifiers are used solely to assist customers in identifying vehicles, locating suitable automotive parts and determining product compatibility.',
  },
  {
    title: 'Trademark Enquiries and Complaints',
    content:
      'Trademark owners or their authorised representatives may contact AL-WAHA regarding any trademark displayed on this website.',
    contact: true,
  },
  {
    title: 'Applicable Rights',
    content:
      'Nothing in this disclaimer shall be interpreted as transferring ownership of any third-party trademark or limiting the rights of its lawful owner.',
  },
];

export default function TrademarkDisclaimerPage() {
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
        .policy-page .policy-contact { margin-top: 12px; padding: 12px 14px; border-radius: 8px; background: #fff6f6; color: var(--ink); font-size: 12px; }
        .policy-page .policy-contact a { color: var(--red); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) {
          .policy-page { padding-top: 42px; }
          .policy-page .policy-section { padding: 18px 16px; }
          .policy-page .policy-section h2 { font-size: 15px; }
          .policy-page .policy-section p { font-size: 12px; }
        }
      `}</style>

      <header className="policy-intro">
        <p className="eyebrow">AL-WAHA · Legal</p>
        <h1>Trademark Disclaimer</h1>
        <p className="policy-lead">
          Information about third-party trademarks, vehicle identification and compatibility on this
          website.
        </p>
      </header>

      <div className="policy-sections">
        {sections.map((section, index) => (
          <section className="policy-section" key={section.title}>
            <h2>
              {index + 1}. {section.title}
            </h2>
            <p>{section.content}</p>
            {section.contact && (
              <>
                <p className="policy-contact">
                  Email:{' '}
                  <a href="mailto:hello.alwaha@proton.me">hello.alwaha@proton.me</a>
                </p>
                <p style={{ marginTop: 10 }}>
                  AL-WAHA will review legitimate complaints and take appropriate action in
                  accordance with applicable laws and rights.
                </p>
              </>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
