import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <Image
            src="/logo.png"
            alt="Al Waha Parts"
            width={40}
            height={40}
            className="brand-logo"
            priority
          />
          <span className="wordmark">
            AL WAHA <span>PARTS</span>
          </span>
        </Link>

        <nav className="main-nav">
          <Link href="/catalog">Catalog</Link>
          <Link href="/vehicles">Find by vehicle</Link>
          <Link href="/booking">Request a part</Link>
        </nav>

        <div className="header-actions">
          <Link className="button button-small" href="/booking">
            Book a part
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <Image
              src="/logo.png"
              alt="Al Waha Parts"
              width={40}
              height={40}
              className="brand-logo"
            />
            <span className="wordmark">
              AL WAHA <span>PARTS</span>
            </span>
          </Link>
          <p>Right part. Right fit. Ready to move.</p>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link href="/catalog">Catalog</Link>
          <Link href="/vehicles">Vehicle finder</Link>
          <Link href="/booking">Request a part</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
          <Link href="/booking">Book a part</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© 2026 Al Waha Parts</small>
        <small>All rights reserved.</small>
      </div>
    </footer>
  );
}
