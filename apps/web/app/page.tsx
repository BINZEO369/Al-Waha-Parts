'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

const categories = [
  { name: 'Suspension', count: '20 items', image: '/product-shocks.png' },
  { name: 'Brake system', count: '20 items', image: '/product-brake.png' },
  { name: 'Steering parts', count: '20 items', image: '/product-shocks.png' },
  { name: 'Shocks & struts', count: '20 items', image: '/product-shocks.png' },
  { name: 'Wheels & tyres', count: '20 items', image: '/product-wheel.png' },
  { name: 'Brake discs', count: '20 items', image: '/product-brake.png' },
  { name: 'Lighting', count: '20 items', image: '/product-headlight.png' },
  { name: 'Engine parts', count: '20 items', image: '/product-headlight.png' },
];

const arrivals = [
  {
    name: 'Performance Coilover Kit',
    category: 'Suspension',
    price: 'AED 425.00',
    oldPrice: 'AED 520.00',
    image: '/product-shocks.png',
  },
  {
    name: 'Premium LED Headlight',
    category: 'Lighting',
    price: 'AED 280.00',
    oldPrice: 'AED 340.00',
    image: '/product-headlight.png',
  },
  {
    name: 'Sport Brake Disc Set',
    category: 'Brake system',
    price: 'AED 390.00',
    oldPrice: 'AED 470.00',
    image: '/product-brake.png',
  },
  {
    name: 'Alloy Wheel 18 inch',
    category: 'Wheels & tyres',
    price: 'AED 615.00',
    oldPrice: 'AED 730.00',
    image: '/product-wheel.png',
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

export default function Home() {
  const [search, setSearch] = useState('');

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    window.location.href = value ? `/catalog?search=${encodeURIComponent(value)}` : '/catalog';
  }

  return (
    <main className="home-page">
      <section className="hero-storefront">
        <div className="hero-storefront-inner">
          <div className="hero-storefront-copy">
            <span className="hero-kicker">World best quality</span>
            <h1>New Car Parts</h1>
            <span className="hero-rule" />
            <p>Find the right part for every drive, every repair and every road ahead.</p>
            <Link className="red-button" href="/catalog">
              Shopping now <ArrowIcon />
            </Link>
          </div>
          <div className="hero-storefront-art">
            <Image src="/hero-parts.png" alt="Brake and suspension parts" width={980} height={560} priority />
          </div>
          <div className="hero-dots" aria-label="Hero slides">
            <span className="is-active" />
            <span />
          </div>
        </div>
      </section>

      <section className="store-section categories-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Shop by fitment</span>
            <h2>Popular Categories</h2>
          </div>
          <Link className="section-link" href="/catalog">
            View all categories <ArrowIcon />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href="/catalog" key={category.name}>
              <Image src={category.image} alt="" width={92} height={92} />
              <span>
                <strong>{category.name}</strong>
                <small>{category.count}</small>
              </span>
              <ArrowIcon />
            </Link>
          ))}
        </div>
      </section>

      <section className="store-section promo-section" aria-label="Offers">
        <Link className="promo-card promo-card-dark" href="/catalog">
          <div>
            <small>Car Wheel</small>
            <strong>30% <em>Off</em></strong>
            <span>Shop now <ArrowIcon /></span>
          </div>
          <Image src="/product-wheel.png" alt="Car wheel" width={220} height={180} />
        </Link>
        <Link className="promo-card promo-card-red" href="/booking">
          <div>
            <small>Car Parts</small>
            <strong>40% <em>Off</em></strong>
            <span>Shop now <ArrowIcon /></span>
          </div>
          <Image src="/product-brake.png" alt="Brake parts" width={220} height={180} />
        </Link>
        <Link className="promo-card promo-card-slate" href="/catalog">
          <div>
            <small>Car Vails</small>
            <strong>50% <em>Off</em></strong>
            <span>Shop now <ArrowIcon /></span>
          </div>
          <Image src="/product-shocks.png" alt="Suspension parts" width={220} height={180} />
        </Link>
      </section>

      <section className="store-section arrivals-section">
        <div className="section-heading arrivals-heading">
          <div>
            <span className="section-kicker">Fresh from the parts desk</span>
            <h2>New Arrivals</h2>
          </div>
          <div className="arrival-tabs" aria-label="Product categories">
            <button className="is-active">Car &amp; Drive</button>
            <button>Motorcycle</button>
            <button>Truck &amp; Drive</button>
          </div>
        </div>
        <div className="arrival-grid">
          {arrivals.map((item) => (
            <article className="arrival-card" key={item.name}>
              <Link href="/catalog" className="arrival-image">
                <span className="sale-badge">Sale</span>
                <Image src={item.image} alt={item.name} width={240} height={220} />
                <span className="quick-view">Quick view</span>
              </Link>
              <div className="arrival-details">
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <div className="rating" aria-label="5 out of 5 stars">★★★★★ <span>(12)</span></div>
                <div className="price-row">
                  <strong>{item.price}</strong>
                  <del>{item.oldPrice}</del>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wide-feature">
        <div className="wide-feature-copy">
          <span className="section-kicker">2026 latest collection</span>
          <h2>Built for the way you move.</h2>
          <p>Verified parts, clear pricing and a helpful desk behind every order.</p>
          <Link className="red-button" href="/booking">
            Request a part <ArrowIcon />
          </Link>
        </div>
        <div className="wide-feature-art">
          <Image src="/product-wheel.png" alt="Latest wheel collection" width={540} height={420} />
        </div>
      </section>

      <section className="store-section service-strip">
        <div><strong>Free shipping</strong><span>On orders over AED 250</span></div>
        <div><strong>Secure payment</strong><span>Safe checkout every time</span></div>
        <div><strong>Fitment support</strong><span>Real help from our parts desk</span></div>
        <div><strong>Easy request</strong><span>Tell us what your car needs</span></div>
      </section>

      <section className="store-section newsletter-card">
        <div>
          <span className="section-kicker">Stay in the fast lane</span>
          <h2>Search smarter. Drive further.</h2>
        </div>
        <form className="newsletter-search" onSubmit={submitSearch}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search entire store here ..." aria-label="Search entire store" />
          <button aria-label="Search"><ArrowIcon /></button>
        </form>
      </section>
    </main>
  );
}
