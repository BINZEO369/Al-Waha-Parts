import { BookingForm } from '../../components/BookingForm';

export default function BookingPage() {
  return (
    <main className="page-shell booking-page">
      <style>{`
        .booking-page { max-width: 1180px; padding-top: 64px; }
        .booking-page .page-intro { max-width: 760px; margin-bottom: 30px; }
        .booking-page .page-intro h1 { max-width: 680px; margin-bottom: 16px; }
        .booking-page .page-intro > p:last-child { max-width: 560px; font-size: 14px; line-height: 1.75; }
        .booking-page :global(.booking-form) { max-width: none; border-top: 3px solid var(--red); }
        .booking-page :global(input:focus-visible),
        .booking-page :global(select:focus-visible),
        .booking-page :global(textarea:focus-visible) { outline: 2px solid var(--red); outline-offset: 2px; }
        .booking-page :global(.booking-steps) { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin: 0 0 30px; border: 1px solid var(--line); background: var(--line); }
        .booking-page :global(.booking-step) { min-height: 82px; padding: 16px 18px; background: #fff; }
        .booking-page :global(.booking-step strong) { display: block; margin-bottom: 5px; color: var(--ink); font-family: Montserrat, sans-serif; font-size: 12px; }
        .booking-page :global(.booking-step span) { color: var(--muted); font-size: 11px; line-height: 1.5; }
        @media (max-width: 700px) {
          .booking-page { padding-top: 42px; }
          .booking-page :global(.booking-steps) { grid-template-columns: 1fr; }
        }
      `}</style>
      <section className="page-intro">
        <p className="eyebrow">Live database request desk</p>
        <h1>Tell us what you need.</h1>
        <p>Select a product once. Its live database details and total are attached automatically, then our parts desk will call you to confirm delivery and handover.</p>
      </section>
      <div className="booking-steps" aria-label="Booking process">
        <div className="booking-step"><strong>01 · Select</strong><span>Press Booking now on the product you want.</span></div>
        <div className="booking-step"><strong>02 · Review</strong><span>Product details, live stock and total are attached automatically.</span></div>
        <div className="booking-step"><strong>03 · Call</strong><span>Our parts desk calls to confirm delivery and handover.</span></div>
      </div>
      <BookingForm />
    </main>
  );
}
