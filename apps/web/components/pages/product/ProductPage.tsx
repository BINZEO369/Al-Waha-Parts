'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { apiFetch } from '../../../../../packages/shared/src/api';
import { formatSar } from '../../../../../packages/shared/src/currency';
import styles from './ProductDetail.module.css';

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

export function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
      <main className={styles.page}>
        <div className="data-alert">
          {error}
          <br />
          <Link className="text-link" href="/catalog">
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }
  if (!product) {
    return (
      <main className={styles.page}>
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

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/catalog">
        ← Back to catalog
      </Link>
      <div className={styles.grid}>
        <section>
          <div className={styles.image}>
            {activeImage ? (
              <img src={activeImage} alt={product.part_name} />
            ) : (
              <span className="part-glyph">AWP</span>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((image) => (
                <button
                  className={
                    activeImage === image
                      ? `${styles.thumbnail} ${styles.active}`
                      : styles.thumbnail
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
        <section className={styles.copy}>
          <span className="eyebrow">
            {product.parts_categories?.category_name ?? 'Al Waha Parts'} / {product.sku}
          </span>
          <h1>{product.part_name}</h1>
          <p className={styles.description}>
            {product.description ??
              'Verified automotive replacement part. Our parts desk confirms fitment before booking.'}
          </p>
          <div className={styles.price}>
            <strong>{formatSar(currentPrice)}</strong>
            {product.sale_price && <del>{formatSar(product.price)}</del>}
          </div>
          <div className={styles.status}>
            <span>{product.tested_status === 'tested' ? 'Tested' : 'Fitment checked'}</span>
            <span>
              {product.stock_quantity ? `${product.stock_quantity} in stock` : 'Available to order'}
            </span>
          </div>
          <Link className="button" href={`/booking?part=${encodeURIComponent(product.sku)}`}>
            Book this part <span>↗</span>
          </Link>
          <dl className={styles.specs}>
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
      <section className={styles.fitment}>
        <div>
          <span className="eyebrow">Compatibility</span>
          <h2>Built for the right match.</h2>
        </div>
        {vehicles.length ? (
          <div className={styles.fitmentList}>
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
