import { BookingsTable } from '../../components/BookingsTable';
export default function Bookings() {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">Customer requests</span>
          <h1>Booking queue.</h1>
        </div>
        <button className="admin-button">Export list ↓</button>
      </header>
      <div className="admin-toolbar">
        <select>
          <option>All booking statuses</option>
        </select>
        <input placeholder="Search booking number or customer" />
      </div>
      <BookingsTable />
    </div>
  );
}
