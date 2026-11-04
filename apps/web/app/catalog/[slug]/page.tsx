'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { formatSar } from '../../../../../packages/shared/src/currency';
import { useCart } from '../../../components/CartProvider';

type VehicleFitment = {
  id: string;
  manufacturer_name: string;
  model_name: string;
  year_start?: number | null;
  year_end?: number | null;
  generation?: string | null;
  chassis_code?: string | null;
};

type Product = {
  id: string;
  slug?: string | null;
  part_name: string;
  brand_name?: string | null;
  sku: string;
  oem_number?: string | null;
  description?: string | null;
  condition?: string | null;
  tested_status?: string | null;
  price: number;
  sale_price?: number | null;
  stock_quantity?: number | null;
  warranty_months?: number | null;
  primary_image_url?: string | null;
  image_urls?: string[] | null;
  parts_categories?: { category_name?: string | null; slug?: string | null } | null;
  part_vehicles?: Array<{ vehicles?: VehicleFitment | null }>;
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { addItem } = useCart();

  useEffect(() => {
    if (!apiUrl) {
      setError('Catalog API is not configured.');
      return;
    }
    apiFetch<Product>(apiUrl, `/api/v1/parts/slug/${encodeURIComponent(slug)}`)
      .then((item: Product) => {
        setProduct(item);
        setActiveImage(item.primary_image_url ?? item.image_urls?.[0] ?? '');
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Product not found.'),
      );
  }, [apiUrl, slug]);

  if (error) {
    return (
      <main className="product-page">
        <style jsx global>{`
          .product-page {
            max-width: 1200px;
            padding: 55px 18px 90px;
            margin: 0 auto;
          }
          .product-back {
            display: inline-block;
            margin-bottom: 28px;
            color: #777;
            font-size: 12px;
          }
          .product-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
            gap: 7vw;
            align-items: start;
          }
          .product-image {
            min-height: 520px;
            display: grid;
            place-items: center;
            overflow: hidden;
            background: #f3f3f3;
          }
          .product-image img {
            width: 100%;
            height: 520px;
            object-fit: cover;
          }
          .product-thumbnails {
            display: flex;
            gap: 10px;
            margin-top: 12px;
          }
          .product-thumbnail {
            width: 72px;
            height: 72px;
            padding: 0;
            border: 2px solid transparent;
            background: #fff;
            cursor: pointer;
          }
          .product-thumbnail.product-active {
            border-color: var(--red);
          }
          .product-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .product-copy h1 {
            margin: 15px 0 18px;
            font-family: 'Montserrat';
            font-size: clamp(38px, 5vw, 66px);
            line-height: 1;
            letter-spacing: -0.06em;
          }
          .product-description {
            max-width: 540px;
            color: #777;
            line-height: 1.75;
          }
          .product-price {
            display: flex;
            gap: 14px;
            align-items: center;
            margin: 28px 0 16px;
          }
          .product-price strong {
            font-size: 27px;
          }
          .product-price del {
            color: #999;
          }
          .product-status {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e9e9e9;
            border-bottom: 1px solid #e9e9e9;
            padding: 14px 0;
            margin-bottom: 24px;
            color: #777;
            font-size: 11px;
          }
          .product-specs {
            margin: 42px 0 0;
            border-top: 1px solid #e9e9e9;
          }
          .product-specs div {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e9e9e9;
          }
          .product-specs dt {
            color: #777;
            font-size: 10px;
            text-transform: uppercase;
          }
          .product-specs dd {
            margin: 0;
            text-align: right;
          }
          .product-fitment {
            display: grid;
            grid-template-columns: 0.8fr 1.2fr;
            gap: 8vw;
            margin-top: 90px;
            padding: 52px 0;
            border-top: 1px solid #e9e9e9;
          }
          .product-fitment h2 {
            margin: 12px 0 0;
            font-family: 'Montserrat';
            font-size: 36px;
            line-height: 1.05;
          }
          .product-fitmentList {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-fitmentList div {
            padding: 18px;
            border: 1px solid #e9e9e9;
            background: #fff;
          }
          .product-fitmentList strong,
          .product-fitmentList span {
            display: block;
          }
          .product-fitmentList span {
            margin-top: 7px;
            color: #777;
            font-size: 10px;
          }
          @media (max-width: 800px) {
            .product-page {
              padding: 50px 18px 75px;
            }
            .product-grid,
            .product-fitment {
              grid-template-columns: 1fr;
            }
            .product-image,
            .product-image img {
              min-height: 330px;
              height: 330px;
            }
            .product-fitment {
              margin-top: 65px;
            }
          }
        `}</style>
        <div className="data-alert">
          {error}
          <br />
          <Link className="text-link" href="/category">
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="product-page">
        <style jsx global>{`
          .product-page {
            max-width: 1200px;
            padding: 55px 18px 90px;
            margin: 0 auto;
          }
          .product-back {
            display: inline-block;
            margin-bottom: 28px;
            color: #777;
            font-size: 12px;
          }
          .product-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
            gap: 7vw;
            align-items: start;
          }
          .product-image {
            min-height: 520px;
            display: grid;
            place-items: center;
            overflow: hidden;
            background: #f3f3f3;
          }
          .product-image img {
            width: 100%;
            height: 520px;
            object-fit: cover;
          }
          .product-thumbnails {
            display: flex;
            gap: 10px;
            margin-top: 12px;
          }
          .product-thumbnail {
            width: 72px;
            height: 72px;
            padding: 0;
            border: 2px solid transparent;
            background: #fff;
            cursor: pointer;
          }
          .product-thumbnail.product-active {
            border-color: var(--red);
          }
          .product-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .product-copy h1 {
            margin: 15px 0 18px;
            font-family: 'Montserrat';
            font-size: clamp(38px, 5vw, 66px);
            line-height: 1;
            letter-spacing: -0.06em;
          }
          .product-description {
            max-width: 540px;
            color: #777;
            line-height: 1.75;
          }
          .product-price {
            display: flex;
            gap: 14px;
            align-items: center;
            margin: 28px 0 16px;
          }
          .product-price strong {
            font-size: 27px;
          }
          .product-price del {
            color: #999;
          }
          .product-status {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #e9e9e9;
            border-bottom: 1px solid #e9e9e9;
            padding: 14px 0;
            margin-bottom: 24px;
            color: #777;
            font-size: 11px;
          }
          .product-specs {
            margin: 42px 0 0;
            border-top: 1px solid #e9e9e9;
          }
          .product-specs div {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e9e9e9;
          }
          .product-specs dt {
            color: #777;
            font-size: 10px;
            text-transform: uppercase;
          }
          .product-specs dd {
            margin: 0;
            text-align: right;
          }
          .product-fitment {
            display: grid;
            grid-template-columns: 0.8fr 1.2fr;
            gap: 8vw;
            margin-top: 90px;
            padding: 52px 0;
            border-top: 1px solid #e9e9e9;
          }
          .product-fitment h2 {
            margin: 12px 0 0;
            font-family: 'Montserrat';
            font-size: 36px;
            line-height: 1.05;
          }
          .product-fitmentList {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .product-fitmentList div {
            padding: 18px;
            border: 1px solid #e9e9e9;
            background: #fff;
          }
          .product-fitmentList strong,
          .product-fitmentList span {
            display: block;
          }
          .product-fitmentList span {
            margin-top: 7px;
            color: #777;
            font-size: 10px;
          }
          @media (max-width: 800px) {
            .product-page {
              padding: 50px 18px 75px;
            }
            .product-grid,
            .product-fitment {
              grid-template-columns: 1fr;
            }
            .product-image,
            .product-image img {
              min-height: 330px;
              height: 330px;
            }
            .product-fitment {
              margin-top: 65px;
            }
          }
        `}</style>
        <div className="empty-state">Loading product details…</div>
      </main>
    );
  }

  const images = [
    ...new Set([product.primary_image_url, ...(product.image_urls ?? [])].filter(Boolean)),
  ] as string[];
  const vehicles = (product.part_vehicles ?? [])
    .map((item) => item.vehicles)
    .filter(Boolean) as VehicleFitment[];
  const currentPrice = product.sale_price ?? product.price;
  const outOfStock = product.stock_quantity === 0;

  function startBooking() {
    if (!product || outOfStock) return;
    addItem({
      part_id: product.id,
      part_name: product.part_name,
      sku: product.sku,
      unit_price: currentPrice,
      image_url: product.primary_image_url ?? product.image_urls?.[0],
      stock_quantity: product.stock_quantity,
      condition: product.condition,
    });
    router.push('/booking');
  }

  return (
    <main className="product-page product-reference-page">
      <style jsx global>{`
        .product-page {
          max-width: 1200px;
          padding: 55px 18px 90px;
          margin: 0 auto;
        }
        .product-back {
          display: inline-block;
          margin-bottom: 28px;
          color: #777;
          font-size: 12px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: 7vw;
          align-items: start;
        }
        .product-image {
          min-height: 520px;
          display: grid;
          place-items: center;
          overflow: hidden;
          background: #f3f3f3;
        }
        .product-image img {
          width: 100%;
          height: 520px;
          object-fit: cover;
        }
        .product-thumbnails {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        .product-thumbnail {
          width: 72px;
          height: 72px;
          padding: 0;
          border: 2px solid transparent;
          background: #fff;
          cursor: pointer;
        }
        .product-thumbnail.product-active {
          border-color: var(--red);
        }
        .product-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-copy h1 {
          margin: 15px 0 18px;
          font-family: 'Montserrat';
          font-size: clamp(38px, 5vw, 66px);
          line-height: 1;
          letter-spacing: -0.06em;
        }
        .product-description {
          max-width: 540px;
          color: #777;
          line-height: 1.75;
        }
        .product-price {
          display: flex;
          gap: 14px;
          align-items: center;
          margin: 28px 0 16px;
        }
        .product-price strong {
          font-size: 27px;
        }
        .product-price del {
          color: #999;
        }
        .product-status {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #e9e9e9;
          border-bottom: 1px solid #e9e9e9;
          padding: 14px 0;
          margin-bottom: 24px;
          color: #777;
          font-size: 11px;
        }
        .product-specs {
          margin: 42px 0 0;
          border-top: 1px solid #e9e9e9;
        }
        .product-specs div {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 0;
          border-bottom: 1px solid #e9e9e9;
        }
        .product-specs dt {
          color: #777;
          font-size: 10px;
          text-transform: uppercase;
        }
        .product-specs dd {
          margin: 0;
          text-align: right;
        }
        .product-fitment {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 8vw;
          margin-top: 90px;
          padding: 52px 0;
          border-top: 1px solid #e9e9e9;
        }
        .product-fitment h2 {
          margin: 12px 0 0;
          font-family: 'Montserrat';
          font-size: 36px;
          line-height: 1.05;
        }
        .product-fitmentList {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .product-fitmentList div {
          padding: 18px;
          border: 1px solid #e9e9e9;
          background: #fff;
        }
        .product-fitmentList strong,
        .product-fitmentList span {
          display: block;
        }
        .product-fitmentList span {
          margin-top: 7px;
          color: #777;
          font-size: 10px;
        }
        @media (max-width: 800px) {
          .product-page {
            padding: 50px 18px 75px;
          }
          .product-grid,
          .product-fitment {
            grid-template-columns: 1fr;
          }
          .product-image,
          .product-image img {
            min-height: 330px;
            height: 330px;
          }
          .product-fitment {
            margin-top: 65px;
          }
        }
        .product-reference-page { max-width: 1080px; padding-top: 38px; background: #f8f9fb; }
        .product-breadcrumb { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 26px; color: #777; font-size: 18px; }
        .product-reference-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
        .product-reference-heading h1 { margin: 0 0 20px; color: #202124; font-size: clamp(40px, 5vw, 62px); font-weight: 800; line-height: 1; letter-spacing: -.055em; }
        .product-sku-badge { padding: 17px 32px; border: 3px solid #292929; border-radius: 18px; color: #292929; font-size: 28px; white-space: nowrap; }
        .product-genuine { display: inline-flex; align-items: center; gap: 10px; padding: 7px 18px; border: 1px solid #ddd; border-radius: 14px; background: #fff; font-size: 22px; }
        .product-genuine b { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; background: #2166d1; color: #fff; }
        .product-vehicle-bar { display: none; }
        .product-grid { display: block; }
        .product-reference-media { position: relative; }
        .product-image { min-height: 560px; background: #f2f3f5; }
        .product-image img { height: 560px; object-fit: contain; }
        .product-media-control, .product-favorite { position: absolute; z-index: 2; top: 30px; display: grid; width: 74px; height: 74px; place-items: center; border: 1px solid #ddd; border-radius: 50%; background: #fff; color: #444; font-size: 30px; }
        .product-media-control { left: 28px; }
        .product-favorite { right: 28px; font-size: 42px; }
        .product-copy { padding: 54px 16px 0; }
        .product-copy h1, .product-copy > .product-status, .product-copy > .product-specs { display: none; }
        .product-description { display: none; }
        .product-price { margin: 0 0 26px; gap: 18px; }
        .product-price strong { color: #202124; font-size: 54px; font-weight: 800; }
        .product-price span { color: #777; font-size: 24px; }
        .product-installment { position: relative; padding: 28px 30px; margin-bottom: 26px; border: 2px solid #e2e2e2; border-radius: 28px; background: #fff; }
        .product-installment p { margin: 0 0 16px; color: #777; font-size: 24px; }
        .product-installment strong { font-size: 30px; }
        .product-installment small { color: #777; font-size: 20px; font-weight: 500; }
        .product-installment > span { position: absolute; right: 28px; bottom: 34px; color: #6040a8; font-size: 18px; font-weight: 700; }
        .product-delivery { display: flex; align-items: center; gap: 12px; margin: 20px 0; font-size: 24px; }
        .product-stock { margin-left: 18px; color: #239955; }
        .product-fitment-ok { padding: 17px 22px; margin: 28px 0 18px; border-radius: 10px; background: #edfff4; color: #257d50; font-size: 20px; font-weight: 600; }
        .product-booking-button { width: 100%; min-height: 72px; border-radius: 22px; background: #f3444a; font-size: 24px; }
        .product-benefits { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 34px 0; color: #292929; font-size: 16px; line-height: 1.35; }
        .product-seller { display: flex; align-items: center; gap: 16px; padding: 22px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; font-size: 18px; }
        .product-seller span { color: #777; }
        .product-details-copy { padding: 42px 0 0; }
        .product-details-copy h2 { margin: 0 0 22px; font-size: 28px; }
        .product-details-copy p { margin: 0; color: #444; font-size: 22px; line-height: 1.65; }
        @media (max-width: 800px) {
          .product-reference-page { padding: 18px 0 50px; }
          .product-breadcrumb, .product-reference-heading { padding-left: 32px; padding-right: 32px; }
          .product-breadcrumb { margin-bottom: 18px; font-size: 15px; }
          .product-reference-heading { align-items: flex-start; margin-bottom: 0; }
          .product-reference-heading h1 { font-size: 31px; margin-bottom: 14px; }
          .product-sku-badge { padding: 10px 14px; border-width: 2px; border-radius: 12px; font-size: 17px; }
          .product-genuine { padding: 5px 12px; font-size: 16px; }
          .product-genuine b { width: 22px; height: 22px; }
          .product-vehicle-bar { display: flex; align-items: center; gap: 14px; min-height: 86px; padding: 14px 32px; margin-top: 22px; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; background: #fff; font-size: 20px; }
          .product-vehicle-mark { display: grid; width: 64px; height: 48px; place-items: center; border-radius: 12px; background: #f2f2f2; font-size: 16px; }
          .product-vehicle-edit { margin-left: auto; font-size: 28px; }
          .product-image, .product-image img { min-height: 280px; height: 280px; }
          .product-media-control, .product-favorite { top: 18px; width: 56px; height: 56px; font-size: 22px; }
          .product-media-control { left: 26px; }
          .product-favorite { right: 26px; font-size: 32px; }
          .product-copy { padding: 40px 32px 0; }
          .product-price strong { font-size: 42px; }
          .product-price span { font-size: 18px; }
          .product-installment { padding: 22px 24px; border-radius: 24px; }
          .product-installment p { max-width: 250px; font-size: 19px; line-height: 1.45; }
          .product-installment strong { font-size: 25px; }
          .product-installment > span { right: 20px; bottom: 30px; font-size: 13px; }
          .product-delivery { font-size: 20px; }
          .product-fitment-ok { font-size: 17px; }
          .product-booking-button { min-height: 64px; font-size: 22px; }
          .product-benefits { gap: 8px; font-size: 13px; }
          .product-seller { font-size: 15px; }
          .product-details-copy p { font-size: 19px; }
        }
      `}</style>

      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/category">Part sections</Link><span>/</span>
        <Link href={product.parts_categories?.slug ? `/category/${product.parts_categories.slug}` : '/category'}>{product.parts_categories?.category_name ?? 'Parts'}</Link>
      </nav>
      <header className="product-reference-heading">
        <div>
          <h1>{product.part_name}</h1>
          <span className="product-genuine"><b>✓</b> Genuine</span>
        </div>
        <span className="product-sku-badge">#{product.oem_number ?? product.sku}</span>
      </header>
      {vehicles[0] && (
        <Link className="product-vehicle-bar" href={vehicles[0].id ? `/vehicles/${vehicles[0].id}` : '/vehicles'}>
          <span className="product-vehicle-mark">{vehicles[0].manufacturer_name.slice(0, 2).toUpperCase()}</span>
          <strong>{vehicles[0].manufacturer_name} {vehicles[0].model_name} {vehicles[0].year_start ?? ''}</strong>
          <span className="product-vehicle-edit" aria-hidden="true">⌕</span>
        </Link>
      )}
      <div className="product-grid">
        <section className="product-reference-media">
          <button className="product-media-control" type="button" aria-label="Product options">◉</button>
          <button className="product-favorite" type="button" aria-label="Add to favourites">♡</button>
          <div className="product-image">
            {activeImage ? (
              <img src={activeImage} alt={product.part_name} />
            ) : (
              <span className="part-glyph">AWP</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-thumbnails">
              {images.map((image) => (
                <button
                  className={
                    activeImage === image ? 'product-thumbnail product-active' : 'product-thumbnail'
                  }
                  key={image}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="product-copy">
          <p className="product-description">
            {product.description ??
              'Verified automotive replacement part. Our parts desk confirms fitment before booking.'}
          </p>
          <div className="product-price">
            <strong>{formatSar(currentPrice)}</strong>
            {product.sale_price && <del>{formatSar(product.price)}</del>}
            <span>Incl. VAT</span>
          </div>
          <div className="product-installment"><p>Split it into 4 interest-free payments</p><strong>{formatSar(Math.ceil(currentPrice / 4))} <small>/ month</small></strong><span>tabby&nbsp;&nbsp; tamara&nbsp;&nbsp; MIS</span></div>
          <div className="product-delivery"><span>▣</span><strong>2–4 days</strong><span className="product-stock">● {outOfStock ? 'Out of stock' : 'In stock'}</span></div>
          {vehicles[0] && <div className="product-fitment-ok">✓ &nbsp; Fits your {vehicles[0].manufacturer_name} {vehicles[0].model_name} {vehicles[0].year_start ?? ''}</div>}
          <div className="product-status">
            <span>{product.tested_status === 'tested' ? 'Tested' : 'Fitment checked'}</span>
            <span>
              {product.stock_quantity ? `${product.stock_quantity} in stock` : 'Available to order'}
            </span>
          </div>
          <button className="button product-booking-button" type="button" disabled={outOfStock} onClick={startBooking}>
            {outOfStock ? 'Out of stock' : 'Add to cart'} <span>↗</span>
          </button>
          <div className="product-benefits"><span>♙ Secure<br />payment</span><span>ↄ 7-day<br />return</span><span>♧ Warranty</span><span>▣ Shipping to all<br />cities</span></div>
          <div className="product-seller"><strong>Al Waha Parts</strong><span>● Active seller · 10,000+ orders</span></div>
          <section className="product-details-copy"><h2>Details</h2><p>{product.description ?? 'Verified automotive replacement part. Our parts desk confirms fitment before booking.'}</p></section>
          <dl className="product-specs">
            <div>
              <dt>Brand</dt>
              <dd>{product.brand_name ?? 'Al Waha Select'}</dd>
            </div>
            <div>
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>OEM number</dt>
              <dd>{product.oem_number ?? 'On request'}</dd>
            </div>
            <div>
              <dt>Warranty</dt>
              <dd>
                {product.warranty_months
                  ? `${product.warranty_months} months`
                  : 'Confirm with desk'}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="product-fitment">
        <div>
          <span className="eyebrow">Compatibility</span>
          <h2>Built for the right match.</h2>
        </div>
        {vehicles.length ? (
          <div className="product-fitmentList">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <strong>
                  {vehicle.manufacturer_name} {vehicle.model_name}
                </strong>
                <span>
                  {vehicle.year_start ?? '—'}–{vehicle.year_end ?? '—'}{' '}
                  {vehicle.generation ? `· ${vehicle.generation}` : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>
            Send your vehicle details with the booking and our parts desk will verify fitment before
            confirmation.
          </p>
        )}
      </section>
    </main>
  );
}
