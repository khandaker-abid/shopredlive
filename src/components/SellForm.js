'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress,
  IconButton, ImageList, ImageListItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function SellForm() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    condition: 'good',
    negotiable: true,
    allowsMeetup: true,
    allowsShipping: false,
    campus: '',
    area: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    });
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setImages(prev => [...prev, ...data.urls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        product: {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category || null,
          condition: form.condition,
          negotiable: form.negotiable,
          allowsMeetup: form.allowsMeetup,
          allowsShipping: form.allowsShipping,
          images: images,
          seller: user._id,
          location: {
            campus: form.campus,
            area: form.area
          }
        }
      };

      const response = await fetch(`${BACKEND_URL}/newProduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const newProduct = await response.json();
        router.push(`/listing/${newProduct._id}`);
      } else {
        alert('Error listing item. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error listing item. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Please log in to list items.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 3,
        backgroundColor: 'background.default',
        minHeight: '100vh'
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 4,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: 'text.primary', marginBottom: 3, textAlign: 'center' }}
          >
            List New Item
          </Typography>

          <Divider sx={{ marginBottom: 3 }} />

          <form onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
                {uploading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography color="text.secondary">
                      Click to upload images (max 10)
                    </Typography>
                  </>
                )}
              </Box>

              {images.length > 0 && (
                <ImageList cols={4} rowHeight={100} gap={8}>
                  {images.map((img, index) => (
                    <ImageListItem key={index} sx={{ position: 'relative' }}>
                      <img
                        src={img.startsWith('/') ? `${BACKEND_URL}${img}` : img}
                        alt={`Upload ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'error.main', color: 'white' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              <TextField
                name="name"
                label="Item Title"
                value={form.name}
                onChange={onChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter item name"
              />

              <TextField
                name="price"
                label="Price ($)"
                value={form.price}
                onChange={onChange}
                variant="outlined"
                type="number"
                fullWidth
                required
                placeholder="0.00"
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={onChange}
                variant="outlined"
                multiline
                rows={5}
                fullWidth
                required
                placeholder="Describe the item, its features, any flaws, why you're selling, etc."
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    label="Category"
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="condition-label">Condition</InputLabel>
                  <Select
                    labelId="condition-label"
                    name="condition"
                    value={form.condition}
                    onChange={onChange}
                    label="Condition"
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like_new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  name="campus"
                  label="Campus"
                  value={form.campus}
                  onChange={onChange}
                  variant="outlined"
                  fullWidth
                  placeholder="e.g., Main Campus"
                />
                <TextField
                  name="area"
                  label="Area/Building"
                  value={form.area}
                  onChange={onChange}
                  variant="outlined"
                  fullWidth
                  placeholder="e.g., Student Union"
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label="Price Negotiable"
                  color={form.negotiable ? "primary" : "default"}
                  variant={form.negotiable ? "filled" : "outlined"}
                  onClick={() => setForm({...form, negotiable: !form.negotiable})}
                  clickable
                />
                <Chip
                  label="Meetup Available"
                  color={form.allowsMeetup ? "primary" : "default"}
                  variant={form.allowsMeetup ? "filled" : "outlined"}
                  onClick={() => setForm({...form, allowsMeetup: !form.allowsMeetup})}
                  clickable
                />
                <Chip
                  label="Shipping Available"
                  color={form.allowsShipping ? "primary" : "default"}
                  variant={form.allowsShipping ? "filled" : "outlined"}
                  onClick={() => setForm({...form, allowsShipping: !form.allowsShipping})}
                  clickable
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  marginTop: 2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  padding: 1.5,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'List Item'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
