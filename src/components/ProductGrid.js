'use client';
import ProductCard from './ProductCard';
import { useSearchParams } from 'next/navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const searchParams = useSearchParams();

  const searchKey = useMemo(() => {
    return searchParams.toString();
  }, [searchParams]);

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const q = searchParams.get('q') || '';
      const category = searchParams.get('category');
      const condition = searchParams.get('condition');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const sort = searchParams.get('sort');
      const campus = searchParams.get('campus');
      const allowsMeetup = searchParams.get('allowsMeetup');
      const allowsShipping = searchParams.get('allowsShipping');

      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category) params.append('category', category);
      if (condition) params.append('condition', condition);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);
      if (campus) params.append('campus', campus);
      if (allowsMeetup) params.append('allowsMeetup', allowsMeetup);
      if (allowsShipping) params.append('allowsShipping', allowsShipping);
      params.append('page', pageNum.toString());
      params.append('limit', '20');

      const url = q || category || condition || minPrice || maxPrice || sort
        ? `${BACKEND_URL}/products/search?${params.toString()}`
        : `${BACKEND_URL}/products?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const newProducts = data.products || data;
      const totalCount = data.total || newProducts.length;
      const totalPages = data.pages || 1;

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      setTotal(totalCount);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchProducts(1, false);
  }, [searchKey]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchProducts(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, loadingMore, hasMore, page, fetchProducts]);

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {[...Array(10)].map((_, i) => (
            <Grid item key={i} xs={6} sm={6} md={4} lg={2.4}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to load products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check if the server is running
          </Typography>
        </Box>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchParams.get('q') ? `No results for "${searchParams.get('q')}"` : 'Check back later for new listings'}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {products.length} of {total} {total === 1 ? 'item' : 'items'}
          {searchParams.get('q') && ` for "${searchParams.get('q')}"`}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid item key={p._id || p.id} xs={6} sm={6} md={4} lg={2.4}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
      {hasMore && (
        <Box ref={loadMoreRef} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          {loadingMore ? (
            <CircularProgress size={30} />
          ) : (
            <Button variant="outlined" onClick={() => fetchProducts(page + 1, true)}>
              Load More
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
}
