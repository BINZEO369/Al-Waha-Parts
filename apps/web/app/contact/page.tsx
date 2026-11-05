export default function ContactPage() {
  return (
    <main className="page-shell contact-page">
      <style>{`
        .contact-page :global(.contact-grid > div) { border-top: 3px solid var(--red); transition: transform .2s ease, box-shadow .2s ease; }
        .contact-page :global(.contact-grid > div:hover) { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0, 0, 0, .06); }
      `}</style>
      <section className="page-intro">
        <p className="eyebrow">Contact / Al Waha Parts</p>
        <h1>Bring us the tricky one.</h1>
        <p>
          Call the parts desk or send a booking request. We work with drivers, workshops and fleet
          teams in Al Jubail and across Saudi Arabia.
        </p>
      </section>
      <div className="contact-grid">
        <div>
          <span className="eyebrow">Parts desk</span>
          <h2>+971 4 000 0000</h2>
          <p>Mon–Sat · 08:00–18:00</p>
        </div>
        <div>
          <span className="eyebrow">Email</span>
          <h2>desk@alwahaparts.com</h2>
          <p>We usually reply within one business day.</p>
        </div>
      </div>
    </main>
  );
}
