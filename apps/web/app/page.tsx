'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Automotive parts / UAE</p>
          <h1>Keep every vehicle moving.</h1>
          <p className="hero-lede">
            A trusted parts desk for workshops, fleets and drivers. Search by
            vehicle, match the fit, and book with confidence.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/catalog">
              Explore parts <span>↗</span>
            </Link>
            <Link className="text-link" href="/vehicles">
              Find by vehicle <span>→</span>
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-core">
            <span>AWP</span>
            <small>
              PARTS DESK
              <br />
              DUBAI / UAE
            </small>
          </div>
          <div className="hero-stamp">
            EST. 2026
            <br />
            <b>
              FITMENT
              <br />
              FIRST
            </b>
          </div>
        </div>
      </section>

      <section className="signal-row">
        <div>
          <strong>2,400+</strong>
          <span>parts indexed</span>
        </div>
        <div>
          <strong>24h</strong>
          <span>response promise</span>
        </div>
        <div>
          <strong>98%</strong>
          <span>fitment confidence</span>
        </div>
        <div>
          <strong>UAE</strong>
          <span>parts desk coverage</span>
        </div>
      </section>

      <section className="section split-section">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>
            Less searching.
            <br />
            More certainty.
          </h2>
        </div>
        <div className="steps">
          <div>
            <span>01</span>
            <h3>Tell us the vehicle</h3>
            <p>Make, model, year and engine are enough to start the match.</p>
          </div>
          <div>
            <span>02</span>
            <h3>See the right options</h3>
            <p>Compare new, tested and refurbished parts with clear pricing.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Book the part</h3>
            <p>Our team confirms availability and fit before you commit.</p>
          </div>
        </div>
      </section>

      <section className="section dark-panel">
        <div>
          <p className="eyebrow">For workshops &amp; fleets</p>
          <h2>A dependable parts desk, on your side.</h2>
        </div>
        <Link className="button button-light" href="/booking">
          Talk to the desk <span>↗</span>
        </Link>
      </section>

      <style jsx>{`
        .home {
          --ink: #172329;
          --muted: #66747a;
          --line: #dfe5e3;
          --paper: #f6f8f5;
          --white: #ffffff;
          --gold: #d4a85c;
          --deep: #203037;

          background: var(--paper);
          color: var(--ink);
          font-family: Manrope, system-ui, -apple-system, 'Segoe UI',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
        }

        /* ---------- EYEBROW ---------- */
        .eyebrow {
          color: #9d7537;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font: 500 10px 'DM Mono', ui-monospace, monospace;
          margin: 0;
        }

        /* ---------- TYPE ---------- */
        h1 {
          font-size: clamp(46px, 6.5vw, 92px);
          line-height: 0.97;
          letter-spacing: -0.07em;
          margin: 18px 0 26px;
          max-width: 680px;
          color: var(--ink);
        }

        h2 {
          font-size: clamp(34px, 4vw, 58px);
          line-height: 1;
          letter-spacing: -0.06em;
          color: var(--ink);
        }

        h3 {
          font-size: 18px;
          letter-spacing: -0.03em;
        }

        p {
          color: var(--muted);
          line-height: 1.7;
        }

        /* ---------- HERO ---------- */
        .hero {
          min-height: 650px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 78px 10vw 90px;
          gap: 5vw;
          overflow: hidden;
        }

        .hero-lede {
          max-width: 460px;
          font-size: 17px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 38px;
        }

        /* ---------- BUTTONS ---------- */
        .button {
          background: var(--deep);
          color: #fff;
          border: 0;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          gap: 24px;
          padding: 15px 20px;
          font: 600 13px Manrope, system-ui, sans-serif;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .button:hover {
          transform: translateY(-2px);
          background: #304a53;
          box-shadow: 0 10px 22px rgba(23, 35, 41, 0.15);
        }

        .button span {
          font-size: 12px;
        }

        .button-light {
          background: #e4f0eb;
          color: var(--deep);
        }

        .button-light:hover {
          background: #d6e7de;
        }

        .text-link {
          font-weight: 600;
          font-size: 13px;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 5px;
          color: var(--ink);
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .text-link:hover {
          opacity: 0.7;
        }

        /* ---------- HERO ART ---------- */
        .hero-art {
          min-height: 440px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .hero-orbit {
          position: absolute;
          border: 1px solid rgba(212, 168, 92, 0.5);
          border-radius: 50%;
          transform: rotate(-24deg);
        }

        .orbit-one {
          width: 390px;
          height: 250px;
        }

        .orbit-two {
          width: 470px;
          height: 310px;
          transform: rotate(30deg);
          border-color: rgba(32, 48, 55, 0.18);
        }

        .hero-core {
          width: 225px;
          height: 225px;
          border-radius: 50%;
          background: linear-gradient(140deg, #304850, #16262d);
          color: #eef5ef;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 22px 50px rgba(23, 35, 41, 0.2);
        }

        .hero-core span {
          font-weight: 800;
          font-size: 43px;
          letter-spacing: 0.07em;
        }

        .hero-core small {
          color: #b6c5c0;
          font: 10px 'DM Mono', ui-monospace, monospace;
          line-height: 1.5;
          letter-spacing: 0.12em;
          text-align: center;
          margin-top: 12px;
        }

        .hero-stamp {
          position: absolute;
          right: 3%;
          bottom: 5%;
          border: 1px solid var(--gold);
          color: #9d7537;
          font: 10px 'DM Mono', ui-monospace, monospace;
          padding: 13px;
          line-height: 1.6;
          transform: rotate(8deg);
        }

        .hero-stamp b {
          color: var(--ink);
          letter-spacing: 0.12em;
        }

        /* ---------- SIGNAL ROW ---------- */
        .signal-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          margin: 0 5vw;
        }

        .signal-row > div {
          padding: 26px 3vw;
          border-right: 1px solid var(--line);
        }

        .signal-row > div:last-child {
          border: 0;
        }

        .signal-row strong,
        .signal-row span {
          display: block;
        }

        .signal-row strong {
          font-size: 29px;
          letter-spacing: -0.06em;
          color: var(--ink);
        }

        .signal-row span {
          margin-top: 5px;
          color: var(--muted);
          font: 10px 'DM Mono', ui-monospace, monospace;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ---------- SECTIONS ---------- */
        .section {
          padding: 120px 10vw;
        }

        .split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10vw;
        }

        .steps {
          display: grid;
          gap: 0;
        }

        .steps > div {
          border-top: 1px solid var(--line);
          padding: 27px 0;
          display: grid;
          grid-template-columns: 60px 1fr;
        }

        .steps > div > span {
          color: var(--gold);
          font: 12px 'DM Mono', ui-monospace, monospace;
        }

        .steps h3,
        .steps p {
          grid-column: 2;
        }

        .steps h3 {
          margin: 0 0 8px;
        }

        .steps p {
          margin: 0;
          font-size: 13px;
        }

        /* ---------- DARK PANEL ---------- */
        .dark-panel {
          margin: 0 5vw 100px;
          padding: 58px 6vw;
          background: var(--deep);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .dark-panel h2 {
          max-width: 550px;
          margin-bottom: 0;
          color: #fff;
        }

        .dark-panel .eyebrow {
          color: #d4a85c;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 800px) {
          .hero,
          .split-section {
            grid-template-columns: 1fr;
            padding: 70px 7vw;
          }

          .hero {
            min-height: auto;
          }

          .hero-art {
            min-height: 330px;
            order: -1;
          }

          .orbit-one {
            width: 290px;
            height: 190px;
          }

          .orbit-two {
            width: 340px;
            height: 220px;
          }

          .hero-core {
            width: 165px;
            height: 165px;
          }

          .hero-core span {
            font-size: 30px;
          }

          .signal-row {
            grid-template-columns: 1fr 1fr;
            margin: 0;
          }

          .signal-row > div:nth-child(2) {
            border-right: 0;
          }

          .signal-row > div:nth-child(-n + 2) {
            border-bottom: 1px solid var(--line);
          }

          .section {
            padding: 75px 7vw;
          }

          .dark-panel {
            margin: 0 0 70px;
            padding: 45px 7vw;
            display: block;
          }

          .dark-panel .button {
            margin-top: 30px;
          }
        }
      `}</style>
    </main>
  );
}
