import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/" aria-label="Al Waha Parts home">
        <Image
          src="/logo.png"
          alt="Al Waha Parts"
          width={68}
          height={68}
          className="logo"
          priority
        />
        <span className="wordmark">
          AL WAHA <span>PARTS</span>
        </span>
      </Link>

      <nav className="nav">
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Find by vehicle</Link>
        <Link href="/booking">Request a part</Link>
      </nav>

      <div className="actions">
        <Link className="contact" href="/contact">
          Contact
        </Link>
      </div>

      <style jsx>{`
        .header {
          --ink: #172329;
          --muted: #66747a;
          --line: #dfe5e3;
          --paper: #f6f8f5;
          --white: #ffffff;
          --gold: #d4a85c;
          --deep: #203037;

          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 40px;
          min-height: 92px;
          padding: 0 5vw;
          background: rgba(246, 248, 245, 0.88);
          border-bottom: 1px solid var(--line);
          backdrop-filter: saturate(160%) blur(14px);
          -webkit-backdrop-filter: saturate(160%) blur(14px);
          font-family: Manrope, system-ui, -apple-system, 'Segoe UI',
            sans-serif;
          color: var(--ink);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
          color: var(--ink);
          text-decoration: none;
        }

        .logo {
          width: 68px;
          height: 68px;
          object-fit: contain;
          border-radius: 12px;
          background: var(--white);
          padding: 3px;
          display: block;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .brand:hover .logo {
          transform: rotate(-4deg) scale(1.05);
        }

        .wordmark {
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.1em;
          white-space: nowrap;
          color: var(--ink);
        }

        .wordmark span {
          color: var(--gold);
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 30px;
          flex: 1;
          font-size: 14px;
        }

        .nav a {
          position: relative;
          padding: 6px 0;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .nav a::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 1.5px;
          background: var(--gold);
          transition: width 0.28s ease;
        }

        .nav a:hover {
          color: var(--ink);
        }

        .nav a:hover::after {
          width: 100%;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .contact {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--white);
          background: var(--deep);
          border-radius: 2px;
          text-decoration: none;
          transition: transform 0.2s ease, background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .contact:hover {
          transform: translateY(-2px);
          background: #2c444c;
          box-shadow: 0 10px 22px rgba(23, 35, 41, 0.15);
        }

        @media (max-width: 820px) {
          .header {
            padding: 16px 5vw;
            gap: 16px;
            flex-wrap: wrap;
            min-height: auto;
          }

          .logo {
            width: 56px;
            height: 56px;
            border-radius: 10px;
          }

          .wordmark {
            font-size: 14px;
          }

          .nav {
            order: 3;
            flex-basis: 100%;
            gap: 18px;
            overflow-x: auto;
            padding-top: 4px;
            font-size: 13px;
          }

          .actions {
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .logo {
            width: 48px;
            height: 48px;
          }

          .wordmark {
            font-size: 13px;
          }

          .contact {
            padding: 10px 18px;
            font-size: 12px;
          }
        }
      `}</style>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footerBrand">
        <Link className="brand" href="/" aria-label="Al Waha Parts home">
          <Image
            src="/logo.png"
            alt="Al Waha Parts"
            width={58}
            height={58}
            className="logo"
          />
          <span className="wordmark">
            AL WAHA <span>PARTS</span>
          </span>
        </Link>
        <p>Right part. Right fit. Ready to move.</p>
      </div>

      <div className="footerLinks">
        <Link href="/catalog">Catalog</Link>
        <Link href="/vehicles">Vehicle finder</Link>
        <Link href="/booking">Request a part</Link>
        <Link href="/contact">Contact</Link>
      </div>

      <small className="copyright">© 2026 Al Waha Parts</small>

      <style jsx>{`
        .footer {
          --ink: #172329;
          --muted: #66747a;
          --line: #dfe5e3;
          --white: #ffffff;
          --gold: #d4a85c;

          display: grid;
          grid-template-columns: 1.4fr 1fr auto;
          gap: 36px;
          align-items: end;
          padding: 60px 5vw 44px;
          background: var(--white);
          border-top: 1px solid var(--line);
          font-family: Manrope, system-ui, -apple-system, 'Segoe UI',
            sans-serif;
          color: var(--ink);
        }

        .footerBrand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          align-self: flex-start;
          color: var(--ink);
          text-decoration: none;
        }

        .logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 12px;
          background: var(--white);
          padding: 3px;
          display: block;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .brand:hover .logo {
          transform: rotate(-4deg) scale(1.05);
        }

        .wordmark {
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.1em;
          white-space: nowrap;
          color: var(--ink);
        }

        .wordmark span {
          color: var(--gold);
        }

        p {
          font-size: 13px;
          line-height: 1.6;
          color: var(--muted);
          margin: 16px 0 0;
          max-width: 320px;
        }

        .footerLinks {
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
          font-size: 13px;
          color: var(--muted);
        }

        .footerLinks a {
          color: var(--muted);
          text-decoration: none;
          padding: 4px 0;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .footerLinks a:hover {
          color: var(--ink);
          transform: translateY(-1px);
        }

        .copyright {
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--muted);
          font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        }

        @media (max-width: 820px) {
          .footer {
            grid-template-columns: 1fr;
            padding: 44px 5vw 32px;
            gap: 24px;
          }

          .logo {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </footer>
  );
}
