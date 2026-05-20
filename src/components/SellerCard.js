'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Link from 'next/link';

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function memberSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SellerCard({ seller, reviewCount = 0, averageRating = 0 }) {
  if (!seller) return null;

  const name = seller.name || seller.email?.split('@')[0] || 'Unknown Seller';
  const since = memberSince(seller.createdAt);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Seller
        </Typography>
        <Box
          component={Link}
          href={`/profile?id=${seller._id}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
            mb: 1,
          }}
        >
          <Avatar
            src={seller.avatar || undefined}
            alt={name}
            sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: '1rem' }}
          >
            {!seller.avatar && initials(name)}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {name}
            </Typography>
            {since && (
              <Typography variant="caption" color="text.secondary">
                Member since {since}
              </Typography>
            )}
          </Box>
        </Box>
        {reviewCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Rating value={averageRating} precision={0.5} readOnly size="small" />
            <Chip
              label={`${averageRating.toFixed(1)} (${reviewCount})`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.72rem' }}
            />
          </Box>
        )}
        {reviewCount === 0 && (
          <Typography variant="caption" color="text.secondary">
            No reviews yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
