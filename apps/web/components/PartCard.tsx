import Link from 'next/link';

export interface PartCardData {
  id: string;
  part_name: string;
  brand_name?: string | null;
  sku: string;
  price: number;
  sale_price?: number | null;
  condition?: string;
  tested_status?: string;
  stock_quantity?: number;
}

export function PartCard({ part }: { part: PartCardData }) {
  return (
    <article className="part-card">
      <div className="part-card-media">
        <span className="part-tag">{part.condition ?? 'New'}</span>
        <div className="part-glyph">AWP</div>
      </div>
      <div className="part-card-body">
        <div className="eyebrow">
          {part.brand_name || 'Al Waha Select'} · {part.sku}
        </div>
        <h3>{part.part_name}</h3>
        <div className="part-meta">
          <span>{part.tested_status === 'tested' ? 'Tested' : 'Verified fit'}</span>
          <span>
            {part.stock_quantity ? `${part.stock_quantity} in stock` : 'Available to order'}
          </span>
        </div>
        <div className="part-price">
          <strong>{part.sale_price ?? part.price} AED</strong>
          {part.sale_price && <del>{part.price} AED</del>}
          <Link href={`/booking?part=${part.id}`}>Request</Link>
        </div>
      </div>
    </article>
  );
}
