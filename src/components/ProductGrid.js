import ProductCard from './ProductCard';

const MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: `Item ${i + 1}`,
  price: (10 + i * 3).toFixed(2)
}));

export default function ProductGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {MOCK_PRODUCTS.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}


