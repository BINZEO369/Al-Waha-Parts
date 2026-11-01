'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/category', dropdown: true },
  { label: 'Blog', href: '/catalog', dropdown: true },
  { label: 'Pages', href: '/vehicles', dropdown: true },
  { label: 'About Us', href: '/contact' },
  { label: 'Contact Us', href: '/contact' },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 8.7c0 5.5-8.8 10.4-8.8 10.4S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 4h2l1.6 10.1a1.5 1.5 0 0 0 1.5 1.3h8.9a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6.1M9 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog';
  }

  return (
    <div className="site-chrome">
      <div className="utility-bar">
        <div className="utility-inner">
          <span>Welcome to our store!</span>
          <div className="utility-links">
            <button>Setting⌄</button>
            <span>|</span>
            <button>USD⌄</button>
            <span>|</span>
            <button>English⌄</button>
            <span>|</span>
            <button>Compare (0)</button>
          </div>
        </div>
      </div>

      <header className="store-header">
        <Link className="brand" href="/" aria-label="Al Waha Parts home">
          <Image src="/logo.png" alt="Al Waha Parts" width={112} height={54} className="logo" priority />
        </Link>
        <form className="header-search" onSubmit={submitSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search entire store here ..." aria-label="Search entire store" />
          <button aria-label="Search" type="submit"><SearchIcon /></button>
        </form>
        <div className="header-actions">
          <Link href="/account" aria-label="Wishlist" className="icon-action"><HeartIcon /><span>0</span></Link>
          <Link href="/booking" aria-label="Shopping cart" className="icon-action"><CartIcon /><span>0</span></Link>
          <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}><MenuIcon open={menuOpen} /></button>
        </div>
      </header>

      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="main-nav-inner">
          {navItems.map((item, index) => (
            <Link className={index === 0 ? 'active' : ''} href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>
              {item.label}{item.dropdown && <span className="nav-caret">⌄</span>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand" href="/" aria-label="Al Waha Parts home">
            <Image src="/logo.png" alt="Al Waha Parts" width={112} height={54} className="logo" />
          </Link>
          <p>Quality automotive parts, fitment support and a parts desk you can rely on across the UAE.</p>
          <div className="footer-socials"><span>f</span><span>in</span><span>◎</span><span>▶</span></div>
        </div>
        <div className="footer-column"><h3>Information</h3><Link href="/contact">About us</Link><Link href="/contact">Contact us</Link><Link href="/booking">Delivery information</Link><Link href="/booking">Privacy policy</Link></div>
        <div className="footer-column"><h3>Customer service</h3><Link href="/account">My account</Link><Link href="/catalog">Order history</Link><Link href="/vehicles">Vehicle finder</Link><Link href="/booking">Request a part</Link></div>
        <div className="footer-column"><h3>Contact us</h3><p>Dubai, United Arab Emirates</p><a href="tel:+971500000000">+971 50 000 0000</a><a href="mailto:hello@alwahaparts.com">hello@alwahaparts.com</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Al Waha Parts. All rights reserved.</span><span>Right part. Right fit.</span></div>
    </footer>
  );
}
