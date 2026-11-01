import { BookingForm } from '../../components/BookingForm';
export default function BookingPage() {
  return (
    <main className="page-shell booking-page">
      <style>{`
        .booking-page :global(.booking-form) { border-top: 3px solid var(--red); }
        .booking-page :global(input:focus-visible),
        .booking-page :global(select:focus-visible),
        .booking-page :global(textarea:focus-visible) { outline: 2px solid var(--red); outline-offset: 2px; }
      `}</style>
      <section className="page-intro">
        <p className="eyebrow">Parts desk / booking</p>
        <h1>Tell us what needs moving.</h1>
        <p>Send the details you have. We’ll confirm fitment, availability and the next step.</p>
      </section>
      <BookingForm />
    </main>
  );
}
