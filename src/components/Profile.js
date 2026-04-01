'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  TextField,
  Button,
  InputAdornment,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Skeleton,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [listings, setListings] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [profileData, setProfileData] = useState({
    actualName: '',
    email: '',
    campus: '',
    phone: ''
  });

  const userId = user?._id || user?.id;

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError('Session expired. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      const [userRes, ordersRes, reviewsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/user/${userId}`),
        fetch(`${BACKEND_URL}/orders/user/${userId}`),
        fetch(`${BACKEND_URL}/reviews/user/${userId}`)
      ]);

      if (!userRes.ok) throw new Error('Failed to load profile');

      const userData = await userRes.json();
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];

      setUserData(userData);
      setListings(userData.products || []);
      setSavedItems(userData.savedProducts || []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setProfileData({
        actualName: userData.actualName || '',
        email: userData.email || '',
        campus: userData.campus || '',
        phone: userData.phone || ''
      });
      login(userData);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to load profile data');
    } finally {
      setLoading(false);
    }
  }, [userId, login]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const updated = await res.json();
      setUserData(updated);
      login(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleUnsave = async (productId) => {
    try {
      await fetch(`${BACKEND_URL}/user/${userId}/unsave-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      setSavedItems(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error('Error unsaving product:', err);
    }
  };

  const handleRelogin = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', padding: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Button component={Link} href="/login" variant="contained" sx={{ mr: 1 }}>Log in</Button>
          <Button component={Link} href="/signup" variant="outlined">Sign up</Button>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '75vh', p: 1, gap: 1 }}>
        <Skeleton variant="rectangular" width={280} height={400} sx={{ borderRadius: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', padding: 2 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={handleRelogin}>Log In Again</Button>
        </Box>
      </Box>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const renderProfileContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <Paper
            sx={{
              padding: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
              <Avatar
                src={userData?.profilePic}
                sx={{ width: 100, height: 100, marginBottom: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {userData?.actualName?.charAt(0)?.toUpperCase()}
              </Avatar>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Name"
                  value={profileData.actualName}
                  onChange={(e) => setProfileData({...profileData, actualName: e.target.value})}
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
                    {userData?.actualName}
                  </Typography>
                  {userData?.isVerifiedStudent && (
                    <Chip
                      icon={<VerifiedIcon />}
                      label="SBU Verified"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                @{userData?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Rating value={avgRating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({reviews.length} reviews)
                </Typography>
              </Box>
              <Chip label={`Karma: ${userData?.karma || 100}`} size="small" sx={{ mt: 1 }} />
            </Box>

            <Divider sx={{ marginBottom: 2 }} />

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Campus"
                  value={profileData.campus}
                  onChange={(e) => setProfileData({...profileData, campus: e.target.value})}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  variant="outlined"
                  fullWidth
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ color: 'text.secondary', marginRight: 1 }} />
                  <Typography variant="body1" color="text.primary">
                    {userData?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'text.secondary', marginRight: 1 }} />
                  <Typography variant="body1" color="text.primary">
                    {userData?.campus || 'Not set'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(userData?.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {isEditing ? (
              <Box sx={{ display: 'flex', gap: 1, marginTop: 3 }}>
                <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                variant="outlined"
                fullWidth
                sx={{ marginTop: 3 }}
              >
                Edit Profile
              </Button>
            )}
          </Paper>
        );
      case 'listings':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              My Listings ({listings.length})
            </Typography>
            {listings.length === 0 ? (
              <Box>
                <Typography variant="body1" color="text.secondary">
                  You haven't listed any items yet.
                </Typography>
                <Button component={Link} href="/sell" variant="contained" sx={{ marginTop: 2 }}>
                  Create New Listing
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {listings.map((item) => (
                  <Card key={item._id} component={Link} href={`/listing/${item._id}`} sx={{ textDecoration: 'none' }}>
                    <CardMedia
                      component="div"
                      sx={{ height: 140, bgcolor: 'grey.800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Typography color="grey.500">{item.name}</Typography>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>{item.name}</Typography>
                      <Typography variant="body2" color="primary">${item.price}</Typography>
                      <Chip label={item.status} size="small" sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        );
      case 'saved':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Saved Items ({savedItems.length})
            </Typography>
            {savedItems.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You haven't saved any items yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                {savedItems.map((item) => (
                  <Card key={item._id}>
                    <CardMedia
                      component={Link}
                      href={`/listing/${item._id}`}
                      sx={{ height: 140, bgcolor: 'grey.800', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Typography color="grey.500">{item.name}</Typography>
                      )}
                    </CardMedia>
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>{item.name}</Typography>
                      <Typography variant="body2" color="primary">${item.price}</Typography>
                      <Button size="small" onClick={() => handleUnsave(item._id)} sx={{ mt: 1 }}>
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        );
      case 'orders':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Order History ({orders.length})
            </Typography>
            {orders.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any orders yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {orders.map((order) => (
                  <Card key={order._id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {order.product?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.buyer?._id === userId ? 'Bought from' : 'Sold to'}{' '}
                          {order.buyer?._id === userId ? order.seller?.actualName : order.buyer?.actualName}
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          ${order.price}
                        </Typography>
                      </Box>
                      <Chip
                        label={(order.status || 'pending').replace('_', ' ')}
                        color={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        );
      case 'reviews':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Reviews ({reviews.length})
            </Typography>
            {reviews.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No reviews yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviews.map((review) => (
                  <Card key={review._id} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar src={review.reviewer?.profilePic} sx={{ width: 32, height: 32 }}>
                        {review.reviewer?.actualName?.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2">{review.reviewer?.actualName}</Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      minHeight: '75vh',
      backgroundColor: 'background.default',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <Paper
        sx={{
          width: { xs: '100%', md: 280 },
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ padding: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.2rem' }}>
            Account
          </Typography>
        </Box>

        <List sx={{ flex: 1 }}>
          {['profile', 'listings', 'saved', 'orders', 'reviews'].map((tab) => (
            <ListItem key={tab} disablePadding>
              <ListItemButton
                selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  paddingX: 2,
                  borderRadius: 1,
                  backgroundColor: activeTab === tab ? 'action.selected' : 'transparent',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemText
                  primary={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  primaryTypographyProps={{
                    color: 'text.primary',
                    sx: { fontWeight: activeTab === tab ? 'bold' : 'medium' }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box sx={{ flex: 1, padding: 1 }}>
        {renderProfileContent()}
      </Box>
    </Box>
  );
}
