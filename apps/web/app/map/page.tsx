import Link from 'next/link';
import styles from './MapPage.module.css';

const locationUrl = 'https://maps.app.goo.gl/mBqvYy2GFiazoLx8AA';
const mapEmbedUrl = 'https://www.google.com/maps?q=Al%20Waha%20Parts%20UAE&output=embed';

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 10.2c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function MapPage() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <span className="section-kicker">Al Waha Parts / UAE</span>
          <h1>Find our location.</h1>
          <p>Use the map preview below, then open the exact live Google Maps location for turn-by-turn directions.</p>
          <div className={styles.actions}>
            <a className="button" href={locationUrl} target="_blank" rel="noreferrer">Open live location <span>↗</span></a>
            <Link className="text-link" href="/contact">Contact the parts desk <span>→</span></Link>
          </div>
        </div>
        <div className={styles.badge}><MapPinIcon /><strong>Our location</strong><span>Dubai, United Arab Emirates</span></div>
      </section>
      <section className={styles.mapCard} aria-label="Al Waha Parts map">
        <iframe title="Al Waha Parts location map" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </section>
      <section className={styles.note}>
        <MapPinIcon />
        <div><strong>Need the exact pin?</strong><p>Tap “Open live location” to open the location link you provided directly in Google Maps.</p></div>
      </section>
    </main>
  );
}
