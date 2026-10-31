import { BookingForm } from '../../components/BookingForm';
export default function BookingPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="eyebrow">Parts desk / booking</p>
        <h1>Tell us what needs moving.</h1>
        <p>Send the details you have. We’ll confirm fitment, availability and the next step.</p>
      </section>
      <BookingForm />
    </main>
  );
}
