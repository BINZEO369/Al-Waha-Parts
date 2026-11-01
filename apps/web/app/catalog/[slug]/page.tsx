'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { formatAed } from '../../../../../packages/shared/src/currency';
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
            font-family: Montserrat, sans-serif;
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
            font-family: Montserrat, sans-serif;
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
            font-family: Montserrat, sans-serif;
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
            font-family: Montserrat, sans-serif;
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
          font-family: Montserrat, sans-serif;
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
          font-family: Montserrat, sans-serif;
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

      <Link className="product-back" href="/category">
        ← Back to catalog
      </Link>
      <div className="product-grid">
        <section>
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
          <span className="eyebrow">
            {product.parts_categories?.category_name ?? 'Al Waha Parts'} / {product.sku}
          </span>
          <h1>{product.part_name}</h1>
          <p className="product-description">
            {product.description ??
              'Verified automotive replacement part. Our parts desk confirms fitment before booking.'}
          </p>
          <div className="product-price">
            <strong>{formatAed(currentPrice)}</strong>
            {product.sale_price && <del>{formatAed(product.price)}</del>}
          </div>
          <div className="product-status">
            <span>{product.tested_status === 'tested' ? 'Tested' : 'Fitment checked'}</span>
            <span>
              {product.stock_quantity ? `${product.stock_quantity} in stock` : 'Available to order'}
            </span>
          </div>
          <button className="button product-booking-button" type="button" disabled={outOfStock} onClick={startBooking}>
            {outOfStock ? 'Out of stock' : 'Booking now'} <span>↗</span>
          </button>
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
