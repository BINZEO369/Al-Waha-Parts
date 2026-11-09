import { BookingForm } from '../../components/BookingForm';

export default function BookingPage() {
  return (
    <main className="booking-page">
      <style>{`
        /* =========================================================
         * COLOR SYSTEM: WHITE / BLACK / RED (accent only)
         * =======================================================*/

        .booking-page {
          max-width: 1080px;
          margin: 0 auto;
          padding: 56px 24px 80px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
        }
        @media (max-width: 700px) {
          .booking-page { padding: 36px 16px 60px; }
        }

        /* ========== HEADER ========== */
        .booking-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e5e5;
        }
        .booking-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .booking-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #111;
        }
        .booking-eyebrow::before {
          content: '';
          display: block;
          width: 20px;
          height: 2px;
          background: #dc2626;
          border-radius: 2px;
        }
        .booking-secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #111;
          padding: 5px 10px;
          border: 1px solid #e5e5e5;
          border-radius: 20px;
          background: #fff;
        }
        .booking-secure-badge svg {
          width: 11px;
          height: 11px;
          color: #dc2626;
        }
        .booking-title {
          font-size: 34px;
          font-weight: 800;
          line-height: 1.1;
          color: #111;
          margin: 0 0 10px 0;
          letter-spacing: -1px;
        }
        @media (min-width: 900px) {
          .booking-title { font-size: 44px; }
        }
        @media (max-width: 480px) {
          .booking-title { font-size: 26px; letter-spacing: -0.6px; }
        }
        .booking-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: #111;
          margin: 0;
          max-width: 560px;
        }

        /* ========== INFO STRIP ========== */
        .info-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        @media (max-width: 700px) {
          .info-strip { grid-template-columns: 1fr; }
        }
        .info-cell {
          background: #fff;
          padding: 14px 18px;
          border-right: 1px solid #e5e5e5;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .info-cell:last-child {
          border-right: none;
        }
        @media (max-width: 700px) {
          .info-cell {
            border-right: none;
            border-bottom: 1px solid #e5e5e5;
          }
          .info-cell:last-child { border-bottom: none; }
        }
        .info-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #888;
        }
        .info-value {
          font-size: 13px;
          font-weight: 700;
          color: #111;
        }

        /* ========== FORM WRAPPER ========== */
        .form-wrapper {
          border-top: 3px solid #dc2626;
          border-radius: 0 0 14px 14px;
          padding-top: 8px;
        }

        .booking-page .booking-form { max-width: none; }
        .booking-page input:focus-visible,
        .booking-page select:focus-visible,
        .booking-page textarea:focus-visible {
          outline: 2px solid #dc2626;
          outline-offset: 2px;
        }
      `}</style>

      {/* ========== HEADER ========== */}
      <header className="booking-header">
        <div className="booking-header-top">
          <span className="booking-eyebrow">Checkout</span>
          <span className="booking-secure-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure
          </span>
        </div>
        <h1 className="booking-title">Complete your booking.</h1>
        <p className="booking-subtitle">
          Review your product and fill in your details. We&apos;ll call to confirm.
        </p>
      </header>

      {/* ========== INFO STRIP ========== */}
      <div className="info-strip" aria-label="Checkout info">
        <div className="info-cell">
          <span className="info-label">Product</span>
          <span className="info-value">Auto-attached from your cart</span>
        </div>
        <div className="info-cell">
          <span className="info-label">Total</span>
          <span className="info-value">Calculated automatically</span>
        </div>
        <div className="info-cell">
          <span className="info-label">Confirmation</span>
          <span className="info-value">By phone call</span>
        </div>
      </div>

      {/* ========== FORM ========== */}
      <div className="form-wrapper">
        <BookingForm />
      </div>
    </main>
  );
}
