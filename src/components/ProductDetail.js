'use client';
import { useEffect, useState } from 'react';
import { Button, Box, Typography, Chip, Card, CardMedia } from '@mui/material';

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching product:', err);

        // Fallback to mock data
        setProduct({
          id: id,
          name: `Sample Item ${id}`,
          price: 42.00,
          description: 'Simple description of the item. Condition: Good. Pickup on campus.',
          condition: 'good',
          status: 'active',
          negotiable: true,
          allowsMeetup: true,
          allowsShipping: false,
          views: 24,
          seller: { actualName: 'Sample Seller' },
          category: { name: 'Electronics' },
          images: [],
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error loading product: {error}</div>;
  if (!product) return <div>Product not found</div>;

  // Condition labels
  const conditionLabels = {
    'new': 'New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };
  const conditionLabel = conditionLabels[product.condition] || product.condition;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: '1fr 1fr', gap: 3, p: 2 }}>
      <Box>
        {product.images && product.images.length > 0 ? (
          <CardMedia
            component="img"
            image={Array.isArray(product.images) ? product.images[0] : product.images}
            alt={product.name}
            sx={{
              borderRadius: 2,
              maxHeight: 400,
              objectFit: 'contain',
              width: '100%'
            }}
          />
        ) : (
          <Box sx={{
            border: '1px solid #eee',
            borderRadius: 2,
            height: 400,
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h5" color="white" align="center">
              {product.name}
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" color="primary" fontWeight={700}>
            ${product.price}
          </Typography>
          {product.negotiable && (
            <Chip label="Price Negotiable" size="small" color="info" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={product.category?.name || 'Uncategorized'} variant="outlined" />
          <Chip label={`Condition: ${conditionLabel}`} variant="outlined" />
          <Chip label={product.status.charAt(0).toUpperCase() + product.status.slice(1)} variant="outlined" />
          {product.allowsMeetup && <Chip label="Meetup Available" variant="outlined" />}
          {product.allowsShipping && <Chip label="Shipping Available" variant="outlined" />}
        </Box>

        <Button
          variant="contained"
          sx={{
            mb: 3,
            backgroundColor: '#0654ba',
            '&:hover': { backgroundColor: '#054396' }
          }}
        >
          Make Offer
        </Button>

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {product.description}
        </Typography>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Seller Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.seller?.actualName || product.seller?.name || 'Unknown Seller'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Listed on: {formatDate(product.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Views: {product.views}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}


