'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatAed } from '../../../packages/shared/src/currency';
import { useCart } from './CartProvider';

export interface PartCardData {
  id: string;
  slug?: string | null;
  part_name: string;
  brand_name?: string | null;
  sku: string;
  price: number;
  sale_price?: number | null;
  condition?: string;
  tested_status?: string;
  stock_quantity?: number;
  primary_image_url?: string | null;
  image_urls?: string[] | null;
}

export function PartCard({ part }: { part: PartCardData }) {
  const router = useRouter();
  const { addItem } = useCart();
  const outOfStock = part.stock_quantity === 0;

  function startBooking() {
    if (outOfStock) return;
    addItem({
      part_id: part.id,
      part_name: part.part_name,
      sku: part.sku,
      unit_price: part.sale_price ?? part.price,
      image_url: part.primary_image_url ?? part.image_urls?.[0],
      stock_quantity: part.stock_quantity,
      condition: part.condition,
    });
    router.push('/booking');
  }

  return (
    <article className="part-card">
      <Link className="part-card-media" href={`/catalog/${part.slug ?? part.id}`} aria-label={`View ${part.part_name}`}>
        <span className="part-tag">{part.condition ?? 'New'}</span>
        {part.primary_image_url || part.image_urls?.[0] ? (
          <img src={part.primary_image_url ?? part.image_urls?.[0]} alt={part.part_name} className="part-card-image" />
        ) : (
          <div className="part-glyph">AWP</div>
        )}
      </Link>
      <div className="part-card-body">
        <div className="eyebrow">{part.brand_name || 'Al Waha Select'} · {part.sku}</div>
        <h3><Link href={`/catalog/${part.slug ?? part.id}`}>{part.part_name}</Link></h3>
        <div className="part-meta">
          <span>{part.tested_status === 'tested' ? 'Tested' : 'Verified fit'}</span>
          <span>{part.stock_quantity ? `${part.stock_quantity} in stock` : 'Available to order'}</span>
        </div>
        <div className="part-price">
          <strong>{formatAed(part.sale_price ?? part.price)}</strong>
          {part.sale_price && <del>{formatAed(part.price)}</del>}
        </div>
        <button className="button part-booking-button" type="button" disabled={outOfStock} onClick={startBooking}>
          {outOfStock ? 'Out of stock' : 'Booking now'}
        </button>
      </div>
    </article>
  );
}
