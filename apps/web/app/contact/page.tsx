'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="page-shell contact-page">
      <style>{`
        .contact-page .contact-grid > div { border-top: 3px solid var(--red); transition: transform .2s ease, box-shadow .2s ease; }
        .contact-page .contact-grid > div:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0, 0, 0, .06); }
      `}</style>
      <section className="page-intro">
        <p className="eyebrow">Contact / Al Waha Parts</p>
        <h1>Bring us the tricky one.</h1>
        <p>For direct fitment help, stock checks or product questions, use our dedicated message center.</p>
        <Link className="button" href="/messages">Open message center</Link>
      </section>
      <div className="contact-grid">
        <div><span className="eyebrow">Parts desk</span><h2>0533866922</h2><p>Mon–Sat · 08:00–18:00</p></div>
        <div><span className="eyebrow">Email</span><h2>hello.alwaha@proton.me</h2><p>We usually reply within one business day.</p></div>
      </div>
    </main>
  );
}
