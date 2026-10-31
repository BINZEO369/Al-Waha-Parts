import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        AL WAHA <span>PARTS</span>
      </Link>
      <nav>
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Find by vehicle</Link>
        <Link href="/booking">Request a part</Link>
      </nav>
      <div className="header-actions">
        <Link className="button button-small" href="/booking">
          Book a part
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <div className="wordmark">
          AL WAHA <span>PARTS</span>
        </div>
        <p>Right part. Right fit. Ready to move.</p>
      </div>
      <div className="footer-links">
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Vehicle finder</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <small>© 2026 Al Waha Parts</small>
    </footer>
  );
}
