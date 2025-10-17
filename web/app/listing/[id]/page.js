import Header from '../../../components/Header';
import ProductDetail from '../../../components/ProductDetail';

export default function ListingDetailPage({ params }) {
  return (
    <div>
      <Header />
      <div style={{ padding: 16 }}>
        <ProductDetail id={params.id} />
      </div>
    </div>
  );
}


