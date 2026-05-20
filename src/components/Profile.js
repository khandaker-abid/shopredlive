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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar
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
  const [offers, setOffers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [meetupDialog, setMeetupDialog] = useState({
    open: false,
    orderId: null,
    time: '',
    campus: '',
    locationDetail: '',
    notes: ''
  });
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    orderId: null,
    rating: 0,
    comment: ''
  });
  const [searchForm, setSearchForm] = useState({
    name: '',
    query: '',
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    campus: '',
    allowsMeetup: false,
    allowsShipping: false
  });
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
      const [userRes, ordersRes, reviewsRes, offersRes, devicesRes, searchesRes, categoriesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/user/${userId}`),
        fetch(`${BACKEND_URL}/orders/user/${userId}`),
        fetch(`${BACKEND_URL}/reviews/user/${userId}`),
        fetch(`${BACKEND_URL}/offers/user/${userId}`),
        fetch(`${BACKEND_URL}/user/${userId}/devices`),
        fetch(`${BACKEND_URL}/user/${userId}/saved-searches`),
        fetch(`${BACKEND_URL}/categories`)
      ]);

      if (!userRes.ok) throw new Error('Failed to load profile');

      const userData = await userRes.json();
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];
      const offersData = offersRes.ok ? await offersRes.json() : [];
      const devicesData = devicesRes.ok ? await devicesRes.json() : [];
      const searchesData = searchesRes.ok ? await searchesRes.json() : [];
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

      setUserData(userData);
      setListings(userData.products || []);
      setSavedItems(userData.savedProducts || []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setDevices(Array.isArray(devicesData) ? devicesData : []);
      setSavedSearches(Array.isArray(searchesData) ? searchesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setProfileData({
        actualName: userData.actualName || '',
        email: userData.email || '',
        campus: userData.campus || '',
        phone: userData.phone || ''
      });
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to load profile data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOfferUpdate = async (offerId, status) => {
    try {
      const response = await fetch(`${BACKEND_URL}/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorId: userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update offer');
      setOffers((prev) => prev.map((offer) => (offer._id === offerId ? data : offer)));
      notify(`Offer ${status}`);
      fetchAll();
    } catch (err) {
      notify(err.message || 'Failed to update offer', 'error');
    }
  };

  const handleRenewListing = async (productId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/product/${productId}/renew`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to renew listing');
      setListings((prev) => prev.map((item) => (item._id === productId ? data : item)));
      notify('Listing renewed');
    } catch (err) {
      notify(err.message || 'Failed to renew listing', 'error');
    }
  };

  const handleBumpListing = async (productId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/product/${productId}/bump`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to bump listing');
      setListings((prev) => prev.map((item) => (item._id === productId ? data : item)));
      notify('Listing bumped');
    } catch (err) {
      notify(err.message || 'Failed to bump listing', 'error');
    }
  };

  const openMeetupDialog = (order) => {
    setMeetupDialog({
      open: true,
      orderId: order._id,
      time: order.meetup?.time ? new Date(order.meetup.time).toISOString().slice(0, 16) : '',
      campus: order.meetup?.campus || '',
      locationDetail: order.meetup?.locationDetail || '',
      notes: order.meetup?.notes || ''
    });
  };

  const handleSaveMeetup = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/orders/${meetupDialog.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: userId,
          meetup: {
            time: meetupDialog.time,
            campus: meetupDialog.campus,
            locationDetail: meetupDialog.locationDetail,
            notes: meetupDialog.notes
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule meetup');
      setOrders((prev) => prev.map((order) => (order._id === data._id ? data : order)));
      setMeetupDialog({ open: false, orderId: null, time: '', campus: '', locationDetail: '', notes: '' });
      notify('Meetup scheduled');
    } catch (err) {
      notify(err.message || 'Failed to schedule meetup', 'error');
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorId: userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order');
      setOrders((prev) => prev.map((order) => (order._id === data._id ? data : order)));
      notify(`Order ${status.replace('_', ' ')}`);
    } catch (err) {
      notify(err.message || 'Failed to update order', 'error');
    }
  };

  const openReviewDialog = (order) => {
    setReviewDialog({ open: true, orderId: order._id, rating: 0, comment: '' });
  };

  const handleSubmitReview = async () => {
    try {
      const order = orders.find((item) => item._id === reviewDialog.orderId);
      if (!order) throw new Error('Order not found');
      const revieweeId = order.buyer?._id === userId ? order.seller?._id : order.buyer?._id;
      const response = await fetch(`${BACKEND_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerId: userId,
          revieweeId,
          orderId: order._id,
          rating: reviewDialog.rating,
          comment: reviewDialog.comment
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit review');
      setReviews((prev) => [...prev, data]);
      setReviewDialog({ open: false, orderId: null, rating: 0, comment: '' });
      notify('Review submitted');
    } catch (err) {
      notify(err.message || 'Failed to submit review', 'error');
    }
  };

  const handleShareContact = async (orderId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/orders/${orderId}/contact-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to share contact');
      setOrders((prev) => prev.map((order) => (
        order._id === orderId ? { ...order, contactExchange: data.contactExchange } : order
      )));
      notify('Contact info shared');
    } catch (err) {
      notify(err.message || 'Failed to share contact', 'error');
    }
  };

  const handleRevokeDevice = async (fingerprint) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/${userId}/devices/revoke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to revoke device');
      setDevices((prev) => prev.map((device) => (
        device.fingerprint === fingerprint ? data.device : device
      )));
      notify('Device revoked');
    } catch (err) {
      notify(err.message || 'Failed to revoke device', 'error');
    }
  };

  const handleAddSavedSearch = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/${userId}/saved-searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchForm.name,
          query: searchForm.query,
          filters: {
            category: searchForm.category || null,
            condition: searchForm.condition || '',
            minPrice: searchForm.minPrice ? Number(searchForm.minPrice) : null,
            maxPrice: searchForm.maxPrice ? Number(searchForm.maxPrice) : null,
            campus: searchForm.campus || '',
            allowsMeetup: searchForm.allowsMeetup,
            allowsShipping: searchForm.allowsShipping
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save search');
      setSavedSearches((prev) => [...prev, data]);
      setSearchForm({
        name: '',
        query: '',
        category: '',
        condition: '',
        minPrice: '',
        maxPrice: '',
        campus: '',
        allowsMeetup: false,
        allowsShipping: false
      });
      notify('Search saved');
    } catch (err) {
      notify(err.message || 'Failed to save search', 'error');
    }
  };

  const handleRunSavedSearch = async (searchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/${userId}/saved-searches/${searchId}/run`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to run search');
      notify(`${data.matches?.length || 0} new matches found`);
    } catch (err) {
      notify(err.message || 'Failed to run search', 'error');
    }
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/${userId}/saved-searches/${searchId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete search');
      setSavedSearches((prev) => prev.filter((search) => search.id !== searchId));
      notify('Saved search removed');
    } catch (err) {
      notify(err.message || 'Failed to delete search', 'error');
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
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => (
    reviews.filter((review) => review.rating === star).length
  ));
  const tabLabels = {
    profile: 'Profile',
    listings: 'Listings',
    saved: 'Saved',
    offers: 'Offers',
    orders: 'Orders',
    'saved-searches': 'Saved searches',
    devices: 'Devices',
    reviews: 'Reviews'
  };

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
              {userData?.responseTimeAvgMinutes ? (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Avg response: {Math.round(userData.responseTimeAvgMinutes)} min
                </Typography>
              ) : null}
              <Chip label={`Karma: ${userData?.karma || 100}`} size="small" sx={{ mt: 1 }} />
            </Box>

            <Divider sx={{ marginBottom: 2 }} />

            {reviews.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Rating breakdown
                </Typography>
                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  {ratingCounts.map((count, index) => (
                    <Typography key={index} variant="caption" color="text.secondary">
                      {5 - index} stars: {count}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

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
                {listings.map((item) => {
                  const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                  const isExpired = item.status === 'expired' || (expiresAt && expiresAt.getTime() <= Date.now());
                  return (
                    <Card key={item._id} sx={{ textDecoration: 'none' }}>
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
                        {expiresAt ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Expires {expiresAt.toLocaleDateString()}
                          </Typography>
                        ) : null}
                        <Chip label={item.status} size="small" sx={{ mt: 1 }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {isExpired && (
                            <Button size="small" variant="contained" onClick={() => handleRenewListing(item._id)}>
                              Renew
                            </Button>
                          )}
                          {!isExpired && item.status === 'active' && (
                            <Button size="small" variant="outlined" onClick={() => handleBumpListing(item._id)}>
                              Bump
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
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
                {orders.map((order) => {
                  const isBuyer = order.buyer?._id === userId;
                  const isSeller = order.seller?._id === userId;
                  const contactExchange = order.contactExchange || {};
                  const contactShared = contactExchange.buyerShared && contactExchange.sellerShared;
                  const canShare = isBuyer ? !contactExchange.buyerShared : !contactExchange.sellerShared;
                  const canSchedule = !['completed', 'cancelled'].includes(order.status);
                  const hasReview = reviews.some((review) => (review.order?._id || review.order) === order._id);
                  const canReview = order.status === 'completed' && !hasReview;
                  return (
                    <Card key={order._id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {order.product?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isBuyer ? 'Bought from' : 'Sold to'}{' '}
                            {isBuyer ? order.seller?.actualName : order.buyer?.actualName}
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            ${order.price}
                          </Typography>
                          {order.meetup?.time && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Meetup: {new Date(order.meetup.time).toLocaleString()} {order.meetup.campus ? `(${order.meetup.campus})` : ''}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={(order.status || 'pending').replace('_', ' ')}
                          color={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}
                          size="small"
                        />
                      </Box>

                      {contactShared ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Contact shared
                          </Typography>
                          <Typography variant="body2">
                            {isBuyer ? contactExchange.sellerEmail : contactExchange.buyerEmail}
                          </Typography>
                          <Typography variant="body2">
                            {isBuyer ? contactExchange.sellerPhone : contactExchange.buyerPhone}
                          </Typography>
                        </Box>
                      ) : canShare ? (
                        <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => handleShareContact(order._id)}>
                          Share contact info
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Waiting on the other party to share contact info.
                        </Typography>
                      )}

                      {canSchedule && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" onClick={() => openMeetupDialog(order)}>
                            {order.meetup?.time ? 'Reschedule meetup' : 'Schedule meetup'}
                          </Button>
                          <Button size="small" variant="contained" onClick={() => handleOrderStatus(order._id, 'completed')}>
                            Mark complete
                          </Button>
                          <Button size="small" color="error" onClick={() => handleOrderStatus(order._id, 'cancelled')}>
                            Cancel
                          </Button>
                        </Box>
                      )}
                      {canReview && (
                        <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => openReviewDialog(order)}>
                          Leave review
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        );
      case 'offers':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Offers ({offers.length})
            </Typography>
            {offers.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No offers yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {offers.map((offer) => {
                  const isSeller = offer.seller?._id === userId;
                  const isBuyer = offer.buyer?._id === userId;
                  const canRespond = offer.status === 'pending';
                  const expiresAt = offer.expiresAt ? new Date(offer.expiresAt) : null;
                  return (
                    <Card key={offer._id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {offer.product?.name || 'Listing'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Offer: ${offer.amount}
                          </Typography>
                          {offer.message ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              "{offer.message}"
                            </Typography>
                          ) : null}
                          {expiresAt ? (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Expires {expiresAt.toLocaleDateString()}
                            </Typography>
                          ) : null}
                        </Box>
                        <Chip
                          label={offer.status}
                          size="small"
                          color={offer.status === 'accepted' ? 'success' : offer.status === 'declined' || offer.status === 'withdrawn' || offer.status === 'expired' ? 'default' : 'warning'}
                        />
                      </Box>
                      {canRespond && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          {isSeller && (
                            <>
                              <Button size="small" variant="contained" onClick={() => handleOfferUpdate(offer._id, 'accepted')}>
                                Accept
                              </Button>
                              <Button size="small" variant="outlined" onClick={() => handleOfferUpdate(offer._id, 'declined')}>
                                Decline
                              </Button>
                            </>
                          )}
                          {isBuyer && (
                            <Button size="small" variant="outlined" onClick={() => handleOfferUpdate(offer._id, 'withdrawn')}>
                              Withdraw
                            </Button>
                          )}
                        </Box>
                      )}
                    </Card>
                  );
                })}
              </Box>
            )}
          </Paper>
        );
      case 'saved-searches':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Saved Searches ({savedSearches.length})
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
              <TextField
                label="Search name"
                value={searchForm.name}
                onChange={(e) => setSearchForm({ ...searchForm, name: e.target.value })}
              />
              <TextField
                label="Query"
                value={searchForm.query}
                onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={searchForm.category}
                  label="Category"
                  onChange={(e) => setSearchForm({ ...searchForm, category: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={searchForm.condition}
                  label="Condition"
                  onChange={(e) => setSearchForm({ ...searchForm, condition: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="like_new">Like New</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Min price"
                  type="number"
                  value={searchForm.minPrice}
                  onChange={(e) => setSearchForm({ ...searchForm, minPrice: e.target.value })}
                  sx={{ flex: 1, minWidth: 120 }}
                />
                <TextField
                  label="Max price"
                  type="number"
                  value={searchForm.maxPrice}
                  onChange={(e) => setSearchForm({ ...searchForm, maxPrice: e.target.value })}
                  sx={{ flex: 1, minWidth: 120 }}
                />
                <TextField
                  label="Campus"
                  value={searchForm.campus}
                  onChange={(e) => setSearchForm({ ...searchForm, campus: e.target.value })}
                  sx={{ flex: 1, minWidth: 160 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant={searchForm.allowsMeetup ? 'contained' : 'outlined'}
                  onClick={() => setSearchForm({ ...searchForm, allowsMeetup: !searchForm.allowsMeetup })}
                  size="small"
                >
                  Meetup
                </Button>
                <Button
                  variant={searchForm.allowsShipping ? 'contained' : 'outlined'}
                  onClick={() => setSearchForm({ ...searchForm, allowsShipping: !searchForm.allowsShipping })}
                  size="small"
                >
                  Shipping
                </Button>
              </Box>
              <Button variant="contained" onClick={handleAddSavedSearch}>
                Save Search
              </Button>
            </Box>

            {savedSearches.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No saved searches yet.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {savedSearches.map((search) => (
                  <Card key={search.id} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {search.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {search.query ? `Query: ${search.query}` : 'No query'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="outlined" onClick={() => handleRunSavedSearch(search.id)}>
                        Check now
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeleteSavedSearch(search.id)}>
                        Delete
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        );
      case 'devices':
        return (
          <Paper sx={{ padding: 3, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Trusted Devices ({devices.length})
            </Typography>
            {devices.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No devices on record.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {devices.map((device) => (
                  <Card key={device.fingerprint} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {device.label || 'Device'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Last seen: {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Unknown'}
                        </Typography>
                        {device.geo?.city ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {device.geo.city}, {device.geo.region}
                          </Typography>
                        ) : null}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={device.trusted === false ? 'Revoked' : 'Trusted'}
                          color={device.trusted === false ? 'default' : 'success'}
                          size="small"
                        />
                        {device.trusted !== false && (
                          <Button size="small" color="error" onClick={() => handleRevokeDevice(device.fingerprint)}>
                            Revoke
                          </Button>
                        )}
                      </Box>
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
          {['profile', 'listings', 'saved', 'offers', 'orders', 'saved-searches', 'devices', 'reviews'].map((tab) => (
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
                  primary={tabLabels[tab] || (tab.charAt(0).toUpperCase() + tab.slice(1))}
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

      <Dialog open={meetupDialog.open} onClose={() => setMeetupDialog({ open: false, orderId: null, time: '', campus: '', locationDetail: '', notes: '' })} fullWidth maxWidth="sm">
        <DialogTitle>Schedule meetup</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Time"
            type="datetime-local"
            value={meetupDialog.time}
            onChange={(e) => setMeetupDialog({ ...meetupDialog, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Campus"
            value={meetupDialog.campus}
            onChange={(e) => setMeetupDialog({ ...meetupDialog, campus: e.target.value })}
          />
          <TextField
            label="Location detail"
            value={meetupDialog.locationDetail}
            onChange={(e) => setMeetupDialog({ ...meetupDialog, locationDetail: e.target.value })}
          />
          <TextField
            label="Notes"
            value={meetupDialog.notes}
            onChange={(e) => setMeetupDialog({ ...meetupDialog, notes: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetupDialog({ open: false, orderId: null, time: '', campus: '', locationDetail: '', notes: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveMeetup}>
            Save meetup
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, orderId: null, rating: 0, comment: '' })} fullWidth maxWidth="sm">
        <DialogTitle>Leave a review</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <Rating
            value={reviewDialog.rating}
            onChange={(_, value) => setReviewDialog({ ...reviewDialog, rating: value || 0 })}
          />
          <TextField
            label="Comment"
            value={reviewDialog.comment}
            onChange={(e) => setReviewDialog({ ...reviewDialog, comment: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, orderId: null, rating: 0, comment: '' })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitReview} disabled={!reviewDialog.rating}>
            Submit review
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
