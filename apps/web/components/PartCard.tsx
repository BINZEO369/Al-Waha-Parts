'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
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
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const outOfStock = part.stock_quantity === 0;

  function handleAddToCart() {
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

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }

  return (
    <article className="part-card">
      <style jsx>{`
        .part-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
          height: 100%;
          min-width: 0; /* Prevents grid blowout */
        }

        .part-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          border-color: #ddd;
        }

        .part-card-media {
          display: block;
          position: relative;
          aspect-ratio: 4 / 3;
          background: #f8f9fa;
          overflow: hidden;
        }

        .part-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .part-card:hover .part-card-image {
          transform: scale(1.05);
        }

        .part-glyph {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          color: #ccc;
        }

        .part-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          color: #111;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .part-card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .eyebrow {
          font-size: 11px;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .part-card h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          color: #111;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 44px;
          word-break: break-word;
        }

        .part-card h3 a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;
        }

        .part-card h3 a:hover {
          color: #2563eb;
        }

        .part-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #666;
          margin-bottom: 16px;
        }

        .part-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .part-meta span::before {
          content: "•";
          color: #ccc;
        }
        
        .part-meta span:first-child::before {
          display: none;
        }

        .part-price {
          margin-top: auto;
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 16px;
        }

        .part-price strong {
          font-size: 22px;
          font-weight: 800;
          color: #111;
        }

        .part-price del {
          font-size: 14px;
          color: #999;
          font-weight: 500;
        }

        .part-booking-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .part-booking-button:hover:not(:disabled) {
          background: #333;
        }

        .part-booking-button:disabled {
          background: #eaeaea;
          color: #999;
          cursor: not-allowed;
        }

        .part-booking-button.added {
          background: #10b981;
          color: #fff;
        }

        .part-booking-button svg {
          width: 18px;
          height: 18px;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 767px) {
          .part-card {
            border-radius: 12px;
          }
          .part-card-body {
            padding: 8px; /* Reduced padding to fit 2 columns */
          }
          .eyebrow {
            font-size: 8px;
            margin-bottom: 4px;
          }
          .part-card h3 {
            font-size: 12px;
            line-height: 1.3;
            min-height: 32px;
            margin-bottom: 6px;
          }
          .part-meta {
            font-size: 9px;
            margin-bottom: 8px;
            gap: 3px;
            flex-wrap: wrap;
          }
          .part-price {
            margin-bottom: 8px;
            gap: 4px;
            flex-wrap: wrap;
          }
          .part-price strong {
            font-size: 15px;
          }
          .part-price del {
            font-size: 10px;
          }
          .part-booking-button {
            padding: 6px;
            font-size: 11px;
            border-radius: 6px;
            gap: 4px;
          }
          .part-booking-button svg {
            width: 12px;
            height: 12px;
          }
          .part-tag {
            top: 6px;
            left: 6px;
            font-size: 8px;
            padding: 2px 6px;
          }
        }
      `}</style>

      <Link className="part-card-media" href={`/category/${part.slug ?? part.id}`} aria-label={`View ${part.part_name}`}>
        <span className="part-tag">{part.condition ?? 'New'}</span>
        {part.primary_image_url || part.image_urls?.[0] ? (
          <img src={part.primary_image_url ?? part.image_urls?.[0]} alt={part.part_name} className="part-card-image" />
        ) : (
          <div className="part-glyph">AWP</div>
        )}
      </Link>
      
      <div className="part-card-body">
        <div className="eyebrow">{part.brand_name || 'Al Waha Select'} · {part.sku}</div>
        
        <h3>
          <Link href={`/category/${part.slug ?? part.id}`}>{part.part_name}</Link>
        </h3>
        
        <div className="part-meta">
          <span>{part.tested_status === 'tested' ? 'Tested' : 'Verified fit'}</span>
          <span>{part.stock_quantity ? `${part.stock_quantity} in stock` : 'Available to order'}</span>
        </div>
        
        <div className="part-price">
          <strong>{formatSar(part.sale_price ?? part.price)}</strong>
          {part.sale_price && <del>{formatSar(part.price)}</del>}
        </div>
        
        <button 
          className={`part-booking-button ${isAdded ? 'added' : ''}`} 
          type="button" 
          disabled={outOfStock} 
          onClick={handleAddToCart}
        >
          {outOfStock ? (
            'Out of stock'
          ) : isAdded ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Added
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
