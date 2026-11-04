'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { useLanguage } from './LanguageProvider';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/category' },
  { label: 'All Brands', href: '/all-brands' },
  { label: 'Vehicle Finder', href: '/vehicles' },
  { label: 'Track Booking', href: '/booking/track' },
  { label: 'Contact', href: '/contact' },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 4h2l1.6 10.1a1.5 1.5 0 0 0 1.5 1.3h8.9a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6.1M9 20a1 1 0 1 1-2 0 1 1 0 0 0 2 0Zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19 10.2c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { locale, toggle: toggleLanguage } = useLanguage();

  function closePanels() {
    setMenuOpen(false);
  }

  return (
    <div className="site-chrome">
      <header className="store-header">
        <Link className="brand" href="/" aria-label="Al Waha Parts home">
          <Image
            src="/logo.png"
            alt="Al Waha Parts"
            width={112}
            height={54}
            className="logo"
            priority
          />
        </Link>
        <div className="header-actions">
          <Link
            href="/map"
            aria-label="Our location"
            className="icon-action location-action"
            title="Our location"
          >
            <LocationIcon />
            <span>Location</span>
          </Link>
          <Link
            href="/booking"
            aria-label={`Shopping cart, ${itemCount} items`}
            className="icon-action"
          >
            <CartIcon />
            <span>{itemCount}</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </header>

      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="nav-drawer-header">
          <strong>Menu</strong>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <MenuIcon open />
          </button>
        </div>
        <div className="main-nav-inner">
          {navItems.map((item, index) => (
            <Link
              className={index === 0 ? 'active' : ''}
              href={item.href}
              key={item.label}
              onClick={closePanels}
            >
              {item.label}
            </Link>
          ))}
          <button
            className="language-toggle"
            type="button"
            data-no-translate
            onClick={toggleLanguage}
            aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            {locale === 'ar' ? 'English' : 'العربية (السعودية)'}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <button
          className="menu-drawer-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
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
          <p>
            Quality automotive parts, fitment support and a parts desk you can rely on across the
            UAE.
          </p>
        </div>
        <div className="footer-column">
          <h3>Information</h3>
          <Link href="/contact">About us</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/booking">Delivery information</Link>
        </div>
        <div className="footer-column">
          <h3>Customer service</h3>
          <Link href="/vehicles">Vehicle finder</Link>
          <Link href="/booking">Booking desk</Link>
          <Link href="/booking/track">Track booking</Link>
        </div>
        <div className="footer-column">
          <h3>Contact us</h3>
          <p>
            Al Waha Car Scrap
            <br />
            Al Jubail 35428, Saudi Arabia
          </p>
          <a href="mailto:hello@alwahaparts.com">hello@alwahaparts.com</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Al Waha Parts. All rights reserved.</span>
        <span>Right part. Right fit.</span>
      </div>
    </footer>
  );
}
