'use client';

import { useEffect, useState } from 'react';
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function resolveImage(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return url;
}

export default function RecentlyViewed() {
  const router = useRouter();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setItems(stored);
  }, []);

  if (!items.length) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Recently viewed
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
        {items.map((item) => (
          <Card key={item._id} sx={{ minWidth: 200, flexShrink: 0 }}>
            <CardActionArea onClick={() => router.push(`/listing/${item._id}`)}>
              {item.image ? (
                <CardMedia
                  component="img"
                  height="120"
                  image={resolveImage(item.image)}
                  alt={item.name}
                />
              ) : (
                <Box sx={{ height: 120, bgcolor: 'grey.900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">{item.name}</Typography>
                </Box>
              )}
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle2" noWrap>{item.name}</Typography>
                <Typography variant="body2" color="primary">${item.price}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
