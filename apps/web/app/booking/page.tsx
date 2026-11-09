import { BookingForm } from '../../components/BookingForm';

export default function BookingPage() {
  return (
    <main className="booking-page">
      <style>{`
        /* =========================================================
         * COLOR SYSTEM: WHITE / BLACK / RED ONLY
         * White: #fff, #fafafa, #f5f5f5, #ebebeb, #e5e5e5, #ccc
         * Black: #111, #333, #555, #666, #888, #999
         * Red:   #dc2626, #b91c1c, #fee2e2, #fca5a5
         * =======================================================*/

        /* ========== PAGE WRAPPER ========== */
        .booking-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 64px 24px 80px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111;
        }
        @media (max-width: 700px) {
          .booking-page { padding: 42px 16px 60px; }
        }

        /* ========== HERO ========== */
        .booking-hero {
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
          color: #dc2626;
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
          margin: 0 0 18px 0;
          letter-spacing: -1.2px;
        }
        @media (min-width: 900px) {
          .hero-title { font-size: 56px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 32px; letter-spacing: -0.8px; }
        }
        .hero-title .accent {
          color: #dc2626;
        }
        .hero-desc {
          font-size: 15px;
          line-height: 1.7;
          color: #555;
          margin: 0;
          max-width: 620px;
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
        .trust-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .trust-title {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
        }
        .trust-sub {
          font-size: 11px;
          color: #888;
          font-weight: 500;
        }

        /* ========== STEPS HEADER ========== */
        .steps-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .steps-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: #111;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .steps-count {
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          background: #111;
          color: #fff;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ========== STEPS GRID ========== */
        .booking-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 36px;
        }
        @media (max-width: 700px) {
          .booking-steps { grid-template-columns: 1fr; }
        }

        .booking-step {
          position: relative;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .booking-step:hover {
          border-color: #111;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        .booking-step.active {
          border-color: #dc2626;
        }
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .booking-step.active .step-number {
          background: #dc2626;
        }
        .step-title {
          font-size: 14px;
          font-weight: 800;
          color: #111;
          margin: 0;
          letter-spacing: -0.1px;
        }
        .step-desc {
          font-size: 12px;
          line-height: 1.55;
          color: #666;
          margin: 0;
        }

        /* ========== FORM WRAPPER ========== */
        .form-wrapper {
          border-top: 3px solid #dc2626;
          border-radius: 0 0 16px 16px;
          padding-top: 8px;
        }

        /* --- form internals (was :global, now plain selectors) --- */
        .booking-page .booking-form {
          max-width: none;
        }
        .booking-page input:focus-visible,
        .booking-page select:focus-visible,
        .booking-page textarea:focus-visible {
          outline: 2px solid #dc2626;
          outline-offset: 2px;
        }
      `}</style>

      {/* ========== HERO ========== */}
      <section className="booking-hero">
        <span className="hero-eyebrow">Live Database Request Desk</span>
        <h1 className="hero-title">
          Tell us what you need.<br />
          <span className="accent">We&apos;ll handle the rest.</span>
        </h1>
        <p className="hero-desc">
          Select a product once — its live database details and total are attached
          automatically, then our parts desk calls you to confirm delivery and
          handover. No back-and-forth, no guesswork.
        </p>
      </section>

      {/* ========== TRUST BAR ========== */}
      <div className="trust-bar" aria-label="Trust indicators">
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="trust-text">
            <span className="trust-title">Verified Parts</span>
            <span className="trust-sub">Genuine &amp; tested</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="trust-text">
            <span className="trust-title">Warranty Backed</span>
            <span className="trust-sub">Months of coverage</span>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div className="trust-text">
            <span className="trust-title">Fast Call Back</span>
            <span className="trust-sub">Within minutes</span>
          </div>
        </div>
      </div>

      {/* ========== STEPS HEADER ========== */}
      <div className="steps-header">
        <h2>How it works</h2>
        <span className="steps-count">3 Steps</span>
      </div>

      {/* ========== STEPS GRID ========== */}
      <div className="booking-steps" aria-label="Booking process">
        <div className="booking-step active">
          <span className="step-number">01</span>
          <h3 className="step-title">Select</h3>
          <p className="step-desc">Press Booking Now on the product you want.</p>
        </div>
        <div className="booking-step">
          <span className="step-number">02</span>
          <h3 className="step-title">Review</h3>
          <p className="step-desc">
            Product details, live stock and total are attached automatically.
          </p>
        </div>
        <div className="booking-step">
          <span className="step-number">03</span>
          <h3 className="step-title">Call</h3>
          <p className="step-desc">
            Our parts desk calls to confirm delivery and handover.
          </p>
        </div>
      </div>

      {/* ========== FORM ========== */}
      <div className="form-wrapper">
        <BookingForm />
      </div>
    </main>
  );
}
