import { BookingTracker } from '../../../components/BookingTracker';

export default function BookingTrackPage() {
  return (
    <main className="page-shell booking-track-page">
      <section className="page-intro">
        <p className="eyebrow">Customer service</p>
        <h1>Track your booking.</h1>
        <p>
          Enter the booking ID from your confirmation and the phone number used for the request. We
          use both details to protect your booking information.
        </p>
      </section>
      <BookingTracker />
    </main>
  );
}
