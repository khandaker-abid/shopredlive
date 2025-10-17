import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';

export default function HomePage() {
  return (
    <div>
      <Header />
      <div style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'flex-start' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}


