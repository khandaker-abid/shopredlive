'use client';

import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = (userId) => `wishlist_${userId}`;

function getWishlist(userId) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(userId)) || '[]');
  } catch {
    return [];
  }
}

function setWishlist(userId, list) {
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(list));
}

export default function WishlistButton({ productId, size = 'small', sx = {} }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?._id || !productId) return;
    setSaved(getWishlist(user._id).includes(productId));
  }, [user, productId]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?._id) return;

    const current = getWishlist(user._id);
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    setWishlist(user._id, next);
    setSaved(next.includes(productId));
  };

  if (!user) return null;

  return (
    <Tooltip title={saved ? 'Remove from wishlist' : 'Save to wishlist'} placement="top">
      <IconButton
        onClick={handleToggle}
        size={size}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        sx={{
          color: saved ? 'error.main' : 'action.active',
          '&:hover': { color: 'error.main' },
          ...sx,
        }}
      >
        {saved ? <FavoriteIcon fontSize={size} /> : <FavoriteBorderIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
}
