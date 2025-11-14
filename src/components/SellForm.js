'use client';

import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel,
  Switch, Grid, Chip
} from '@mui/material';

export default function SellForm() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    condition: 'good',
    negotiable: true,
    allowsMeetup: true,
    allowsShipping: false
  });

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    });
  }

  async function onSubmit(e) {
    e.preventDefault();

    // In a real app, this would submit to your API
    // For now, we'll just show an alert with the form data
    console.log('Submitting form:', form);

    // Mock API call
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images: [] // In real app, this would include uploaded images
        })
      });

      if (response.ok) {
        alert('Item listed successfully!');
        // Reset form
        setForm({
          name: '',
          price: '',
          description: '',
          category: '',
          condition: 'good',
          negotiable: true,
          allowsMeetup: true,
          allowsShipping: false
        });
      } else {
        alert('Error listing item. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error listing item. Please try again.');
    }
  }

  // Sample categories - in a real app, these would come from an API
  const categories = [
    { id: 'cat1', name: 'Electronics' },
    { id: 'cat2', name: 'Books' },
    { id: 'cat3', name: 'Furniture' },
    { id: 'cat4', name: 'Clothing' },
    { id: 'cat5', name: 'Appliances' },
    { id: 'cat6', name: 'Sports & Outdoors' },
    { id: 'cat7', name: 'Home & Garden' },
    { id: 'cat8', name: 'Art & Crafts' },
    { id: 'cat9', name: 'Musical Instruments' },
    { id: 'cat10', name: 'Vehicles' },
    { id: 'cat11', name: 'Other' }
  ];

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
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              marginBottom: 3,
              textAlign: 'center'
            }}
          >
            List New Item
          </Typography>

          <Divider sx={{ marginBottom: 3 }} />

          <form onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                name="name"
                label="Item Title"
                value={form.name}
                onChange={onChange}
                variant="outlined"
                fullWidth
                required
                placeholder="Enter item name"
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                sx={{
                  backgroundColor: 'action.input',
                  borderRadius: 2,
                }}
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
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                sx={{
                  backgroundColor: 'action.input',
                  borderRadius: 2,
                }}
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
                InputLabelProps={{
                  sx: {
                    color: 'text.secondary',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                sx={{
                  backgroundColor: 'action.input',
                  borderRadius: 2,
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    label="Category"
                    sx={{
                      backgroundColor: 'action.input',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
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
                    sx={{
                      backgroundColor: 'action.input',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="like_new">Like New</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label="Price Negotiable"
                  color={form.negotiable ? "primary" : "default"}
                  variant={form.negotiable ? "filled" : "outlined"}
                  onClick={() => setForm({...form, negotiable: !form.negotiable})}
                  clickable
                  sx={{
                    height: '32px',
                    fontSize: '0.875rem'
                  }}
                />
                <Chip
                  label="Meetup Available"
                  color={form.allowsMeetup ? "primary" : "default"}
                  variant={form.allowsMeetup ? "filled" : "outlined"}
                  onClick={() => setForm({...form, allowsMeetup: !form.allowsMeetup})}
                  clickable
                  sx={{
                    height: '32px',
                    fontSize: '0.875rem'
                  }}
                />
                <Chip
                  label="Shipping Available"
                  color={form.allowsShipping ? "primary" : "default"}
                  variant={form.allowsShipping ? "filled" : "outlined"}
                  onClick={() => setForm({...form, allowsShipping: !form.allowsShipping})}
                  clickable
                  sx={{
                    height: '32px',
                    fontSize: '0.875rem'
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  marginTop: 2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  padding: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                List Item
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}


