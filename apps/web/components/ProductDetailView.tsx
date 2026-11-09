'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../packages/shared/src/api';
import { formatSar } from '../../../packages/shared/src/currency';
import { useCart } from './CartProvider';
import { PageLoader } from './PageLoader';
import { OptimizedImage } from './OptimizedImage';

type VehicleFitment = {
  id: string;
  model_name: string;
  generation?: string | null;
  chassis_code?: string | null;
  slug?: string | null;
  year_start?: number | null;
  year_end?: number | null;
  manufacturers?: {
    id?: string;
    manufacturer_name?: string | null;
    slug?: string | null;
    logo_url?: string | null;
  } | null;
};
type PartFitment = {
  model_id: string;
  compatible_years?: number[] | null;
  vehicles?: VehicleFitment | null;
};

export type Product = {
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
  part_model_fitments?: PartFitment | PartFitment[] | null;
};

function formatCompatibleYears(fitment: PartFitment) {
  const years = [...new Set((fitment.compatible_years ?? []).map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
  if (years.length) return years.join(', ');
  const start = fitment.vehicles?.year_start;
  const end = fitment.vehicles?.year_end;
  if (start && end) return `${start}–${end}`;
  if (start || end) return String(start ?? end);
  return 'Year not specified';
}

export function ProductDetailView({ slug, initialProduct = null }: { slug: string; initialProduct?: Product | null }) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [activeImage, setActiveImage] = useState(initialProduct?.primary_image_url ?? initialProduct?.image_urls?.[0] ?? '');
  const [error, setError] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { addItem } = useCart();

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setActiveImage(initialProduct.primary_image_url ?? initialProduct.image_urls?.[0] ?? '');
      setError('');
      return;
    }
    if (!apiUrl) {
      setError('Product API is not configured.');
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
  }, [apiUrl, slug, initialProduct]);

  if (error) {
    return (
      <main className="product-page">
        <div className="data-alert">
          {error}
          <br />
          <Link className="text-link" href="/category">Back to categories</Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page">
        <PageLoader label="Loading product details" />
      </main>
    );
  }

  const images = [...new Set([product.primary_image_url, ...(product.image_urls ?? [])].filter(Boolean))] as string[];
  const rawFitments = product.part_model_fitments;
  const fitments = (Array.isArray(rawFitments) ? rawFitments : rawFitments ? [rawFitments] : []).filter((fitment) => Boolean(fitment.vehicles));
  
  const currentPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const outOfStock = product.stock_quantity === 0;

  function handleBooking() {
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

    setIsAdded(true);
    setTimeout(() => {
      router.push('/booking');
    }, 800);
  }

  return (
    <main className="product-page-wrapper">
      <style jsx>{`
        .product-page-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px 80px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #333;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .breadcrumbs a { color: #666; text-decoration: none; transition: color 0.2s; }
        .breadcrumbs a:hover { color: #111; }
        .breadcrumbs span { color: #999; }

        /* Layout */
        .product-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 900px) {
          .product-layout {
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: start;
          }
        }

        /* ---------------------------------
         * GALLERY / IMAGE FIX (NO ZOOM)
         * --------------------------------- */
        .gallery { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
          width: 100%;
        }
        
        .main-image {
          width: 100%;
          height: auto;
          min-height: 300px;
          max-height: 550px; /* সর্বোচ্চ উচ্চতা নির্ধারণ করা হয়েছে */
          background: #f8f9fa; 
          border-radius: 16px;
          border: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px; 
          overflow: hidden;
        }
        
        /* ইমেজকে জোর করে কন্টেইনারের ভেতরে ফিট করা হয়েছে */
        .main-image :global(img) {
          max-width: 100%;
          max-height: 100%;
          width: auto !important; 
          height: auto !important; 
          object-fit: contain !important; /* ছবি কাটা পড়বে না বা জুম হবে না */
          display: block;
        }

        .thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .thumbnails::-webkit-scrollbar { display: none; }
        .thumb-btn {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          border-radius: 10px;
          border: 2px solid transparent;
          background: #f8f9fa;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          padding: 2px;
        }
        .thumb-btn.active { 
          border-color: #111; 
          background: #fff;
        }
        .thumb-btn img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          border-radius: 6px;
        }

        /* Info Section */
        .info { display: flex; flex-direction: column; }
        
        .brand-category {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #2563eb;
          margin-bottom: 8px;
        }
        
        .title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
          margin: 0 0 16px 0;
        }
        @media (min-width: 768px) { .title { font-size: 36px; } }

        .meta-tags {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eaeaea;
        }
        .meta-tags strong { color: #111; }
        .badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        /* Price */
        .price-box {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 12px;
        }
        .price {
          font-size: 32px;
          font-weight: 800;
          color: #111;
        }
        .old-price {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
        }

        /* Stock */
        .stock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .stock.in { color: #10b981; }
        .stock.out { color: #ef4444; }
        .stock-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

        /* Actions */
        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          width: 100%;
        }
        .btn-book {
          background: #111;
          color: #fff;
        }
        .btn-book:hover:not(:disabled) { background: #333; }
        .btn-book.added { background: #10b981; }
        .btn:disabled { background: #eaeaea; color: #999; cursor: not-allowed; }

        /* Description */
        .description { margin-bottom: 32px; }
        .description h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #111; }
        .description p { font-size: 15px; line-height: 1.6; color: #555; white-space: pre-wrap; margin: 0; }

        /* Specs */
        .specs {
          border-top: 1px solid #eaeaea;
          margin-bottom: 40px;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eaeaea;
          font-size: 14px;
        }
        .spec-row span { color: #666; }
        .spec-row strong { color: #111; text-align: right; }

        /* Fitments */
        .fitments {
          grid-column: 1 / -1;
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eaeaea;
        }
        .fitments-header { margin-bottom: 24px; }
        .fitments-header h2 { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
        .fitments-header p { font-size: 15px; color: #666; margin: 0; }
        
        .fitment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .fitment-card {
          border: 1px solid #eaeaea;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .fitment-logo {
          width: 48px;
          height: 48px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          flex-shrink: 0;
        }
        .fitment-logo img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .fitment-info strong { display: block; font-size: 15px; color: #111; margin-bottom: 4px; }
        .fitment-info span { display: block; font-size: 12px; color: #666; }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .product-page-wrapper { padding: 16px 16px 60px; }
          .title { font-size: 24px; }
          .price { font-size: 28px; }
          
          .main-image { 
            max-height: 400px; /* মোবাইলে ছবি আরও কম জায়গা নেবে */
            padding: 12px;
            border-radius: 12px;
          }
          
          .thumb-btn {
            width: 60px;
            height: 60px;
          }
          
          .fitment-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        {product.parts_categories?.slug && product.parts_categories.category_name ? (
          <>
            <Link href={`/category/${encodeURIComponent(product.parts_categories.slug)}`}>
              {product.parts_categories.category_name}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span>{product.part_name}</span>
      </nav>

      <div className="product-layout">
        {/* Gallery */}
        <div className="gallery">
          <div className="main-image">
            {activeImage ? (
              <OptimizedImage src={activeImage} alt={product.part_name} width={1200} height={900} sizes="(max-width: 800px) 100vw, 50vw" loading="eager" fetchPriority="high" quality={80} />
            ) : (
              <span style={{ color: '#ccc', fontSize: '24px', fontWeight: 800 }}>AWP</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((image) => (
                <button
                  key={image}
                  className={`thumb-btn ${activeImage === image ? 'active' : ''}`}
                  onClick={() => setActiveImage(image)}
                >
                  <OptimizedImage src={image} alt="" width={76} height={76} sizes="76px" loading="lazy" quality={70} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="info">
          <div className="brand-category">
            {product.brand_name && <span>{product.brand_name}</span>}
            {product.brand_name && product.parts_categories && <span>•</span>}
            {product.parts_categories && <span>{product.parts_categories.category_name}</span>}
          </div>

          <h1 className="title">{product.part_name}</h1>

          <div className="meta-tags">
            {product.sku && <span>SKU: <strong>{product.sku}</strong></span>}
            {product.tested_status === 'tested' && <span className="badge">Tested</span>}
            {product.condition && <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>{product.condition}</span>}
          </div>

          <div className="price-box">
            <span className="price">{formatSar(currentPrice)}</span>
            {hasDiscount && <span className="old-price">{formatSar(product.price)}</span>}
          </div>

          <div className={`stock ${outOfStock ? 'out' : 'in'}`}>
            <span className="stock-dot"></span>
            {outOfStock ? 'Out of Stock' : `In Stock (${product.stock_quantity} available)`}
          </div>

          <div className="actions">
            <button 
              className={`btn btn-book ${isAdded ? 'added' : ''}`} 
              type="button" 
              disabled={outOfStock} 
              onClick={handleBooking}
            >
              {outOfStock ? 'Out of stock' : isAdded ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Added! Redirecting...
                </>
              ) : (
                'Book Now'
              )}
            </button>
          </div>

          <div className="description">
            <h3>Product Details</h3>
            <p>{product.description ?? 'Verified automotive replacement part. Our parts desk confirms fitment before booking.'}</p>
          </div>

          <div className="specs">
            <div className="spec-row"><span>Brand</span><strong>{product.brand_name ?? 'Al Waha Select'}</strong></div>
            <div className="spec-row"><span>OEM Number</span><strong>{product.oem_number ?? 'On request'}</strong></div>
            <div className="spec-row"><span>Warranty</span><strong>{product.warranty_months ? `${product.warranty_months} months` : 'Confirm with desk'}</strong></div>
          </div>
        </div>

        {/* Fitments (Full width inside grid) */}
        <div className="fitments">
          <div className="fitments-header">
            <h2>Compatible Vehicles</h2>
            <p>This product is verified for the following vehicles.</p>
          </div>
          {fitments.length ? (
            <div className="fitment-grid">
              {fitments.map((fitment) => {
                const vehicle = fitment.vehicles!;
                const brandName = vehicle.manufacturers?.manufacturer_name ?? 'Vehicle';
                const logoUrl = vehicle.manufacturers?.logo_url;
                return (
                  <div key={fitment.model_id} className="fitment-card">
                    <div className="fitment-logo">
                      {logoUrl ? <img src={logoUrl} alt={brandName} /> : <span style={{ fontSize: 12, fontWeight: 'bold' }}>{brandName.slice(0, 2)}</span>}
                    </div>
                    <div className="fitment-info">
                      <strong>{brandName} {vehicle.model_name}</strong>
                      <span>
                        {formatCompatibleYears(fitment)}
                        {vehicle.generation ? ` · ${vehicle.generation}` : ''}
                        {vehicle.chassis_code ? ` · ${vehicle.chassis_code}` : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#666' }}>Send your vehicle details with the booking and our parts desk will verify fitment.</p>
          )}
        </div>
      </div>
    </main>
  );
}
