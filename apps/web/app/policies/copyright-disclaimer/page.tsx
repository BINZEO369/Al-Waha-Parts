import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright Disclaimer',
  description:
    'Copyright ownership, use restrictions and complaints for materials displayed on the AL-WAHA website.',
};

const sections = [
  {
    title: 'General Statement',
    content:
      'The content published on this website, including text, photographs, graphics, designs, product presentations, website structure and other creative materials, may be protected by applicable copyright and intellectual property laws.',
  },
  {
    title: 'AL-WAHA Photographs',
    content:
      'All photographs taken by AL-WAHA are owned by AL-WAHA, unless otherwise stated, subject to applicable ownership rights and agreements.',
  },
  {
    title: 'Third-Party Materials',
    content:
      'Third-party photographs, logos, text, trademarks and other materials remain the property of their respective rights holders.',
  },
  {
    title: 'Restrictions on Use',
    content:
      'Except where permitted by applicable law or an authorised licence, AL-WAHA’s copyrighted photographs, text, designs and other materials may not be copied, reproduced, republished, distributed or commercially used without permission.',
  },
  {
    title: 'Permitted Use',
    content:
      'Where permission is granted for the use of any material, such permission shall be subject to the specified purpose, scope and conditions.',
  },
  {
    title: 'Copyright Complaints',
    content:
      'Any rights holder who believes that copyrighted material has been used unlawfully on this website may contact AL-WAHA with relevant information and supporting evidence.',
    contact: true,
  },
  {
    title: 'Complaint Review',
    content:
      'AL-WAHA will review copyright complaints and, where appropriate, take necessary action, including modifying, restricting or removing the relevant material.',
  },
  {
    title: 'Rights Reservation',
    content:
      'Nothing in this disclaimer shall be interpreted as granting permission to use copyrighted materials without the necessary authorisation.',
  },
];

export default function CopyrightDisclaimerPage() {
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
        <h1>Copyright Disclaimer</h1>
        <p className="policy-lead">
          Information about copyright ownership, permitted use and complaints concerning materials
          on this website.
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
              <p className="policy-contact">
                Email:{' '}
                <a href="mailto:hello.alwaha@proton.me">hello.alwaha@proton.me</a>
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
