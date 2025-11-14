'use client';
import ProductCard from './ProductCard';
import { useSearchParams } from 'next/navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const q = (searchParams.get('q') || '').toLowerCase();
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure data is an array
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if API fails
        const MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
          id: String(i + 1),
          name: `Item ${i + 1}`,
          price: (10 + i * 3).toFixed(2),
          category: ['Electronics', 'Books', 'Furniture', 'Clothing'][i % 4],
          condition: ['new', 'like_new', 'good', 'fair', 'poor'][i % 5],
          description: `Sample item ${i + 1} for sale`,
          status: 'active',
          negotiable: true,
          allowsMeetup: true,
          allowsShipping: false,
          views: Math.floor(Math.random() * 100),
          seller: { name: 'Seller User' },
          images: []
        }));
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Ensure products is always an array before filtering
  const filtered = Array.isArray(products) ? products.filter(p => {
    const matchesQ = !q || (p.name && p.name.toLowerCase().includes(q));
    const matchesCat = !category || (p.category && ((typeof p.category === 'object' && p.category.name === category) || p.category === category));
    return matchesQ && matchesCat;
  }) : [];

  if (loading) {
    return (
      <Container sx={{ py: 3, textAlign: 'center' }}>
        <div>Loading products...</div>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {filtered.map((p, i) => (
          <Grid
            key={i}
            xs={6}
            sm={6}
            md={4}
            lg={2.4}
            sx={{
              flex: '0 0 auto',
              width: { lg: '20%' } // 5 items per row on large screens
            }}
          >
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}


