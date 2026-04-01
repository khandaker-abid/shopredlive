"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Slider,
  Button,
  CircularProgress
} from '@mui/material';
import { fetchCategories as fetchCategoriesAPI } from '../lib/api';

export default function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('newest');

  const active = searchParams.get('category') || 'All';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesAPI();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const buildHref = useCallback((categoryName) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryName === 'All') {
      params.delete('category');
    } else {
      params.set('category', categoryName);
    }
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    else params.delete('minPrice');
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1]);
    else params.delete('maxPrice');
    if (condition) params.set('condition', condition);
    else params.delete('condition');
    if (sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');
    return `/?${params.toString()}`;
  }, [searchParams, priceRange, condition, sort]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    else params.delete('minPrice');
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1]);
    else params.delete('maxPrice');
    if (condition) params.set('condition', condition);
    else params.delete('condition');
    if (sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');
    router.push(`/?${params.toString()}`);
  }, [searchParams, priceRange, condition, sort, router]);

  const allCategories = useMemo(() => [{ _id: 'all', name: 'All' }, ...categories], [categories]);

  return (
    <Paper
      sx={{
        width: 260,
        padding: 2,
        backgroundColor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius}px`
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, marginBottom: 1, color: 'text.primary', fontSize: '1rem' }}
      >
        Categories
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={20} />
        </Box>
      ) : (
        <List sx={{ padding: 0, margin: 0 }}>
          {allCategories.map((c) => {
            const isActive = active === c.name || (c.name === 'All' && !searchParams.get('category'));
            return (
              <ListItem key={c._id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={buildHref(c.name)}
                  sx={{
                    padding: '8px',
                    borderRadius: 1,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                    }
                  }}
                >
                  {c.name}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
        Price Range
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          onChange={(e, v) => setPriceRange(v)}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          sx={{ color: 'primary.main' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">${priceRange[0]}</Typography>
          <Typography variant="caption" color="text.secondary">${priceRange[1]}+</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Condition</InputLabel>
        <Select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          label="Condition"
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="like_new">Like New</MenuItem>
          <MenuItem value="good">Good</MenuItem>
          <MenuItem value="fair">Fair</MenuItem>
          <MenuItem value="poor">Poor</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="oldest">Oldest First</MenuItem>
          <MenuItem value="price_asc">Price: Low to High</MenuItem>
          <MenuItem value="price_desc">Price: High to Low</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={applyFilters}
        sx={{ textTransform: 'none' }}
      >
        Apply Filters
      </Button>
    </Paper>
  );
}
