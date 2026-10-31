import Link from 'next/link';
export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Automotive parts / UAE</p>
          <h1>Keep every vehicle moving.</h1>
          <p className="hero-lede">
            A trusted parts desk for workshops, fleets and drivers. Search by vehicle, match the
            fit, and book with confidence.
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
          <p className="eyebrow">For workshops & fleets</p>
          <h2>A dependable parts desk, on your side.</h2>
        </div>
        <Link className="button button-light" href="/booking">
          Talk to the desk <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
