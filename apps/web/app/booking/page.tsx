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
        <p>Send the part and vehicle details you have. We will verify the selected records, stock and delivery preference before the parts desk confirms the request.</p>
      </section>
      <div className="booking-steps" aria-label="Booking process">
        <div className="booking-step"><strong>01 · Select</strong><span>Review cart items or enter a SKU / OEM number.</span></div>
        <div className="booking-step"><strong>02 · Match</strong><span>Choose an active vehicle record when fitment matters.</span></div>
        <div className="booking-step"><strong>03 · Confirm</strong><span>We recheck live price and availability before saving.</span></div>
      </div>
      <BookingForm />
    </main>
  );
}
