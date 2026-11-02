'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useCart } from './CartProvider';
import { useLanguage } from './LanguageProvider';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Categories', href: '/category' },
  { label: 'Vehicle Finder', href: '/vehicles' },
  { label: 'Contact', href: '/contact' },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { itemCount } = useCart();
  const { locale, toggle: toggleLanguage } = useLanguage();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/category?search=${encodeURIComponent(value)}` : '/category';
  }

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <div className="site-chrome">
      <header className="store-header">
        <Link className="brand" href="/" aria-label="Al Waha Parts home">
          <Image src="/logo.png" alt="Al Waha Parts" width={112} height={54} className="logo" priority />
        </Link>
        <div className="header-actions">
          <button className="search-trigger" type="button" onClick={() => setSearchOpen(true)} aria-label="Open catalog search">
            <SearchIcon /><span>Search</span>
          </button>
          <Link href="/account" aria-label="Wishlist" className="icon-action"><HeartIcon /><span>0</span></Link>
          <Link href="/booking" aria-label={`Shopping cart, ${itemCount} items`} className="icon-action"><CartIcon /><span>{itemCount}</span></Link>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}><MenuIcon open={menuOpen} /></button>
        </div>
      </header>

      <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="nav-drawer-header"><strong>Menu</strong><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><MenuIcon open /></button></div>
        <div className="main-nav-inner">
          {navItems.map((item, index) => (
            <Link className={index === 0 ? 'active' : ''} href={item.href} key={item.label} onClick={closePanels}>{item.label}</Link>
          ))}
          <button className="nav-search-button" type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}><SearchIcon /> Search catalog</button>
          <button className="language-toggle" type="button" data-no-translate onClick={toggleLanguage} aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
            {locale === 'ar' ? 'English' : 'العربية (السعودية)'}
          </button>
        </div>
          </nav>
      {menuOpen && <button className="menu-drawer-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      {searchOpen && (
        <>
          <button className="search-drawer-backdrop" type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <aside className="search-drawer" aria-label="Catalog search" role="dialog" aria-modal="true">
            <div className="search-drawer-header"><strong>Find a part</strong><button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">×</button></div>
            <p>Search the live catalog by part name, brand, SKU or OEM number.</p>
            <form onSubmit={submitSearch} className="drawer-search-form">
              <label htmlFor="catalog-search">Catalog search</label>
              <div><input id="catalog-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search parts or vehicles" /><button type="submit" aria-label="Search"><SearchIcon /></button></div>
            </form>
            <Link className="drawer-vehicle-link" href="/vehicles" onClick={() => setSearchOpen(false)}>Search cars by make, model and year →</Link>
          </aside>
        </>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="store-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand" href="/" aria-label="Al Waha Parts home"><Image src="/logo.png" alt="Al Waha Parts" width={112} height={54} className="logo" /></Link>
          <p>Quality automotive parts, fitment support and a parts desk you can rely on across the UAE.</p>
        </div>
        <div className="footer-column"><h3>Information</h3><Link href="/contact">About us</Link><Link href="/contact">Contact us</Link><Link href="/booking">Delivery information</Link></div>
        <div className="footer-column"><h3>Customer service</h3><Link href="/account">My account</Link><Link href="/vehicles">Vehicle finder</Link><Link href="/booking">Booking desk</Link></div>
        <div className="footer-column"><h3>Contact us</h3><p>Dubai, United Arab Emirates</p><a href="tel:+971500000000">+971 50 000 0000</a><a href="mailto:hello@alwahaparts.com">hello@alwahaparts.com</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Al Waha Parts. All rights reserved.</span><span>Right part. Right fit.</span></div>
    </footer>
  );
}
