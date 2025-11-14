import Link from 'next/link';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function ProductCard({ product }) {
  // Handle different possible formats for category
  let categoryName = 'General';
  if (product.category) {
    categoryName = typeof product.category === 'object' ? product.category.name : product.category;
  }

  // Determine condition label
  const conditionLabels = {
    'new': 'New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };
  const conditionLabel = conditionLabels[product.condition] || product.condition || 'Unknown';

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
        {product.images && product.images.length > 0 ? (
          <CardMedia
            component="img"
            height="200"
            image={Array.isArray(product.images) ? product.images[0] : product.images}
            alt={product.name}
            sx={{
              objectFit: 'cover',
            }}
            onError={(e) => {
              // If image fails to load, show fallback
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x200/6a11cb/ffffff?text=No+Image";
            }}
          />
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
              sx={{
                height: '20px',
                fontSize: '0.75rem',
                mr: 0.5
              }}
            />
            <Chip
              size="small"
              label={conditionLabel}
              variant="outlined"
              sx={{
                height: '20px',
                fontSize: '0.75rem',
                ml: 0.5
              }}
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


