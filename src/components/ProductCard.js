import { useState, memo } from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function ProductCard({ product }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  let categoryName = 'General';
  if (product.category) {
    categoryName = typeof product.category === 'object' ? product.category.name : product.category;
  }

  const conditionLabels = {
    'new': 'New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };
  const conditionLabel = conditionLabels[product.condition] || product.condition || 'Unknown';

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${BACKEND_URL}${img}`;
    return img;
  };

  const imageUrl = product.images && product.images.length > 0
    ? getImageUrl(Array.isArray(product.images) ? product.images[0] : product.images)
    : null;

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 300,
      borderRadius: 2,
      boxShadow: 1,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3,
      }
    }}>
      <CardActionArea LinkComponent={Link} href={`/listing/${product._id || product.id}`}>
        {imageUrl && !imageError ? (
          <Box sx={{ position: 'relative', height: 200 }}>
            {!imageLoaded && (
              <Skeleton
                variant="rectangular"
                height={200}
                animation="wave"
                sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              />
            )}
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />
          </Box>
        ) : (
          <Box sx={{
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" color="white" align="center" p={2}>
              {product.name}
            </Typography>
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1, pt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip
              size="small"
              label={categoryName}
              sx={{ height: '20px', fontSize: '0.75rem', mr: 0.5 }}
            />
            <Chip
              size="small"
              label={conditionLabel}
              variant="outlined"
              sx={{ height: '20px', fontSize: '0.75rem', ml: 0.5 }}
            />
          </Box>
          <Typography
            variant="subtitle1"
            noWrap
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 0.5 }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            fontWeight={700}
            sx={{ mb: 0.5 }}
          >
            ${product.price}
          </Typography>
          {product.negotiable && (
            <Chip
              label="Negotiable"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: '20px', fontSize: '0.7rem' }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default memo(ProductCard);


