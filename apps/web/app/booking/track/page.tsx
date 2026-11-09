import { BookingTracker } from '../../../components/BookingTracker';

export default function BookingTrackPage() {
  return (
    <main className="track-page">
      <style>{`
        /* =========================================================
         * COLOR SYSTEM: WHITE / BLACK / RED (accent only)
         * =======================================================*/

        .track-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 64px 24px 80px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
        }
        @media (max-width: 700px) {
          .track-page { padding: 42px 16px 60px; }
        }

        /* ========== HERO ========== */
        .track-hero {
          margin-bottom: 36px;
          max-width: 720px;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #111;
          margin-bottom: 18px;
        }
        .hero-eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          background: #dc2626;
          border-radius: 2px;
        }
        .hero-title {
          font-size: 44px;
          font-weight: 800;
          line-height: 1.05;
          color: #111;
          margin: 0 0 16px 0;
          letter-spacing: -1.2px;
        }
        @media (min-width: 900px) {
          .hero-title { font-size: 56px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 32px; letter-spacing: -0.8px; }
        }
        .hero-desc {
          font-size: 15px;
          line-height: 1.7;
          color: #111;
          margin: 0;
          max-width: 560px;
        }

        /* ========== TRUST BAR ========== */
        .trust-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e5e5e5;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 36px;
        }
        @media (max-width: 700px) {
          .trust-bar { grid-template-columns: 1fr; }
        }
        .trust-item {
          background: #fff;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .trust-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #fee2e2;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .trust-icon svg {
          width: 18px;
          height: 18px;
        }
        .trust-title {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
        }

        /* ========== TRACKER WRAPPER ========== */
        .tracker-wrapper {
          border-top: 3px solid #dc2626;
          border-radius: 0 0 16px 16px;
          padding-top: 8px;
        }

        .track-page :global(.booking-tracker) { max-width: none; }
        .track-page :global(input:focus-visible) {
          outline: 2px solid #dc2626;
          outline-offset: 2px;
        }
      `}</style>

      {/* ========== HERO ========== */}
      <section className="track-hero">
        <span className="hero-eyebrow">Booking Desk</span>
        <h1 className="hero-title">Track your booking.</h1>
        <p className="hero-desc">
          Enter your booking ID and phone number to view your order status.
        </p>
      </section>

      {/* ========== TRUST BAR ========== */}
      <div className="trust-bar" aria-label="Trust indicators">
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="trust-title">Live Tracking</span>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="trust-title">Secure Access</span>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className="trust-title">Real-Time Status</span>
        </div>
      </div>

      {/* ========== TRACKER ========== */}
      <div className="tracker-wrapper">
        <BookingTracker />
      </div>
    </main>
  );
}
