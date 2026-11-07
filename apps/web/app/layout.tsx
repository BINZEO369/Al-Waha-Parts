import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Header, Footer } from '../components/Header';
import { CartProvider } from '../components/CartProvider';
import { LanguageProvider } from '../components/LanguageProvider';
import { CookieConsentManager } from '../components/CookieConsentManager';
const globalStyles = String.raw`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

:root {
  --red: #e5232f;
  --red-dark: #c81622;
  --ink: #282828;
  --muted: #777777;
  --soft: #f7f7f7;
  --line: #e9e9e9;
  --white: #ffffff;
  --dark: #d71920;
  --max: 1200px;
  --brand-font: 'Montserrat';
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-heavy: 800;
  --size-hero: clamp(56px, 5.5vw, 64px);
  --size-section: clamp(32px, 3.5vw, 40px);
  --size-card: clamp(18px, 2vw, 22px);
  --size-subtitle: clamp(18px, 2vw, 22px);
  --size-description: clamp(15px, 1.4vw, 16px);
  --size-navigation: clamp(14px, 1.4vw, 16px);
  --size-button: clamp(14px, 1.4vw, 16px);
  --size-product: clamp(16px, 1.6vw, 18px);
  --size-price: clamp(20px, 2.2vw, 24px);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--white);
  color: var(--ink);
  font-family: 'Montserrat';
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }
img { max-width: 100%; }
h1, h2, h3, p { margin-top: 0; }

/* ---------- TOP UTILITY / HEADER ---------- */
.site-chrome {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 100;
  background: var(--white);
  box-shadow: 0 2px 14px rgba(0, 0, 0, .06);
}
.store-header {
  width: 100%;
  max-width: none;
  min-height: 82px;
  padding: 0 max(18px, calc((100vw - var(--max)) / 2 + 18px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--white);
}
.brand { display: inline-flex; align-items: center; flex-shrink: 0; }
.logo { width: 112px; height: 54px; object-fit: contain; display: block; }
.header-actions { display: flex; align-items: center; gap: 22px; }
.search-trigger, .nav-search-button { display: inline-flex; align-items: center; gap: 7px; border: 0; background: transparent; color: inherit; font-size: 11px; }
.search-trigger { padding: 8px 0; color: var(--ink); }
.search-trigger svg, .nav-search-button svg { width: 18px; height: 18px; }
.icon-action { display: inline-flex; align-items: center; gap: 4px; color: var(--ink); position: relative; }
.icon-action svg { width: 22px; height: 22px; }
.icon-action span { min-width: 14px; height: 14px; padding: 0 3px; display: grid; place-items: center; border-radius: 50%; background: var(--red); color: #fff; font-size: 8px; }
.location-action { color: var(--red); }
.location-action span { min-width: auto; height: auto; padding: 0; border-radius: 0; background: transparent; color: var(--ink); font-size: 10px; }
.menu-toggle { display: none; padding: 0; border: 0; background: transparent; color: var(--ink); }
.menu-toggle svg { width: 25px; height: 25px; }
.main-nav { background: var(--dark); color: #fff; }
.main-nav-inner { max-width: var(--max); min-height: 43px; padding: 0 18px; margin: 0 auto; display: flex; align-items: stretch; }
.nav-drawer-header { display: none; }
.menu-drawer-backdrop { display: none; }
.main-nav a { display: inline-flex; align-items: center; gap: 7px; padding: 0 21px; color: #fff; font-size: 11px; font-weight: 600; transition: background .2s ease, color .2s ease; }
.main-nav a:hover, .main-nav a.active, .nav-search-button:hover { background: var(--red); }
.nav-caret { font-size: 11px; color: #ddd; }
.nav-search-button { margin-left: auto; padding: 0 18px; color: #fff; }
.search-drawer-backdrop { position: fixed; inset: 0; z-index: 190; border: 0; background: rgba(0,0,0,.35); }
.search-drawer { position: fixed; top: 0; right: 0; z-index: 200; width: min(420px, 92vw); height: 100dvh; padding: 28px; background: #fff; box-shadow: -14px 0 38px rgba(0,0,0,.16); }
.search-drawer-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 1px solid var(--line); font-family: 'Montserrat'; font-size: 20px; }
.search-drawer-header button { border: 0; background: transparent; color: var(--ink); font-size: 28px; line-height: 1; }
.search-drawer p { margin: 22px 0 26px; color: var(--muted); font-size: 12px; line-height: 1.7; }
.drawer-search-form { display: grid; gap: 8px; color: var(--muted); font-size: 10px; }
.drawer-search-form > div { display: flex; border: 1px solid var(--red); }
.drawer-search-form input { min-width: 0; flex: 1; height: 44px; padding: 0 12px; border: 0; outline: 0; font-size: 12px; }
.drawer-search-form button { width: 48px; border: 0; background: var(--red); color: #fff; }
.drawer-search-form svg { width: 17px; height: 17px; }
.drawer-vehicle-link { display: inline-block; margin-top: 24px; color: var(--red); font-size: 11px; font-weight: 700; }

/* ---------- COMMON ---------- */
.red-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 38px;
  padding: 0 20px;
  border: 0;
  color: #fff;
  background: var(--red);
  font-size: 11px;
  font-weight: 700;
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
}
.red-button:hover { background: var(--red-dark); transform: translateY(-2px); box-shadow: 0 8px 18px rgba(229,35,47,.2); }
.red-button svg, .section-link svg, .category-card > svg, .promo-card svg { width: 16px; height: 16px; }
.section-kicker { display: block; margin-bottom: 7px; color: var(--red); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .13em; }
.store-section { max-width: var(--max); padding: 0 18px; margin: 0 auto; }
.section-heading { margin-bottom: 27px; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.section-heading h2 { position: relative; margin: 0; padding-bottom: 10px; font-family: 'Montserrat'; font-size: 22px; font-weight: 700; line-height: 1.1; letter-spacing: -.04em; }
.section-heading h2::after { content: ''; position: absolute; bottom: 0; left: 0; width: 50px; height: 2px; background: var(--red); }
.section-link { display: inline-flex; align-items: center; gap: 7px; color: var(--red); font-size: 11px; font-weight: 600; }
.section-link:hover { text-decoration: underline; }

/* ---------- HOME HERO ---------- */
.home-page { overflow: hidden; background: #fff; }
.hero-storefront { background: #f8f8f8; }
.hero-storefront-inner { max-width: var(--max); min-height: 435px; padding: 0 18px; margin: 0 auto; display: grid; grid-template-columns: 41% 59%; align-items: center; position: relative; }
.hero-storefront-copy { position: relative; z-index: 1; padding: 30px 0 36px; }
.hero-kicker { display: block; margin-bottom: 11px; color: #4f4f4f; font-size: 12px; }
.hero-storefront h1 { margin: 0; color: #272727; font-family: 'Montserrat'; font-size: clamp(43px, 5.5vw, 68px); font-weight: 800; line-height: .98; letter-spacing: -.07em; }
.hero-rule { display: block; width: 86px; height: 2px; margin: 12px 0 14px; background: var(--red); }
.hero-storefront-copy p { max-width: 300px; margin-bottom: 25px; color: #777; font-size: 11px; line-height: 1.8; }
.hero-storefront-art { align-self: stretch; display: flex; align-items: center; justify-content: center; min-width: 0; }
.hero-storefront-art img { width: 100%; height: auto; max-height: 425px; object-fit: contain; }
.database-hero-art img { width: min(100%, 500px); height: 330px; object-fit: contain; mix-blend-mode: multiply; }
.database-image-empty { padding: 20px; border: 1px dashed #d8d8d8; color: #9a9a9a; font-size: 10px; text-align: center; }
.home-loading { padding-top: 32px; color: #888; font-size: 12px; text-align: center; }
.home-data-alert { margin-top: 28px; }
.home-empty-state { padding: 55px 20px; margin-bottom: 45px; border: 1px dashed var(--line); text-align: center; }
.home-empty-state h2 { margin-bottom: 8px; font-family: 'Montserrat'; font-size: 24px; }
.home-empty-state p { margin: 0; color: #888; font-size: 12px; }
.hero-dots { position: absolute; left: 50%; bottom: 17px; display: flex; gap: 8px; transform: translateX(-50%); }
.hero-dots span { width: 8px; height: 8px; border: 1px solid var(--red); border-radius: 50%; background: transparent; }
.hero-dots span.is-active { background: var(--red); }

/* ---------- CATEGORIES ---------- */
.categories-section { padding-top: 48px; padding-bottom: 43px; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.category-card { min-height: 73px; padding: 7px 12px; display: flex; align-items: center; gap: 10px; border: 1px solid #f0c4c7; background: #fff; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.category-card:hover { border-color: var(--red); transform: translateY(-3px); box-shadow: 0 8px 18px rgba(229,35,47,.12); }
.category-card img { width: 64px; height: 58px; object-fit: contain; flex-shrink: 0; }
.category-card span { display: grid; gap: 4px; flex: 1; }
.category-card strong { color: #171717; font-size: 11px; font-weight: 600; }
.category-card small { color: #909090; font-size: 9px; }
.category-card > svg { width: 13px; color: var(--red); }
.category-card > .category-no-image { width: 64px; height: 58px; display: grid; place-items: center; flex-shrink: 0; color: #aaa; background: #f7f7f7; font-size: 9px; }

/* ---------- PROMOTIONS ---------- */
.promo-section { padding-bottom: 54px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.promo-card { min-height: 120px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; color: #fff; }
.promo-card > div { position: relative; z-index: 1; display: grid; gap: 6px; }
.promo-card small { color: rgba(255,255,255,.73); font-size: 9px; }
.promo-card strong { font-family: 'Montserrat'; font-size: 22px; line-height: 1; }
.promo-card strong em { font-style: normal; font-size: 12px; font-weight: 500; }
.promo-card span { display: inline-flex; align-items: center; gap: 5px; margin-top: 7px; color: #fff; font-size: 9px; }
.promo-card img { width: 145px; height: 120px; object-fit: contain; margin-right: -16px; filter: drop-shadow(0 7px 8px rgba(0,0,0,.15)); }
.promo-card-dark { background: var(--red); }
.promo-card-red { background: var(--red); }
.promo-card-slate { background: var(--red); }
.promo-card-database { background: var(--red); }
.promo-card-database strong { max-width: 150px; font-size: 17px; line-height: 1.15; }
.promo-card-database img { mix-blend-mode: multiply; }

/* ---------- ARRIVALS ---------- */
.arrivals-section { padding-bottom: 66px; }
.arrivals-heading { align-items: center; }
.arrival-tabs { display: flex; align-items: center; gap: 20px; }
.arrival-tabs button { padding: 5px 0; border: 0; border-bottom: 1px solid transparent; background: transparent; color: #8a8a8a; font-size: 10px; }
.arrival-tabs button:hover, .arrival-tabs button.is-active { border-color: var(--red); color: var(--red); }
.arrival-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.arrival-card { min-width: 0; border: 1px solid #e7e7e7; background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.arrival-card:hover { transform: translateY(-4px); box-shadow: 0 10px 22px rgba(0,0,0,.07); }
.arrival-image { height: 218px; position: relative; display: grid; place-items: center; overflow: hidden; background: #fbfbfb; }
.arrival-image img { width: 88%; height: 88%; object-fit: contain; transition: transform .25s ease; }
.arrival-card:hover .arrival-image img { transform: scale(1.05); }
.sale-badge { position: absolute; top: 11px; left: 11px; z-index: 1; padding: 5px 8px; color: #fff; background: var(--red); font-size: 8px; text-transform: uppercase; }
.quick-view { position: absolute; right: 10px; bottom: -30px; padding: 6px 9px; background: var(--red); color: #fff; font-size: 9px; transition: bottom .2s ease; }
.arrival-card:hover .quick-view { bottom: 10px; }
.arrival-details { padding: 15px 15px 17px; }
.arrival-details > small { color: #999; font-size: 9px; }
.arrival-details h3 { min-height: 34px; margin: 8px 0 9px; color: #373737; font-size: 12px; font-weight: 600; line-height: 1.4; }
.rating { color: var(--red); font-size: 10px; letter-spacing: 1px; }
.rating span { color: #777; font-size: 9px; letter-spacing: 0; }
.price-row { display: flex; align-items: center; gap: 8px; margin-top: 13px; }
.price-row strong { color: var(--red); font-size: 12px; }
.price-row del { color: #aaa; font-size: 9px; }

/* ---------- WIDE FEATURE / SERVICE STRIP ---------- */
.wide-feature { max-width: var(--max); min-height: 290px; padding: 40px 7%; margin: 0 auto 56px; display: grid; grid-template-columns: 45% 55%; align-items: center; overflow: hidden; background: #f6f6f6; }
.wide-feature-copy { position: relative; z-index: 1; }
.wide-feature h2 { max-width: 360px; margin: 0 0 12px; font-family: 'Montserrat'; font-size: 34px; line-height: 1.08; letter-spacing: -.06em; }
.wide-feature p { max-width: 300px; margin-bottom: 21px; color: #777; font-size: 12px; line-height: 1.7; }
.wide-feature-art { display: flex; align-items: center; justify-content: center; height: 100%; }
.wide-feature-art img { width: 100%; max-width: 470px; height: 290px; object-fit: contain; transform: rotate(-6deg); }
.service-strip { padding-bottom: 44px; display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--line); }
.service-strip > div { min-height: 54px; padding: 5px 25px; display: grid; align-content: center; gap: 5px; border-right: 1px solid var(--line); }
.service-strip > div:first-child { padding-left: 0; }
.service-strip > div:last-child { border-right: 0; }
.service-strip strong { font-size: 11px; }
.service-strip span { color: #999; font-size: 10px; }
.newsletter-card { padding-top: 44px; padding-bottom: 54px; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.newsletter-card h2 { margin: 0; font-family: 'Montserrat'; font-size: 26px; letter-spacing: -.05em; }
.newsletter-search { width: min(100%, 390px); height: 42px; display: flex; border: 1px solid #ddd; }
.newsletter-search input { min-width: 0; flex: 1; border: 0; outline: 0; padding: 0 15px; color: var(--ink); font-size: 11px; }
.newsletter-search button { width: 48px; border: 0; background: var(--red); color: #fff; }
.newsletter-search svg { width: 17px; height: 17px; }
.vehicle-home-section { padding-top: 38px; padding-bottom: 58px; }
.vehicle-home-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.vehicle-home-card { min-width: 0; overflow: hidden; border: 1px solid #f0c4c7; background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.vehicle-home-card:hover { transform: translateY(-3px); box-shadow: 0 9px 22px rgba(229,35,47,.12); }
.vehicle-home-card > img { display: block; width: 100%; height: 230px; object-fit: cover; object-position: center; background: #f8f8f8; }
.vehicle-home-card > .database-image-empty { height: 230px; display: grid; place-items: center; background: #f8f8f8; }
.vehicle-home-card > div { display: grid; min-height: 92px; gap: 6px; padding: 16px 18px 18px; }
.vehicle-home-card small { color: var(--red); font-size: 9px; text-transform: uppercase; }
.vehicle-home-card strong { font-size: 13px; }
.vehicle-home-card span { color: #999; font-size: 10px; }
.back-link { display: inline-flex; margin-bottom: 18px; color: var(--red); font-size: 11px; font-weight: 700; }
.vehicle-detail-hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); min-height: 380px; border: 1px solid var(--line); background: #fff; box-shadow: 0 12px 35px rgba(0,0,0,.04); }
.vehicle-detail-media { min-height: 380px; background: #f7f7f7; }
.vehicle-detail-media img { width: 100%; height: 100%; min-height: 380px; display: block; object-fit: cover; }
.vehicle-detail-placeholder { height: 100%; min-height: 380px; display: grid; place-items: center; color: var(--red); font-family: 'Montserrat'; font-size: 45px; font-weight: 800; }
.vehicle-detail-copy { display: flex; flex-direction: column; justify-content: center; padding: 42px; }
.vehicle-detail-copy h1 { max-width: 480px; margin: 9px 0 8px; font-family: 'Montserrat'; font-size: clamp(30px, 4vw, 48px); line-height: 1.02; letter-spacing: -.06em; }
.vehicle-detail-subtitle { margin: 0 0 26px; color: #888; font-size: 13px; }
.vehicle-detail-specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; padding: 15px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.vehicle-detail-specs div, .vehicle-info-strip div { display: grid; gap: 5px; }
.vehicle-detail-specs small, .vehicle-info-strip small { color: #999; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; }
.vehicle-detail-specs strong { font-size: 12px; }
.vehicle-info-strip { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.2fr; gap: 18px; margin: 24px 0 58px; padding: 20px 22px; border: 1px solid var(--line); background: #fafafa; }
.vehicle-info-strip strong { font-size: 12px; }
.fitment-ok { color: #287d58; }
.vehicle-products-section { padding-bottom: 30px; }
.vehicle-products-count { color: #999; font-size: 11px; }
.category-detail-hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); min-height: 380px; border: 1px solid var(--line); background: #fff; box-shadow: 0 12px 35px rgba(0,0,0,.04); }
.category-detail-media { min-height: 380px; background: #f7f7f7; }
.category-detail-media img { width: 100%; height: 100%; min-height: 380px; display: block; object-fit: cover; }
.category-detail-placeholder { height: 100%; min-height: 380px; display: grid; place-items: center; color: var(--red); font-family: 'Montserrat'; font-size: 45px; font-weight: 800; }
.category-detail-copy { display: flex; flex-direction: column; justify-content: center; padding: 42px; }
.category-detail-copy h1 { max-width: 480px; margin: 9px 0 12px; font-family: 'Montserrat'; font-size: clamp(30px, 4vw, 48px); line-height: 1.02; letter-spacing: -.06em; }
.category-detail-copy p { max-width: 440px; margin: 0 0 26px; color: #777; font-size: 13px; line-height: 1.7; }
.category-detail-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; padding: 15px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.category-detail-stats div { display: grid; gap: 5px; }
.category-detail-stats small { color: #999; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; }
.category-detail-stats strong { font-size: 12px; }
.category-products-section { padding: 58px 0 30px; }
.home-brands-section { padding-top: 18px; padding-bottom: 58px; }
.home-brands-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; }
.home-brand-card { display: grid; gap: 9px; min-width: 0; padding: 12px 10px 11px; border: 1px solid #e5e5e5; background: #fff; text-align: center; }
.home-brand-card:hover { color: inherit; }
.home-brand-logo { width: 72px; height: 42px; display: grid; place-items: center; justify-self: center; border: 1px solid #d9d9d9; color: var(--ink); font-family: 'Montserrat'; font-size: 15px; font-weight: 800; letter-spacing: -.04em; }
.home-brand-card strong { overflow: hidden; color: var(--ink); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.brand-detail-hero { display: grid; grid-template-columns: 180px 1fr; gap: 32px; align-items: center; padding: 36px; border: 1px solid var(--line); border-top: 3px solid var(--red); background: #fff; }
.brand-detail-logo { width: 150px; height: 96px; display: grid; place-items: center; border: 2px solid var(--red); color: var(--red); font-family: 'Montserrat'; font-size: 32px; font-weight: 800; }
.brand-detail-hero h1 { margin: 8px 0 10px; font-family: 'Montserrat'; font-size: clamp(30px, 4vw, 48px); letter-spacing: -.06em; }
.brand-detail-hero p { margin: 0 0 12px; color: #777; font-size: 13px; }
.brand-products-section { padding: 58px 0 30px; }

/* ---------- FOOTER ---------- */
.store-footer { background: linear-gradient(135deg, #b9101c 0%, var(--red) 55%, #c91420 100%); color: #fff; }
.footer-main { max-width: var(--max); padding: 48px 18px 34px; margin: 0 auto; display: grid; grid-template-columns: 1.25fr repeat(4, minmax(0, 1fr)); gap: 16px; }
.footer-about, .footer-column { padding: 20px; border: 1px solid rgba(255,255,255,.16); border-radius: 14px; background: rgba(255,255,255,.07); }
.footer-about .footer-brand-card { width: 112px; height: 112px; justify-content: center; padding: 6px; border: 1px solid rgba(255,255,255,.85); border-radius: 16px; background: #fff; box-shadow: 0 4px 12px rgba(67,0,7,.1); }
.footer-about .footer-brand-logo { width: 100px; height: 100px; object-fit: contain; filter: none; opacity: 1; }
.footer-about p { max-width: 255px; margin: 16px 0 18px; color: rgba(255,255,255,.82); font-size: 11px; line-height: 1.8; }
.footer-socials { display: flex; gap: 8px; }
.footer-socials span { width: 26px; height: 26px; display: grid; place-items: center; border: 1px solid #515151; border-radius: 50%; color: #ccc; font-size: 10px; }
.footer-column { display: grid; align-content: start; gap: 11px; }
.footer-column h3 { margin: 4px 0 8px; color: #fff; font-size: 13px; font-weight: 600; }
.footer-column a, .footer-column p { margin: 0; color: rgba(255,255,255,.78); font-size: 11px; line-height: 1.6; }
.footer-column a:hover { color: #fff; }
.footer-policies { max-width: var(--max); padding: 22px 18px 24px; margin: 0 auto 18px; border-top: 1px solid rgba(255,255,255,.16); border-bottom: 1px solid rgba(255,255,255,.16); }
.footer-policies > h2 { margin: 0 0 14px; color: #fff; font-size: 13px; font-weight: 700; }
.footer-policy-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.footer-policy-grid a { min-width: 0; min-height: 54px; padding: 11px 13px; display: flex; flex-direction: column; justify-content: center; gap: 5px; border: 1px solid rgba(255,255,255,.16); border-radius: 10px; background: rgba(255,255,255,.07); color: #fff; transition: background .2s ease, transform .2s ease; }
.footer-policy-grid a:hover { background: rgba(255,255,255,.14); transform: translateY(-1px); }
.footer-policy-grid a span:first-child { font-size: 10px; font-weight: 700; line-height: 1.35; }
.footer-disclaimer { max-width: var(--max); padding: 18px; margin: 0 auto 18px; border: 1px solid rgba(255,255,255,.15); border-radius: 12px; background: rgba(0,0,0,.07); color: rgba(255,255,255,.82); }
.footer-disclaimer h2 { margin: 0 0 9px; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.footer-disclaimer p { max-width: 1050px; margin: 0 0 7px; font-size: 10px; line-height: 1.7; }
.footer-bottom { max-width: var(--max); padding: 16px 18px; margin: 0 auto; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,.16); color: rgba(255,255,255,.7); font-size: 10px; }
.footer-build-banner { width: 100%; line-height: 0; background: #fff; }
.footer-build-banner img { display: block; width: 100%; height: auto; max-width: none; }

/* ---------- SHARED INNER PAGES ---------- */
.page-shell { max-width: var(--max); padding: 68px 18px 100px; margin: 0 auto; }
.page-shell.narrow { max-width: 800px; }
.page-intro { max-width: 650px; margin-bottom: 45px; }
.page-intro h1 { margin: 8px 0 15px; font-family: 'Montserrat'; font-size: clamp(37px, 5vw, 60px); line-height: 1; letter-spacing: -.06em; }
.page-intro p { color: var(--muted); font-size: 14px; line-height: 1.75; }
.eyebrow { color: var(--red); font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.catalog-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; margin-bottom: 35px; }
.catalog-toolbar h1 { margin: 8px 0 0; font-family: 'Montserrat'; font-size: clamp(38px, 5vw, 60px); line-height: 1; letter-spacing: -.06em; }
.search-field { min-width: 290px; padding: 0 14px; height: 43px; display: flex; align-items: center; gap: 9px; border: 1px solid var(--line); background: #fff; }
.search-field:focus-within { border-color: var(--red); }
.search-field span { color: var(--red); font-size: 20px; }
.search-field input { min-width: 0; border: 0; outline: 0; padding: 0; font-size: 12px; }
input, select, textarea { width: 100%; border: 1px solid var(--line); outline: 0; padding: 13px; background: #fff; color: var(--ink); font-size: 13px; }
input:focus, select:focus, textarea:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(229,35,47,.08); }
label { display: grid; gap: 7px; color: #777; font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.catalog-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 19px; }
.category-list { display: flex; flex-wrap: wrap; gap: 9px; margin: -10px 0 26px; }
.category-chip { display: inline-flex; align-items: center; gap: 7px; padding: 9px 13px; border: 1px solid var(--line); background: #fff; color: #777; font-size: 10px; cursor: pointer; }
.category-chip:hover, .category-chip.active { border-color: var(--red); background: var(--red); color: #fff; }
.category-chip-image { width: 23px; height: 23px; border-radius: 50%; object-fit: cover; }
.data-alert { padding: 13px 16px; margin-bottom: 20px; border-left: 3px solid var(--red); background: #fff4f4; color: #8d373d; font-size: 12px; }
.part-card { overflow: hidden; border: 1px solid var(--line); background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.part-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.08); }
.part-card-media { height: 210px; position: relative; display: grid; place-items: center; overflow: hidden; background: #f8f8f8; }
.part-card-media::after { content: ''; position: absolute; width: 210px; height: 70px; border: 1px solid rgba(229,35,47,.12); border-radius: 50%; transform: rotate(-25deg); }
.part-card-image { width: 100%; height: 100%; position: relative; z-index: 1; object-fit: cover; }
.part-glyph { color: #b7b7b7; font-size: 27px; font-weight: 800; letter-spacing: .12em; z-index: 1; }
.part-tag { position: absolute; left: 13px; top: 13px; z-index: 2; padding: 5px 8px; background: var(--red); color: #fff; font-size: 8px; text-transform: uppercase; }
.part-card-body { padding: 18px; }
.part-card h3 { margin: 8px 0 17px; font-size: 17px; }
.part-meta { padding-top: 13px; display: flex; justify-content: space-between; border-top: 1px solid var(--line); color: #999; font-size: 10px; }
.part-price { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
.part-price strong { color: var(--red); font-size: 17px; }
.part-price del { color: #aaa; font-size: 10px; }
.part-card-actions { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
.part-add-to-cart { min-height: 36px; padding: 0 14px; }
.part-add-to-cart:disabled { cursor: not-allowed; opacity: .55; }
.part-request-link { margin-left: auto; color: var(--red); font-size: 11px; font-weight: 700; }
.part-booking-button { width: 100%; min-height: 40px; margin-top: 17px; }
.product-booking-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
.empty-state { grid-column: 1 / -1; padding: 55px 20px; border: 1px dashed var(--line); color: #888; text-align: center; }
.empty-state strong, .empty-state span { display: block; }
.empty-state span { margin-top: 8px; font-size: 12px; }
.page-loader { min-height: 58vh; padding: 48px 20px; display: grid; place-items: center; background: #fff; color: #252525; text-align: center; }
.page-loader-content { display: grid; justify-items: center; gap: 14px; }
.page-loader-spinner { width: 24px; height: 24px; display: block; border: 2px solid #e2e2e2; border-top-color: #252525; border-radius: 50%; animation: alwaha-loader-spin .72s linear infinite; }
.page-loader-label { color: #555; font-size: 10px; font-weight: 600; letter-spacing: .04em; }
@keyframes alwaha-loader-spin { to { transform: rotate(360deg); } }
@media (max-width: 520px) { .page-loader { min-height: 52vh; padding: 36px 15px; } .page-loader-spinner { width: 22px; height: 22px; } }
@media (prefers-reduced-motion: reduce) { .page-loader-spinner { animation: none; } }

/* ---------- FORMS / CONTACT ---------- */
.booking-form, .finder-card { max-width: 860px; padding: 34px; display: grid; gap: 24px; border: 1px solid var(--line); background: #fff; box-shadow: 0 16px 40px rgba(28,28,28,.06); }
.booking-form-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
.booking-form-heading h2 { margin: 0; font-family: 'Montserrat'; font-size: 24px; letter-spacing: -.05em; }
.booking-form-heading p { max-width: 260px; margin: 0; color: #888; font-size: 11px; line-height: 1.6; }
.booking-form-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-top: 4px; }
.booking-form-actions > span { color: #999; font-size: 10px; }
.booking-status-panel { display: grid; gap: 5px; padding: 14px 16px; font-size: 12px; line-height: 1.6; }
.booking-status-panel.success { border-left: 3px solid #2d8b5d; background: #effaf4; color: #236b49; }
.booking-status-panel.error { border-left: 3px solid var(--red); background: #fff3f3; color: #a33c43; }
.booking-contact-note { display: grid; gap: 5px; padding: 15px 16px; border-left: 3px solid var(--red); background: #fff7f7; color: #6f4a4d; font-size: 11px; line-height: 1.55; }
.booking-contact-note strong { color: var(--ink); font-size: 12px; }
.finder-vehicle-image { width: 100%; height: 190px; object-fit: cover; background: #f8f8f8; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; }
.booking-form .button, .finder-card .button { justify-self: start; }
.button { min-height: 40px; padding: 0 20px; border: 0; background: var(--red); color: #fff; font-size: 11px; font-weight: 700; }
.button:hover { background: var(--red-dark); }
.button:disabled { cursor: wait; opacity: .62; }
.button-light { background: #fff; color: var(--red); }
.form-success { color: #287d58; font-size: 12px; }
.form-error { color: #a83e45; font-size: 12px; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.contact-grid > div { padding: 28px; border: 1px solid var(--line); background: #fff; }
.contact-grid h2 { margin: 14px 0 8px; font-size: 22px; }
.contact-grid p { color: #777; font-size: 13px; line-height: 1.7; }
.cart-panel { display: grid; gap: 14px; padding: 22px; border: 1px solid #f0d6d8; background: linear-gradient(180deg, #fffafa, #fff); }
.cart-panel-heading, .cart-total { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.cart-panel-heading h3 { margin: 2px 0 0; font-size: 18px; }
.cart-clear, .cart-remove { border: 0; background: transparent; color: var(--red); font-size: 11px; font-weight: 700; }
.cart-remove { width: 24px; height: 24px; font-size: 18px; line-height: 1; cursor: pointer; }
.cart-items { display: grid; gap: 10px; }
.cart-item { display: grid; grid-template-columns: 58px minmax(0, 1fr) 72px auto 20px; align-items: center; gap: 12px; padding: 10px; border: 1px solid var(--line); background: #fff; }
.cart-item-image { width: 58px; height: 58px; display: grid; place-items: center; overflow: hidden; background: var(--soft); color: var(--red); font-size: 10px; font-weight: 700; }
.cart-item-image img { width: 100%; height: 100%; object-fit: cover; }
.cart-item-copy { min-width: 0; display: grid; gap: 3px; }
.cart-item-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.cart-item-copy small, .cart-item-copy span { color: #888; font-size: 10px; }
.cart-quantity { display: grid; gap: 4px; color: #888; font-size: 9px; }
.cart-quantity input { width: 64px; height: 30px; padding: 0 7px; border: 1px solid var(--line); }
.cart-item-total { color: var(--red); font-size: 12px; white-space: nowrap; }
.cart-empty { padding: 16px; border: 1px dashed #e7c5c8; color: #888; font-size: 11px; line-height: 1.6; }
.cart-total { padding-top: 12px; border-top: 1px solid #eedfe0; color: #777; font-size: 11px; }
.cart-total strong { color: var(--red); font-size: 19px; }
.cart-total small { color: #999; font-size: 9px; }

.vehicle-home-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }

/* ---------- RESPONSIVE ---------- */
@media (max-width: 900px) {
  .store-header { gap: 25px; }
  .main-nav a { padding: 0 13px; }
  .hero-storefront-inner { grid-template-columns: 44% 56%; }
  .category-grid { gap: 10px; }
  .category-card { padding: 6px 8px; }
  .category-card img { width: 55px; }
  .footer-main { gap: 24px; }
}
@media (max-width: 700px) {
  .store-header { min-height: 70px; padding: 0 14px; gap: 14px; }
  .logo { width: 90px; height: 46px; }
  .header-actions { margin-left: auto; gap: 14px; }
  .search-trigger span { display: none; }
  .menu-toggle { display: block; }
  .main-nav { display: block; position: fixed; top: 0; right: 0; bottom: 0; z-index: 220; width: min(340px, 88vw); min-height: 100dvh; overflow-y: auto; transform: translateX(105%); transition: transform .24s ease; box-shadow: -16px 0 36px rgba(0,0,0,.2); }
  .main-nav.is-open { transform: translateX(0); }
  .nav-drawer-header { min-height: 72px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.18); font-family: 'Montserrat'; font-size: 18px; }
  .nav-drawer-header button { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid rgba(255,255,255,.45); background: transparent; color: #fff; }
  .nav-drawer-header svg { width: 20px; height: 20px; }
  .main-nav-inner { padding: 18px 20px 28px; display: grid; grid-template-columns: 1fr; align-content: start; gap: 4px; }
  .main-nav a { min-height: 48px; padding: 0 14px; }
  .nav-search-button { min-height: 48px; padding: 0 14px; margin: 14px 0 0; justify-content: flex-start; border-top: 1px solid rgba(255,255,255,.18); }
  .menu-drawer-backdrop { display: block; position: fixed; inset: 0; z-index: 210; border: 0; background: rgba(0,0,0,.42); }
  .hero-storefront-inner { min-height: 540px; padding: 0 22px 35px; display: flex; flex-direction: column; align-items: stretch; }
  .hero-storefront-copy { padding-top: 52px; }
  .hero-storefront h1 { font-size: 47px; }
  .hero-storefront-art { position: absolute; right: -5%; bottom: 28px; width: 75%; height: 260px; opacity: .95; }
  .hero-storefront-copy p { max-width: 235px; }
  .section-heading { align-items: start; flex-direction: column; gap: 14px; }
  .category-grid { grid-template-columns: repeat(2, 1fr); }
  .promo-section { grid-template-columns: 1fr; gap: 10px; }
  .promo-card { min-height: 135px; }
  .arrival-tabs { gap: 13px; flex-wrap: wrap; }
  .arrival-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .arrival-image { height: 165px; }
  .arrival-details { padding: 12px; }
  .vehicle-home-grid { grid-template-columns: 1fr; gap: 14px; }
  .vehicle-home-card > img, .vehicle-home-card > .database-image-empty { height: 220px; }
  .vehicle-detail-hero { grid-template-columns: 1fr; }
  .vehicle-detail-media, .vehicle-detail-media img, .vehicle-detail-placeholder { min-height: 250px; height: 250px; }
  .vehicle-detail-copy { padding: 26px 20px; }
  .vehicle-detail-specs { gap: 8px; }
  .vehicle-info-strip { grid-template-columns: 1fr 1fr; margin-bottom: 40px; padding: 16px; }
  .category-detail-hero { grid-template-columns: 1fr; }
  .category-detail-media, .category-detail-media img, .category-detail-placeholder { min-height: 250px; height: 250px; }
  .category-detail-copy { padding: 26px 20px; }
  .category-detail-stats { gap: 8px; }
  .category-products-section { padding-top: 40px; }
  .home-brands-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
  .home-brand-card { padding: 10px 6px; }
  .brand-detail-hero { grid-template-columns: 1fr; gap: 22px; padding: 26px 20px; }
  .brand-detail-logo { width: 112px; height: 72px; font-size: 25px; }
  .brand-products-section { padding-top: 40px; }
  .wide-feature { margin: 0 14px 42px; padding: 35px 24px 10px; display: block; }
  .wide-feature-art { height: 190px; }
  .wide-feature-art img { height: 200px; }
  .service-strip { grid-template-columns: 1fr 1fr; gap: 18px 0; }
  .service-strip > div, .service-strip > div:first-child { padding: 0 15px; border-right: 1px solid var(--line); }
  .service-strip > div:nth-child(2n) { border-right: 0; }
  .newsletter-card { display: block; }
  .newsletter-search { margin-top: 20px; width: 100%; }
  .footer-main { padding: 38px 18px; grid-template-columns: 1fr 1fr; }
  .footer-about { grid-column: 1 / -1; }
  .footer-bottom { display: grid; gap: 7px; }
  .catalog-toolbar { display: block; }
  .search-field { min-width: 0; margin-top: 22px; }
  .catalog-grid { grid-template-columns: 1fr 1fr; }
  .form-grid, .contact-grid { grid-template-columns: 1fr; }
  .booking-form-heading { display: block; }
  .booking-form-heading p { margin-top: 12px; }
  .page-shell { padding: 50px 18px 75px; }
  .booking-form { padding: 22px 16px; }
  .cart-panel { padding: 14px; }
  .cart-item { grid-template-columns: 50px minmax(0, 1fr) 64px 18px; gap: 9px; }
  .cart-item-image { width: 50px; height: 50px; }
  .cart-item-total { grid-column: 2 / 3; grid-row: 2; }
  .cart-quantity { grid-column: 3; grid-row: 1 / span 2; }
  .cart-remove { grid-column: 4; grid-row: 1 / span 2; }
}
@media (max-width: 430px) {
  .header-actions { gap: 10px; }
  .icon-action svg { width: 20px; }
  .hero-storefront-inner { min-height: 515px; }
  .hero-storefront-art { right: -18%; width: 88%; }
  .category-card { min-height: 67px; }
  .category-card img { width: 48px; height: 48px; }
  .category-card strong { font-size: 10px; }
  .arrival-grid { grid-template-columns: 1fr 1fr; }
  .arrival-image { height: 140px; }
  .arrival-details h3 { min-height: 48px; font-size: 11px; }
  .price-row { display: grid; gap: 4px; }
  .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .vehicle-home-grid { grid-template-columns: 1fr; }
  .booking-form, .finder-card { padding: 22px 16px; }
}

/* Database-driven hero carousel */
.db-hero-carousel { max-width: var(--max); min-height: 435px; padding: 0 18px; margin: 0 auto; display: grid; grid-template-columns: 41% 59%; align-items: center; position: relative; background: #f8f8f8; }
.db-hero-copy { position: relative; z-index: 1; padding: 30px 28px 36px 0; }
.db-hero-copy .eyebrow { display: block; margin-bottom: 11px; color: #4f4f4f; font-size: 12px; }
.db-hero-copy h1 { margin: 0 0 16px; color: #272727; font-family: 'Montserrat'; font-size: clamp(43px, 5.5vw, 68px); font-weight: 800; line-height: .98; letter-spacing: -.07em; }
.db-hero-copy .hero-lede { max-width: 320px; margin-bottom: 25px; color: #777; font-size: 12px; line-height: 1.8; }
.db-hero-copy .button { background: var(--red); color: #fff; }
.db-hero-visual { min-height: 435px; position: relative; background-position: center; background-size: cover; overflow: hidden; }
.hero-visual-shade { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(22, 38, 45, .08), rgba(22, 38, 45, .74)); }
.db-hero-stamp { position: absolute; z-index: 1; right: 7%; bottom: 8%; border: 1px solid #f5d18d; padding: 13px; color: #f5d18d; font: 10px 'Montserrat'; line-height: 1.6; letter-spacing: .08em; transform: rotate(8deg); }
.db-hero-stamp b { color: #fff; }
.db-hero-dots { position: absolute; left: 20%; bottom: 20px; z-index: 2; display: flex; gap: 8px; }
.db-hero-dot { width: 30px; height: 3px; border: 0; padding: 0; background: #c8c8c8; cursor: pointer; }
.db-hero-dot.active { background: var(--red); }
.back-link { display: inline-block; margin-bottom: 28px; color: var(--muted); font-size: 12px; }
.product-detail-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr); gap: 7vw; align-items: start; }
.product-detail-image { min-height: 520px; display: grid; place-items: center; overflow: hidden; background: #f3f3f3; }
.product-detail-image img { width: 100%; height: 520px; object-fit: cover; }
.product-thumbnails { display: flex; gap: 10px; margin-top: 12px; }
.thumbnail { width: 72px; height: 72px; padding: 0; border: 2px solid transparent; background: #fff; cursor: pointer; }
.thumbnail.active { border-color: var(--red); }
.thumbnail img { width: 100%; height: 100%; object-fit: cover; }
.product-detail-copy h1 { margin: 15px 0 18px; font-family: 'Montserrat'; font-size: clamp(38px, 5vw, 66px); line-height: 1; letter-spacing: -.06em; }
.product-description { max-width: 540px; color: var(--muted); line-height: 1.75; }
.product-price { display: flex; gap: 14px; align-items: center; margin: 28px 0 16px; }
.product-price strong { font-size: 27px; }
.product-price del { color: #999; }
.product-status { display: flex; justify-content: space-between; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 14px 0; margin-bottom: 24px; color: var(--muted); font-size: 11px; }
.spec-list { margin: 42px 0 0; border-top: 1px solid var(--line); }
.spec-list div { display: flex; justify-content: space-between; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.spec-list dt { color: var(--muted); font-size: 10px; text-transform: uppercase; }
.spec-list dd { margin: 0; text-align: right; }
.fitment-panel { display: grid; grid-template-columns: .8fr 1.2fr; gap: 8vw; margin-top: 90px; padding: 52px 0; border-top: 1px solid var(--line); }
.fitment-panel h2 { margin: 12px 0 0; font-family: 'Montserrat'; font-size: 36px; line-height: 1.05; }
.fitment-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.fitment-list div { padding: 18px; border: 1px solid var(--line); background: #fff; }
.fitment-list strong, .fitment-list span { display: block; }
.fitment-list span { margin-top: 7px; color: var(--muted); font-size: 10px; }
@media (max-width: 800px) {
  .db-hero-carousel { grid-template-columns: 1fr; padding: 0 18px 32px; }
  .db-hero-copy { padding: 45px 0 24px; }
  .db-hero-visual { min-height: 290px; }
  .db-hero-dots { left: 50%; bottom: 15px; transform: translateX(-50%); }
  .product-detail-grid, .fitment-panel { grid-template-columns: 1fr; }
  .product-detail-image, .product-detail-image img { min-height: 330px; height: 330px; }
  .fitment-panel { margin-top: 65px; }
}


/* ---------- HOME: reference-inspired storefront finish ---------- */
:root { --dark: #2d2d2d; }
.main-nav { background: #2d2d2d; }
.main-nav a.active { background: var(--red); }

.categories-section { padding-top: 46px; padding-bottom: 44px; }
.categories-section .section-kicker,
.arrivals-section .section-kicker { display: none; }
.section-heading { margin-bottom: 22px; }
.section-heading h2 { padding-bottom: 9px; font-size: 21px; font-weight: 600; letter-spacing: -.045em; }
.section-heading h2::after { width: 48px; }
.category-grid { gap: 14px; }
.category-card {
  min-height: 76px;
  padding: 7px 11px;
  gap: 11px;
  border-color: #e9e9e9;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .025);
}
.category-card:hover { border-color: #d8d8d8; box-shadow: 0 6px 16px rgba(0, 0, 0, .055); }
.category-card img { width: 61px; height: 58px; }
.category-card strong { color: #373737; font-size: 11px; }
.category-card small { color: #888; font-size: 9px; }
.category-card > svg { display: none; }

.promo-section { padding-bottom: 54px; gap: 16px; }
.promo-card-database {
  min-height: 120px;
  border: 1px solid #f0f0f0;
  background: #f5f5f5;
  color: #303030;
}
.promo-card-database small { color: #858585; }
.promo-card-database strong { max-width: 150px; color: #313131; font-family: 'Montserrat'; font-size: 18px; font-weight: 600; }
.promo-card-database span { color: var(--red); }
.promo-card-database img { width: 145px; height: 118px; mix-blend-mode: multiply; }

.arrivals-section { padding-bottom: 58px; }
.arrivals-heading { align-items: center; }
.arrival-grid { gap: 15px; }
.arrival-card { border-color: #e8e8e8; box-shadow: 0 1px 3px rgba(0, 0, 0, .02); }
.arrival-image { height: 205px; background: #fff; }
.arrival-image img { width: 86%; height: 86%; object-fit: contain; }
.arrivals-section .sale-badge { display: none; }
.arrival-details { padding: 13px 14px 15px; }
.arrival-details h3 { min-height: 35px; margin-top: 7px; font-size: 11px; font-weight: 500; }
.arrival-details > small { color: #929292; }
.arrivals-section .rating { display: none; }
.price-row { margin-top: 10px; }
.price-row strong { color: #555; font-size: 11px; font-weight: 500; }
.price-row del { color: #999; }

.promo-card-database:hover { background: #f0f0f0; }
.vehicle-home-card { border-color: #e8e8e8; }
.vehicle-home-card:hover { box-shadow: 0 8px 18px rgba(0, 0, 0, .07); }

@media (max-width: 900px) {
  .category-grid { gap: 10px; }
  .category-card { padding: 7px 8px; }
  .category-card img { width: 54px; }
}

@media (max-width: 700px) {
  .main-nav { background: #2d2d2d; }
  .main-nav-inner { grid-template-columns: 1fr 1fr; }
  .categories-section { padding-top: 35px; padding-bottom: 35px; }
  .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .category-card { min-width: 0; min-height: 68px; padding: 6px 8px; gap: 7px; }
  .category-card img { width: 45px; height: 48px; }
  .category-card strong { font-size: 10px; line-height: 1.25; }
  .category-card small { display: none; }
  .promo-section { grid-template-columns: 1fr; gap: 9px; padding-bottom: 38px; }
  .promo-card-database { min-height: 108px; }
  .promo-card-database img { width: 128px; height: 105px; }
  .arrivals-section { padding-bottom: 42px; }
  .arrival-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .arrival-image { height: 170px; }
  .arrival-details { padding: 11px; }
  .arrival-details h3 { min-height: 40px; }
  .vehicle-home-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .section-heading { margin-bottom: 18px; }
  .section-heading h2 { font-size: 19px; }
  .category-grid { gap: 8px; }
  .category-card { min-height: 63px; }
  .category-card img { width: 39px; height: 42px; }
  .promo-card-database { min-height: 100px; padding: 12px 15px; }
  .promo-card-database img { width: 112px; height: 96px; }
  .arrival-image { height: 145px; }
  .arrival-details h3 { min-height: 42px; font-size: 10px; }
  .price-row { gap: 5px; }
  .vehicle-home-grid { grid-template-columns: 1fr; }
}

/* ---------- HOME: database vehicle showcase ---------- */
.vehicle-home-section { padding-top: 34px; padding-bottom: 58px; background: #fff; }
.vehicle-home-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.vehicle-home-card { display: block; min-width: 0; overflow: hidden; border: 1px solid #f0f1f2; background: #fff; color: var(--ink); transition: transform .2s ease, box-shadow .2s ease; }
.vehicle-home-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(28, 38, 42, .09); }
.vehicle-home-card-top { display: grid; gap: 4px; min-height: 78px; padding: 13px 15px 4px; text-align: left; }
.vehicle-home-card-top small { color: #586267; font: 9px 'Montserrat'; line-height: 1; }
.vehicle-home-card-top strong { color: #1f2528; font-family: 'Montserrat'; font-size: 15px; font-weight: 600; line-height: 1.05; letter-spacing: .035em; text-transform: uppercase; }
.vehicle-home-card-top span { color: #899196; font-size: 9px; line-height: 1.2; }
.vehicle-home-card-image { height: 145px; display: grid; place-items: center; overflow: hidden; background: #fff; }
.vehicle-home-card-image img { width: 100%; height: 100%; padding: 7px 9px; object-fit: contain; object-position: center; }
.vehicle-home-card-image .database-image-empty { width: 100%; height: 100%; display: grid; place-items: center; color: #9aa2a5; background: #fff; font-size: 11px; }
.vehicle-home-card-specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; padding: 10px 14px 13px; }
.vehicle-home-card-specs span { display: grid; gap: 3px; min-width: 0; text-align: left; }
.vehicle-home-card-specs small { color: #899296; font-size: 7px; line-height: 1.1; }
.vehicle-home-card-specs b { overflow: hidden; color: #454d50; font-size: 8px; font-weight: 500; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
.vehicle-home-card-specs i { color: var(--red); font-style: normal; }
@media (max-width: 700px) {
  .vehicle-home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .vehicle-home-card-top { min-height: 68px; padding: 11px 11px 5px; }
  .vehicle-home-card-top strong { font-size: 12px; }
  .vehicle-home-card-image { height: 125px; }
  .vehicle-home-card-specs { padding: 8px 10px 11px; gap: 5px; }
}
@media (max-width: 480px) {
  .vehicle-home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .vehicle-home-card-top { min-height: 62px; padding: 9px 9px 3px; gap: 3px; }
  .vehicle-home-card-top small { font-size: 8px; }
  .vehicle-home-card-top strong { min-height: 26px; font-size: 10px; line-height: 1.08; letter-spacing: .02em; }
  .vehicle-home-card-top span { font-size: 7px; }
  .vehicle-home-card-image { height: 105px; }
  .vehicle-home-card-image img { padding: 4px; }
  .vehicle-home-card-specs { padding: 7px 7px 9px; gap: 3px; }
  .vehicle-home-card-specs small { font-size: 6px; }
  .vehicle-home-card-specs b { font-size: 7px; }
}


/* ---------- HOME: pure-white stages with Al Waha red category accents ---------- */
.home-page { background: #fff; }
.home-page .category-card {
  border: 1px solid var(--red);
  border-bottom-width: 2px;
  background: #fff;
}
.home-page .category-card strong { color: var(--red); }
.home-page .category-card:hover { border-color: var(--red-dark); background: var(--red); }
.home-page .category-card:hover strong,
.home-page .category-card:hover small { color: #fff; }
.home-page .promo-card-database,
.home-page .arrival-image,
.home-page .arrival-card { background: #fff; }
.home-page .promo-card-database { border-color: #ededed; }
.home-page .promo-card-database:hover { background: #fff; }


/* ---------- HOME: single category showcase in red split boxes ---------- */
.category-promo-section { padding-top: 42px; padding-bottom: 50px; }
.category-promo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.category-promo-card {
  min-height: 168px;
  padding: 18px 17px;
  border: 0;
  background: var(--red);
  color: #fff;
  box-shadow: 0 5px 14px rgba(190, 22, 35, .12);
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
}
.category-promo-card > div { width: 61%; gap: 7px; }
.category-promo-card small { color: rgba(255,255,255,.78); font-size: 9px; }
.category-promo-card strong { max-width: 100%; color: #fff; font-size: 17px; line-height: 1.2; }
.category-promo-card p { max-width: 230px; margin: 0; color: rgba(255,255,255,.84); font-size: 10px; line-height: 1.45; }
.category-promo-card span { margin-top: 3px; color: #fff; font-size: 9px; font-weight: 700; }
.category-promo-card img { width: 39%; max-width: 155px; height: 132px; margin-right: -9px; object-fit: contain; mix-blend-mode: multiply; }
.category-promo-card:hover { background: var(--red-dark); transform: translateY(-3px); box-shadow: 0 10px 22px rgba(190, 22, 35, .2); }

.home-page .category-promo-card { background: var(--red); }
.home-page .category-promo-card:hover { background: var(--red-dark); }

@media (max-width: 900px) {
  .category-promo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 700px) {
  .category-promo-section { padding-top: 34px; padding-bottom: 39px; }
  .category-promo-grid { grid-template-columns: 1fr; gap: 10px; }
  .category-promo-card { min-height: 142px; padding: 14px 16px; }
  .category-promo-card > div { width: 64%; }
  .category-promo-card img { width: 36%; height: 116px; }
}

@media (max-width: 420px) {
  .category-promo-card { min-height: 132px; }
  .category-promo-card strong { font-size: 16px; }
  .category-promo-card p { font-size: 9px; }
  .category-promo-card img { height: 105px; }
}


/* Keep database category artwork true to its original colors on red cards. */
.home-page .category-promo-card img {
  mix-blend-mode: normal;
  filter: none;
  background: #fff;
  padding: 6px;
}

/* ---------- HOME: reference-style category grid ---------- */
.category-start-section { padding-top: 42px; padding-bottom: 54px; background: #fff; }
.category-start-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.category-start-heading h1, .category-start-heading h2 { margin: 0; color: #202124; font-family: 'Montserrat'; font-size: clamp(28px, 3.2vw, 44px); font-weight: 700; letter-spacing: -.055em; line-height: 1; }
.category-start-view-all { display: inline-flex; align-items: center; gap: 12px; color: #696969; font-size: clamp(17px, 1.8vw, 25px); white-space: nowrap; }
.category-start-view-all span { color: #454545; font-size: 38px; font-weight: 300; line-height: .5; }
.category-count { color: #696969; font-size: 15px; }
.category-start-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 42px; row-gap: 42px; }
.category-start-card { display: grid; justify-items: center; gap: 18px; min-width: 0; color: #202124; text-align: center; }
.category-start-card:hover { color: #202124; }
.category-start-image { width: 100%; height: 190px; display: grid; place-items: center; overflow: hidden; background: #fff; }
.category-start-image img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
.category-start-image > span { width: 100%; height: 100%; display: grid; place-items: center; border-radius: 28px; background: #f4f4f4; color: #777; font-size: 50px; }
.category-start-card strong { max-width: 230px; color: #202124; font-size: 22px; font-weight: 600; line-height: 1.25; }
@media (max-width: 700px) {
  .category-start-section { padding-top: 32px; padding-bottom: 42px; }
  .category-start-heading { margin-bottom: 22px; }
  .category-start-heading h1, .category-start-heading h2 { font-size: 29px; }
  .category-count { font-size: 13px; }
  .category-start-view-all { gap: 5px; font-size: 16px; }
  .category-start-view-all span { font-size: 28px; }
  .category-start-grid { column-gap: 18px; row-gap: 32px; }
  .category-start-image { height: 108px; }
  .category-start-card { gap: 11px; }
  .category-start-card strong { font-size: 15px; }
}
/* ---------- HOME: refined reference-style vehicle cards ---------- */
.vehicle-home-section { padding: 36px 18px 64px; }
.vehicle-home-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.vehicle-home-card { display: grid; grid-template-rows: auto auto auto; min-height: 0; border: 1px solid #f1d0d3; border-top: 3px solid var(--red); border-radius: 2px; background: #fff; box-shadow: 0 1px 0 rgba(24, 31, 35, .02); }
.vehicle-home-card:hover { transform: translateY(-4px); border-color: var(--red); box-shadow: 0 14px 28px rgba(229, 35, 47, .14); }
.vehicle-home-card-top { min-height: 58px; padding: 4px 15px 0; gap: 1px; }
.vehicle-home-card-top small { color: var(--red); font-family: 'Montserrat'; font-size: 13px; font-weight: 500; letter-spacing: .02em; }
.vehicle-home-card-top strong { color: #20272b; font-family: 'Montserrat'; font-size: 24px; font-weight: 800; line-height: .98; letter-spacing: .015em; text-transform: uppercase; }
.vehicle-home-card-top span { width: 100%; color: #b51d28; font-family: 'Montserrat'; font-size: 9px; letter-spacing: .01em; }
.vehicle-home-card-image { width: 100%; height: 145px; background: #fff; }
.vehicle-home-card-image img { width: 100%; height: 100%; padding: 0; object-fit: cover; object-position: center; transition: transform .25s ease; }
.vehicle-home-card:hover .vehicle-home-card-image img { transform: scale(1.035); }
.vehicle-home-card-specs { width: 100%; min-height: 44px; padding: 7px 14px 8px; border-top: 1px solid #f1d0d3; }
.vehicle-home-card-specs span { gap: 4px; }
.vehicle-home-card-specs small { color: #b51d28; font-family: 'Montserrat'; font-size: 7px; letter-spacing: .01em; }
.vehicle-home-card-specs b { color: #394247; font-family: 'Montserrat'; font-size: 8px; font-weight: 600; }
.vehicle-home-card-specs i { color: var(--red); font-size: 10px; }
@media (max-width: 700px) {
  .vehicle-home-section { padding: 30px 14px 46px; }
  .vehicle-home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .vehicle-home-card { min-height: 0; }
  .vehicle-home-card-top { min-height: 52px; padding: 4px 10px 0; gap: 1px; }
  .vehicle-home-card-top small { font-size: 11px; }
  .vehicle-home-card-top strong { font-size: 17px; letter-spacing: .01em; }
  .vehicle-home-card-top span { font-size: 8px; }
  .vehicle-home-card-image { height: 118px; }
  .vehicle-home-card-specs { min-height: 39px; padding: 6px 9px 7px; gap: 4px; }
  .vehicle-home-card-specs small { font-size: 6px; }
  .vehicle-home-card-specs b { font-size: 7px; }
}
@media (max-width: 480px) {
  .vehicle-home-section { padding-left: 10px; padding-right: 10px; }
  .vehicle-home-grid { gap: 7px; }
  .vehicle-home-card { min-height: 0; }
  .vehicle-home-card-top { min-height: 48px; padding: 3px 8px 0; }
  .vehicle-home-card-top small { font-size: 10px; }
  .vehicle-home-card-top strong { min-height: 18px; font-size: 15px; }
  .vehicle-home-card-top span { font-size: 7px; }
  .vehicle-home-card-image { height: 108px; }
  .vehicle-home-card-specs { min-height: 36px; padding: 5px 7px 6px; }
  .vehicle-home-card-specs small { font-size: 5.5px; }
  .vehicle-home-card-specs b { font-size: 6.5px; }
}

.language-toggle { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 14px; margin: 5px 10px 5px 8px; border: 1px solid rgba(255,255,255,.65); border-radius: 2px; background: #fff; color: var(--red); font-size: var(--size-button); font-weight: var(--weight-semibold); white-space: nowrap; }
.language-toggle:hover { background: var(--red); color: #fff; border-color: var(--red); }
/* ---------- BRAND TYPOGRAPHY SYSTEM ---------- */
*, *::before, *::after { font-family: var(--brand-font); }
.hero-storefront h1, .db-hero-copy h1, .hero-carousel-root h1 { font-size: var(--size-hero); font-weight: var(--weight-heavy); }
.section-heading h2, .category-start-heading h1, .category-start-heading h2 { font-size: var(--size-section); font-weight: var(--weight-bold); }
.category-start-card strong, .promo-card strong, .arrival-details h3 { font-size: var(--size-card); font-weight: var(--weight-semibold); }
.hero-storefront-copy p, .category-detail-copy p, .vehicle-detail-copy p, .brand-detail-hero p, .description { font-size: var(--size-description); font-weight: var(--weight-regular); }
.main-nav a, .nav-search-button { font-size: var(--size-navigation); font-weight: var(--weight-semibold); }
.button, .red-button, .part-booking-button { font-size: var(--size-button); font-weight: var(--weight-semibold); }
.part-card h3, .arrival-details h3 { font-size: var(--size-product); font-weight: var(--weight-semibold); }
.part-price strong, .price, .product-price { font-size: var(--size-price); font-weight: var(--weight-bold); }
.category-start-card strong { max-width: 160px; font-size: clamp(10px, .85vw, 13px); line-height: 1.18; font-weight: var(--weight-semibold); }
html[dir='rtl'] body { font-family: var(--brand-font); }
html[dir='rtl'] .main-nav-inner { direction: rtl; }
html[dir='rtl'] .language-toggle { margin-right: 8px; margin-left: 10px; font-family: var(--brand-font); }
html[dir='rtl'] .search-drawer, html[dir='rtl'] .main-nav { text-align: right; }
html[dir='rtl'] .search-drawer { right: auto; left: 0; box-shadow: 14px 0 38px rgba(0,0,0,.16); }
html[dir='rtl'] .drawer-search-form > div { direction: rtl; }
html[dir='rtl'] .drawer-search-form button { order: -1; }
html[dir='rtl'] .section-heading, html[dir='rtl'] .booking-form-heading, html[dir='rtl'] .cart-panel-heading, html[dir='rtl'] .cart-total { direction: rtl; }
html[dir='rtl'] .vehicle-home-card, html[dir='rtl'] .vehicle-home-card-top, html[dir='rtl'] .vehicle-home-card-specs { text-align: right; }
html[dir='rtl'] .vehicle-home-card-specs { direction: rtl; }
html[dir='rtl'] .footer-main, html[dir='rtl'] .footer-bottom { direction: rtl; }
html[dir='rtl'] input, html[dir='rtl'] select, html[dir='rtl'] textarea { text-align: right; }
@media (max-width: 700px) {
  .category-start-card strong { max-width: 105px; font-size: 9px; line-height: 1.15; }
}
/* Compact manufacturer mark: keep the logo in the model corner, never above the vehicle card. */
.vehicle-home-card-top { position: relative; }
.vehicle-home-brand { min-height: 16px; display: flex; align-items: center; padding-right: 30px; }
.vehicle-home-brand small { display: block; }
.vehicle-home-logo-frame { position: absolute; top: 5px; right: 9px; width: 30px; height: 30px; display: grid; place-items: center; overflow: hidden; border: 0; border-radius: 0; background: transparent; }
.vehicle-home-logo-frame img { width: 24px !important; height: 24px !important; padding: 0 !important; object-fit: contain; }
@media (max-width: 700px) {
  .vehicle-home-logo-frame { top: 3px; right: 6px; width: 25px; height: 25px; }
  .vehicle-home-logo-frame img { width: 20px !important; height: 20px !important; }
  .vehicle-home-brand { padding-right: 24px; }
}

/* ---------- LIQUID GLASS HEADER: one mobile-first layout at every width ---------- */
.site-chrome {
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.store-header {
  width: 100%;
  min-height: 96px;
  margin: 0;
  padding: 0 24px;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, .72);
  border-radius: 0;
  background: rgba(255, 255, 255, .62);
  box-shadow: 0 10px 36px rgba(31, 41, 55, .11), inset 0 1px 0 rgba(255,255,255,.8);
  -webkit-backdrop-filter: blur(24px) saturate(170%);
  backdrop-filter: blur(24px) saturate(170%);
}
.header-actions { margin-left: auto; gap: 20px; }
.menu-toggle {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255,255,255,.8);
  border-radius: 15px;
  background: rgba(255,255,255,.55);
  color: var(--ink);
  box-shadow: 0 4px 14px rgba(31,41,55,.08), inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  transition: background .2s ease, transform .2s ease;
}
.menu-toggle:hover { background: rgba(255,255,255,.86); transform: translateY(-1px); }
.main-nav {
  display: block;
  position: fixed;
  top: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 220;
  width: min(360px, calc(100vw - 28px));
  min-height: 0;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,.72);
  border-radius: 24px;
  background: rgba(248, 250, 252, .76);
  color: var(--ink);
  box-shadow: 0 24px 70px rgba(15,23,42,.22), inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter: blur(30px) saturate(175%);
  backdrop-filter: blur(30px) saturate(175%);
  transform: translateX(calc(100% + 32px));
  transition: transform .28s cubic-bezier(.2,.75,.25,1);
}
.main-nav.is-open { transform: translateX(0); }
.nav-drawer-header {
  min-height: 76px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(31,41,55,.1);
  color: var(--ink);
  font-family: 'Montserrat';
  font-size: 18px;
}
.nav-drawer-header button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(31,41,55,.12);
  border-radius: 12px;
  background: rgba(255,255,255,.6);
  color: var(--ink);
}
.nav-drawer-header svg { width: 20px; height: 20px; }
.main-nav-inner {
  max-width: none;
  min-height: 0;
  padding: 18px 18px 26px;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-content: start;
  gap: 5px;
}
.main-nav a {
  min-height: 48px;
  padding: 0 15px;
  border-radius: 12px;
  color: #252b35;
  font-size: 12px;
  transition: background .2s ease, color .2s ease, transform .2s ease;
}
.main-nav a:hover { background: rgba(229,28,35,.09); color: var(--red); transform: translateX(2px); }
.main-nav a.active { background: var(--red); color: #fff; }
.main-nav a.active:hover { background: var(--red); color: #fff; }
.language-toggle {
  min-height: 42px;
  margin: 14px 0 0;
  border-color: rgba(31,41,55,.14);
  border-radius: 12px;
  background: rgba(255,255,255,.65);
}
.menu-drawer-backdrop {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 210;
  border: 0;
  background: rgba(15,23,42,.2);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}
@media (max-width: 700px) {
  .store-header {
    width: 100%;
    min-height: 70px;
    margin-top: 0;
    padding: 0 14px;
    border-radius: 0;
    gap: 14px;
  }
  .logo { width: 90px; height: 46px; }
  .header-actions { gap: 14px; }
  .menu-toggle { width: 42px; height: 42px; border-radius: 13px; }
  .main-nav {
    top: 10px;
    right: 10px;
    bottom: 10px;
    width: min(340px, calc(100vw - 20px));
    min-height: 0;
  }
  .main-nav-inner { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .footer-main { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .footer-policy-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .footer-main { padding: 38px 14px 28px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-about { grid-column: 1 / -1; }
  .footer-policy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .footer-policies { padding: 18px 14px 20px; }
  .footer-disclaimer { margin-right: 14px; margin-left: 14px; padding: 16px; }
  .footer-about .footer-brand-card { width: 100px; height: 100px; }
  .footer-about .footer-brand-logo { width: 88px; height: 88px; }
}
@media (max-width: 380px) {
  .footer-policy-grid a { min-height: 58px; padding: 10px; }
  .footer-policy-grid a span:first-child, .footer-policy-grid a span[lang='bn'] { font-size: 9px; }
}

/* ---------- HOME: neutral Popular Cars showcase ---------- */
.home-page .vehicle-home-section {
  padding-top: 54px !important;
  padding-bottom: 42px !important;
  background: #fff;
}
.home-page .popular-cars-heading {
  width: 100%;
  align-items: center;
  justify-content: center !important;
  margin-bottom: 28px;
  text-align: center;
}
.home-page .popular-cars-heading > div { display: grid; justify-items: center; gap: 8px; }
.home-page .popular-cars-eyebrow {
  color: #555;
  font-family: 'Montserrat';
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .2em;
}
.home-page .popular-cars-title-box {
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  color: #111;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: .08em;
  line-height: 1;
  text-align: center;
}
.home-page .popular-cars-title-box::after { display: none; }
.home-page .popular-cars-heading p { max-width: 430px; margin: 2px 0 0; color: #788287; font-size: 11px; line-height: 1.55; }
.home-page .vehicle-home-grid { gap: 16px; }
.home-page .vehicle-home-card {
  display: block;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.home-page .vehicle-home-card:hover { transform: none; }
.home-page .vehicle-home-card-image { height: 190px; position: relative; background: transparent; }
.home-page .vehicle-home-card-image img { width: 100%; height: 100%; padding: 0; object-fit: contain; mix-blend-mode: multiply; transition: opacity .2s ease; }
.home-page .vehicle-home-card:hover .vehicle-home-card-image img { opacity: .78; transform: none; }
.home-page .vehicle-home-image-watermark { position: absolute; top: 12px; right: 12px; z-index: 2; width: 52px; height: 52px; display: grid; place-items: center; padding: 7px; border-radius: 50%; background: rgba(255, 255, 255, .72); box-shadow: 0 2px 7px rgba(0, 0, 0, .16); pointer-events: none; }
.home-page .vehicle-home-image-watermark img { width: 100% !important; height: 100% !important; padding: 0 !important; object-fit: contain; opacity: .62 !important; filter: grayscale(1) contrast(1.25) drop-shadow(0 1px 2px rgba(0, 0, 0, .42)); mix-blend-mode: normal; }
.home-page .vehicle-home-card-top { min-height: 0; padding: 10px 0 0; display: block; text-align: center; }
.home-page .vehicle-home-card-top strong { display: block; color: #202020; font-size: 13px; font-weight: 600; letter-spacing: .01em; }
@media (max-width: 700px) {
  .home-page .vehicle-home-section { padding: 38px 14px 32px !important; }
  .home-page .popular-cars-heading { margin-bottom: 20px; }
  .home-page .popular-cars-title-box { font-size: 16px; }
  .home-page .vehicle-home-grid { gap: 10px; }
  .home-page .vehicle-home-card-image { height: 145px; }
  .home-page .vehicle-home-image-watermark { top: 9px; right: 9px; width: 42px; height: 42px; }
  .home-page .vehicle-home-card-top { padding-top: 8px; }
  .home-page .vehicle-home-card-top strong { font-size: 12px; }
}
@media (max-width: 480px) {
  .home-page .popular-cars-title-box { font-size: 15px; }
  .home-page .vehicle-home-grid { gap: 8px; }
  .home-page .vehicle-home-card-image { height: 112px; }
  .home-page .vehicle-home-image-watermark { top: 7px; right: 7px; width: 34px; height: 34px; }
  .home-page .vehicle-home-card-top { padding-top: 6px; }
  .home-page .vehicle-home-card-top strong { font-size: 11px; }
}
`;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://al-waha-parts.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Al Waha Parts | Car Parts in Al Jubail, Saudi Arabia', template: '%s | Al Waha Parts' },
  description: 'Buy quality car parts in Al Jubail, Saudi Arabia. Find brakes, suspension, filters, wheels and replacement parts with vehicle fitment support.',
  keywords: ['car parts Al Jubail', 'auto parts Saudi Arabia', 'car spare parts Jubail', 'automotive parts Saudi Arabia', 'brakes and suspension Jubail', 'vehicle fitment Saudi Arabia'],
  applicationName: 'Al Waha Parts', authors: [{ name: 'Al Waha Parts' }], creator: 'Al Waha Parts', publisher: 'Al Waha Parts',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_SA', url: siteUrl, siteName: 'Al Waha Parts', title: 'Al Waha Parts | Car Parts in Al Jubail, Saudi Arabia', description: 'Shop car parts and replacement parts in Al Jubail, Saudi Arabia with live catalog and vehicle fitment support.', images: [{ url: '/logo.png', width: 112, height: 54, alt: 'Al Waha Parts' }] },
  twitter: { card: 'summary', title: 'Al Waha Parts | Car Parts in Al Jubail, Saudi Arabia', description: 'Quality automotive parts and vehicle fitment support in Al Jubail, Saudi Arabia.', images: ['/logo.png'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  other: { 'geo.region': 'SA-04', 'geo.placename': 'Al Jubail, Eastern Province, Saudi Arabia', ICBM: '27.0046, 49.6460' },
};

const localBusinessSchema = {
  '@context': 'https://schema.org', '@type': 'AutoPartsStore', '@id': `${siteUrl}/#business`, name: 'Al Waha Parts', url: siteUrl, logo: `${siteUrl}/logo.png`, image: `${siteUrl}/logo.png`,
  description: 'Automotive parts seller and vehicle fitment support in Al Jubail, Saudi Arabia.',
  address: { '@type': 'PostalAddress', addressLocality: 'Al Jubail', addressRegion: 'Eastern Province', addressCountry: 'SA' },
  areaServed: [{ '@type': 'City', name: 'Al Jubail' }, { '@type': 'Country', name: 'Saudi Arabia' }], priceRange: '$$', knowsLanguage: ['en', 'ar'], sameAs: [siteUrl],
};
const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Al Waha Parts', url: siteUrl, description: 'Car parts and vehicle fitment support in Al Jubail, Saudi Arabia.', publisher: { '@id': `${siteUrl}/#business` }, inLanguage: ['en-SA', 'ar-SA'] };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{globalStyles}</style>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, websiteSchema]) }} />
      <LanguageProvider>
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
        <CookieConsentManager />
      </LanguageProvider>
      </body>
    </html>
  );
}
