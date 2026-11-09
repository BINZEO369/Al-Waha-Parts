import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ProductDetailView, type Product } from '../../../components/ProductDetailView';
import { canonicalUrl, cleanMetaText, fetchPublicData, safeJsonLd } from '../../../lib/public-seo';

type PageProps = { params: Promise<{ slug: string }> };

function productPath(slug: string) {
  return `/api/v1/parts/slug/${encodeURIComponent(slug)}`;
}

function descriptionFor(product: Product) {
  return cleanMetaText(product.description) ||
    `View ${product.part_name}${product.sku ? ` (SKU ${product.sku})` : ''}, current price and vehicle fitment details from Al Waha Parts in Al Jubail.`;
}

function absoluteImageUrl(image: string) {
  try {
    return new URL(image, canonicalUrl('/')).toString();
  } catch {
    return image;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchPublicData<Product>(productPath(slug));
  const name = product?.part_name || slug.replace(/-/g, ' ');
  const description = product ? descriptionFor(product) : `Product details and vehicle fitment for ${name} from Al Waha Parts.`;
  const canonicalSlug = product?.slug || product?.id || slug;
  const canonical = canonicalUrl(`/products/${encodeURIComponent(canonicalSlug)}`);
  const image = product?.primary_image_url || product?.image_urls?.[0];

  return {
    title: name,
    description,
    alternates: { canonical },
    ...(product === null ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'website',
      title: `${name} | Al Waha Parts`,
      description,
      url: canonical,
      ...(image ? { images: [{ url: absoluteImageUrl(image), alt: name }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${name} | Al Waha Parts`,
      description,
      ...(image ? { images: [absoluteImageUrl(image)] } : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchPublicData<Product>(productPath(slug));
  if (product === null) notFound();

  if (product?.slug && product.slug !== slug) {
    permanentRedirect(`/products/${encodeURIComponent(product.slug)}`);
  }

  const canonicalSlug = product?.slug || product?.id || slug;
  const productUrl = canonicalUrl(`/products/${encodeURIComponent(canonicalSlug)}`);
  const category = product?.parts_categories;
  const categoryPath = category?.slug ? `/category/${encodeURIComponent(category.slug)}` : null;
  const imageUrls = product
    ? [...new Set([product.primary_image_url, ...(product.image_urls ?? [])].filter((image): image is string => Boolean(image)))]
    : [];
  const currentPrice = Number(product?.sale_price ?? product?.price);

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl('/') },
    ...(categoryPath && category?.category_name
      ? [{ '@type': 'ListItem', position: 2, name: category.category_name, item: canonicalUrl(categoryPath) }]
      : []),
    { '@type': 'ListItem', position: categoryPath && category?.category_name ? 3 : 2, name: product?.part_name || 'Product', item: productUrl },
  ];

  const productSchema = product && imageUrls.length && Number.isFinite(currentPrice) && currentPrice > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.part_name,
        ...(product.description ? { description: cleanMetaText(product.description, 500) } : {}),
        image: imageUrls.map(absoluteImageUrl),
        ...(product.sku ? { sku: product.sku } : {}),
        ...(product.brand_name ? { brand: { '@type': 'Brand', name: product.brand_name } } : {}),
        ...(category?.category_name ? { category: category.category_name } : {}),
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'SAR',
          price: currentPrice.toFixed(2),
          ...(product.stock_quantity !== null && product.stock_quantity !== undefined
            ? { availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
            : {}),
        },
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems }) }}
      />
      {productSchema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }} />
      ) : null}
      <ProductDetailView slug={slug} initialProduct={product ?? null} />
    </>
  );
}
