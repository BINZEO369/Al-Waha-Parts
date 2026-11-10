'use client';

import { CustomerMessageBox } from '../../components/CustomerMessageBox';

export default function MessagesPage() {
  return (
    <main className="page-shell messages-page">
      <section className="page-intro">
        <p className="eyebrow">Customer message center</p>
        <h1>Talk to the Al Waha parts desk.</h1>
        <p>
          Ask about fitment, stock, pricing, delivery or any part you need. Send your details once
          and continue the same private conversation when our team replies.
        </p>
      </section>
      <CustomerMessageBox />
    </main>
  );
}
