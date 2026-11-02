import Link from 'next/link';
import styles from './MapPage.module.css';

const locationUrl = 'https://www.google.com/maps/place/WM2V%2BJ9R+Al+waha+Car+Scrap,+Al+Jubail+35428,+Saudi+Arabia/@26.9016216,49.6933767,15z/data=!4m6!3m5!1s0x3e35980b13f58833:0xbe75d9e1b7fe66d!8m2!3d26.9016216!4d49.6933767!16s%2Fg%2F11gcpd4vcx?utm_campaign=ml-ardl&g_ep=Eg1tbF8yMDI2MTAyN18wIJvbDyoASAJQAQ%3D%3D';
const mapEmbedUrl = 'https://www.google.com/maps?q=26.9016216,49.6933767&z=18&output=embed';

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
          <p>Use the zoomed map below, then open the exact live Google Maps location for turn-by-turn directions.</p>
          <div className={styles.actions}>
            <a className="button" href={locationUrl} target="_blank" rel="noreferrer">Open live location <span>↗</span></a>
            <Link className="text-link" href="/contact">Contact the parts desk <span>→</span></Link>
          </div>
        </div>
        <div className={styles.badge}><MapPinIcon /><strong>Our location</strong><span>Al Waha Car Scrap, Al Jubail 35428, Saudi Arabia</span></div>
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
