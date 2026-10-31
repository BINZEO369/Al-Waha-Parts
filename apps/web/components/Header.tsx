import Link from 'next/link';
import Image from 'next/image';
import styles from './site.module.css';

export function Header() {
  return (
    <header className={styles.siteHeader}>
      <Link className={styles.brand} href="/" aria-label="Al Waha Parts home">
        <Image
          src="/logo.png"
          alt="Al Waha Parts"
          width={72}
          height={72}
          className={styles.brandLogo}
          priority
        />
        <span className={styles.wordmark}>
          AL WAHA <span>PARTS</span>
        </span>
      </Link>

      <nav className={styles.nav}>
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Find by vehicle</Link>
        <Link href="/booking">Request a part</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerBrand}>
        <Link className={styles.brand} href="/" aria-label="Al Waha Parts home">
          <Image
            src="/logo.png"
            alt="Al Waha Parts"
            width={60}
            height={60}
            className={styles.brandLogo}
          />
          <span className={styles.wordmark}>
            AL WAHA <span>PARTS</span>
          </span>
        </Link>
        <p>Right part. Right fit. Ready to move.</p>
      </div>

      <div className={styles.footerLinks}>
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Vehicle finder</Link>
        <Link href="/booking">Request a part</Link>
        <Link href="/contact">Contact</Link>
      </div>

      <small>© 2026 Al Waha Parts</small>
    </footer>
  );
}
