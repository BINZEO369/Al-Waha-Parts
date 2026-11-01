import { ProductPage } from '../../../components/pages/product/ProductPage';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductPage params={params} />;
}
