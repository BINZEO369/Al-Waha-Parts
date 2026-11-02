import { BookingsTable } from '../../components/BookingsTable';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Bookings() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Customer requests / section 05"
        title="Booking queue"
        description="Review incoming part requests, customer contacts, delivery details, and order totals in one place."
        action="Export requests"
      />
      <div className="toolbar-card resource-toolbar">
        <div className="field-search">
          <span>⌕</span>
          <input
            placeholder="Search booking number or customer…"
            aria-label="Search booking number or customer"
          />
        </div>
        <select aria-label="Filter booking status">
          <option>All booking statuses</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Processing</option>
          <option>Completed</option>
        </select>
        <button className="secondary-button" type="button">
          Export CSV ↘
        </button>
      </div>
      <section className="content-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">
              <b>05</b>Live queue
            </span>
            <h2>Customer requests</h2>
            <p>Newest booking requests are pulled directly from the API.</p>
          </div>
          <span className="section-meta">Supabase · newest first</span>
        </div>
        <BookingsTable />
      </section>
      <div className="workspace-grid">
        <WorkspaceCard
          number="05A"
          label="Response rhythm"
          title="Move the queue forward."
          description="Keep every request visible, actionable, and easy to hand off to the parts desk."
          action="Response guide"
        />
        <WorkspaceCard
          number="05B"
          label="Customer care"
          title="Details before decisions."
          description="Phone, city, delivery preference, and product snapshots stay together."
          action="Review workflow"
        />
      </div>
    </div>
  );
}
