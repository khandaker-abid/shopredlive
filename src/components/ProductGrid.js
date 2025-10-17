"use client";
import ProductCard from './ProductCard';
import { useSearchParams } from 'next/navigation';

const MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: `Item ${i + 1}`,
  price: (10 + i * 3).toFixed(2),
  category: ['Electronics', 'Books', 'Furniture', 'Clothing'][i % 4]
}));

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') || '').toLowerCase();
  const category = searchParams.get('category');
  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchesQ = !q || p.name.toLowerCase().includes(q);
    const matchesCat = !category || p.category === category;
    return matchesQ && matchesCat;
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {filtered.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}


