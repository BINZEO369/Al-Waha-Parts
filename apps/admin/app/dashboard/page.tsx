import { MetricCard } from '../../components/MetricCard';
import { BookingsTable } from '../../components/BookingsTable';
export default function Dashboard() {
  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">Monday · 31 October 2026</span>
          <h1>Good morning, parts desk.</h1>
        </div>
        <button className="admin-button">+ Add new part</button>
      </header>
      <div className="metrics">
        <MetricCard label="Parts indexed" value="2,408" note="↑ 8.4% this month" />
        <MetricCard label="Active vehicles" value="684" note="Across 42 manufacturers" />
        <MetricCard label="Open bookings" value="18" note="6 need attention" />
        <MetricCard label="Low stock" value="07" note="Review this week" />
      </div>
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <span className="admin-kicker">Live queue</span>
            <h2>Recent booking requests</h2>
          </div>
          <a href="/bookings">View all →</a>
        </div>
        <BookingsTable />
      </section>
      <section className="admin-lower">
        <div className="insight-card">
          <span className="admin-kicker">Parts desk pulse</span>
          <h2>Keep the fast movers visible.</h2>
          <p>Your brake and suspension categories are seeing the most interest this week.</p>
          <a className="admin-button" href="/parts">
            Review inventory →
          </a>
        </div>
        <div className="activity-card">
          <span className="admin-kicker">System status</span>
          <div className="system-line">
            <i className="online-dot" /> API endpoint <b>Healthy</b>
          </div>
          <div className="system-line">
            <i className="online-dot" /> Supabase database <b>Connected</b>
          </div>
          <div className="system-line">
            <i className="online-dot" /> Last sync <b>2 min ago</b>
          </div>
        </div>
      </section>
    </div>
  );
}
