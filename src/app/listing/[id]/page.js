'use client';
import Header from '../../../components/Header';
import ProductDetail from '../../../components/ProductDetail';
import { useParams } from 'next/navigation';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <Header />
      <div style={{ padding: 16 }}>
        <ProductDetail id={id} />
      </div>
    </div>
  );
}


