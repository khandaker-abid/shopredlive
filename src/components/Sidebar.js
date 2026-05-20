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
  CircularProgress,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import { fetchCategories as fetchCategoriesAPI } from '../lib/api';
import CampusMap from './CampusMap';

export default function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('newest');
  const [campus, setCampus] = useState('');
  const [allowsMeetup, setAllowsMeetup] = useState(false);
  const [allowsShipping, setAllowsShipping] = useState(false);

  const active = searchParams.get('category') || 'all';

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

  useEffect(() => {
    const minPrice = Number(searchParams.get('minPrice') || 0);
    const maxPrice = Number(searchParams.get('maxPrice') || 1000);
    setPriceRange([minPrice, maxPrice]);
    setCondition(searchParams.get('condition') || '');
    setSort(searchParams.get('sort') || 'newest');
    setCampus(searchParams.get('campus') || '');
    setAllowsMeetup(searchParams.get('allowsMeetup') === 'true');
    setAllowsShipping(searchParams.get('allowsShipping') === 'true');
  }, [searchParams]);

  const buildHref = useCallback((categoryId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    else params.delete('minPrice');
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1]);
    else params.delete('maxPrice');
    if (condition) params.set('condition', condition);
    else params.delete('condition');
    if (sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');
    if (campus) params.set('campus', campus);
    else params.delete('campus');
    if (allowsMeetup) params.set('allowsMeetup', 'true');
    else params.delete('allowsMeetup');
    if (allowsShipping) params.set('allowsShipping', 'true');
    else params.delete('allowsShipping');
    return `/?${params.toString()}`;
  }, [searchParams, priceRange, condition, sort, campus, allowsMeetup, allowsShipping]);

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
    if (campus) params.set('campus', campus);
    else params.delete('campus');
    if (allowsMeetup) params.set('allowsMeetup', 'true');
    else params.delete('allowsMeetup');
    if (allowsShipping) params.set('allowsShipping', 'true');
    else params.delete('allowsShipping');
    router.push(`/?${params.toString()}`);
  }, [searchParams, priceRange, condition, sort, campus, allowsMeetup, allowsShipping, router]);

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
            const isActive = active === c._id || (c._id === 'all' && !searchParams.get('category'));
            return (
              <ListItem key={c._id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={buildHref(c._id)}
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
          <MenuItem value="most_viewed">Most Viewed</MenuItem>
          <MenuItem value="ending_soon">Ending Soon</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Campus"
        value={campus}
        onChange={(e) => setCampus(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        placeholder="Main Campus"
      />

      <FormControlLabel
        control={<Switch checked={allowsMeetup} onChange={(e) => setAllowsMeetup(e.target.checked)} />}
        label="Meetup Available"
        sx={{ mb: 1 }}
      />

      <FormControlLabel
        control={<Switch checked={allowsShipping} onChange={(e) => setAllowsShipping(e.target.checked)} />}
        label="Shipping Available"
        sx={{ mb: 2 }}
      />

      <CampusMap
        selected={campus}
        onSelect={(value) => setCampus(value)}
      />

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
