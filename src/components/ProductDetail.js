'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Box,
  Typography,
  Chip,
  CardMedia,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  Rating,
  Divider,
  Grid
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FlagIcon from '@mui/icons-material/Flag';
import MessageIcon from '@mui/icons-material/Message';
import { useAuth } from '../context/AuthContext';
import ReputationBadges from './ReputationBadges';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function ProductDetail({ id }) {
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState('listing');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [moreFromSeller, setMoreFromSeller] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [sellerStats, setSellerStats] = useState({ avgRating: 0, reviewCount: 0 });

  useEffect(() => {
    fetchProduct();
    incrementViews();
  }, [id]);

  useEffect(() => {
    if (user && product) {
      checkIfSaved();
    }
  }, [user, product]);

  useEffect(() => {
    if (product?._id) {
      const entry = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        viewedAt: Date.now()
      };
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = stored.filter((item) => item._id !== product._id);
      filtered.unshift(entry);
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 12)));
    }
  }, [product]);

  useEffect(() => {
    if (!product?.seller?._id) return;
    const fetchExtras = async () => {
      try {
        const [sellerRes, relatedRes, reviewsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/products/seller/${product.seller._id}?limit=6`),
          fetch(`${BACKEND_URL}/products/related/${product._id}?limit=6`),
          fetch(`${BACKEND_URL}/reviews/user/${product.seller._id}`)
        ]);
        const sellerData = sellerRes.ok ? await sellerRes.json() : [];
        const relatedData = relatedRes.ok ? await relatedRes.json() : [];
        const reviews = reviewsRes.ok ? await reviewsRes.json() : [];

        setMoreFromSeller(sellerData.filter((item) => item._id !== product._id));
        setRelatedItems(relatedData);

        if (Array.isArray(reviews) && reviews.length) {
          const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setSellerStats({ avgRating: avg, reviewCount: reviews.length });
        } else {
          setSellerStats({ avgRating: 0, reviewCount: 0 });
        }
      } catch (err) {
        console.error('Error loading seller extras:', err);
      }
    };
    fetchExtras();
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/product/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await fetch(`${BACKEND_URL}/product/${id}/view`, { method: 'POST' });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/user/${user._id}`);
      const userData = await res.json();
      setSaved(userData.savedProducts?.some(p => p._id === id || p === id));
    } catch (err) {
      console.error('Error checking saved:', err);
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const endpoint = saved ? 'unsave-product' : 'save-product';
      await fetch(`${BACKEND_URL}/user/${user._id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      });
      setSaved(!saved);
      setSnackbar({ open: true, message: saved ? 'Removed from saved' : 'Saved!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving product', severity: 'error' });
    }
  };

  const handleMakeOffer = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await fetch(`${BACKEND_URL}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          buyerId: user._id,
          amount: parseFloat(offerAmount),
          message: offerMessage
        })
      });
      setOfferOpen(false);
      setOfferAmount('');
      setOfferMessage('');
      setSnackbar({ open: true, message: 'Offer sent successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error sending offer', severity: 'error' });
    }
  };

  const handleStartConversation = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [user._id, product.seller._id],
          productId: id
        })
      });
      await res.json();
      router.push('/messages');
    } catch (err) {
      setSnackbar({ open: true, message: 'Error starting conversation', severity: 'error' });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/checkout?productId=${id}`);
  };

  const handleReport = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      await fetch(`${BACKEND_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user._id,
          targetProductId: reportTarget === 'listing' ? id : undefined,
          targetUserId: reportTarget === 'seller' ? product?.seller?._id : undefined,
          reason: reportReason,
          details: reportDetails
        })
      });
      setReportOpen(false);
      setReportReason('');
      setReportDetails('');
      setSnackbar({ open: true, message: 'Report submitted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error submitting report', severity: 'error' });
    }
  };

  if (loading) return <div>Loading product details...</div>;
  if (!product) return <div>Product not found</div>;

  const conditionLabels = {
    'new': 'New',
    'like_new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOwnProduct = user && product.seller?._id === user._id;

  return (
    <Box sx={{ display: { xs: 'block', md: 'grid' }, gridTemplateColumns: '1fr 1fr', gap: 3, p: 2 }}>
      <Box>
        {product.images && product.images.length > 0 ? (
          <CardMedia
            component="img"
            image={product.images[0].startsWith('/') ? `${BACKEND_URL}${product.images[0]}` : product.images[0]}
            alt={product.name}
            sx={{ borderRadius: 2, maxHeight: 400, objectFit: 'contain', width: '100%' }}
          />
        ) : (
          <Box sx={{
            border: '1px solid #eee',
            borderRadius: 2,
            height: 400,
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h5" color="white" align="center">
              {product.name}
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {product.name}
          </Typography>
          <Box>
            <IconButton onClick={handleSave} color={saved ? 'primary' : 'default'}>
              {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <IconButton onClick={() => setReportOpen(true)} color="default">
              <FlagIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" color="primary" fontWeight={700}>
            ${product.price}
          </Typography>
          {product.negotiable && (
            <Chip label="Price Negotiable" size="small" color="info" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={product.category?.name || 'Uncategorized'} variant="outlined" />
          <Chip label={`Condition: ${conditionLabels[product.condition] || product.condition}`} variant="outlined" />
          <Chip label={product.status.charAt(0).toUpperCase() + product.status.slice(1)} variant="outlined" />
          {product.allowsMeetup && <Chip label="Meetup Available" variant="outlined" />}
          {product.allowsShipping && <Chip label="Shipping Available" variant="outlined" />}
        </Box>

        {!isOwnProduct && product.status === 'active' && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOfferOpen(true)}
              sx={{ flex: 1 }}
            >
              Make Offer
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckout}
              sx={{ flex: 1 }}
            >
              Buy Now
            </Button>
            <Button
              variant="outlined"
              startIcon={<MessageIcon />}
              onClick={handleStartConversation}
              sx={{ flex: 1 }}
            >
              Message Seller
            </Button>
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {product.description}
        </Typography>

        {product.location?.campus && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Location: {product.location.campus}{product.location.area && ` - ${product.location.area}`}
          </Typography>
        )}

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Seller Information
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={product.seller?.profilePic} sx={{ width: 48, height: 48 }}>
              {product.seller?.actualName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {product.seller?.actualName || product.seller?.name || 'Unknown Seller'}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <ReputationBadges
                  user={product.seller}
                  avgRating={sellerStats.avgRating}
                  reviewCount={sellerStats.reviewCount}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Karma: {product.seller?.karma || 100}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Rating value={sellerStats.avgRating} precision={0.5} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  ({sellerStats.reviewCount})
                </Typography>
              </Box>
              {product.seller?.responseTimeAvgMinutes ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Avg response: {Math.round(product.seller.responseTimeAvgMinutes)} min
                </Typography>
              ) : null}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Listed on: {formatDate(product.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Views: {product.views}
          </Typography>
        </Box>

        {(moreFromSeller.length > 0 || relatedItems.length > 0) && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            {moreFromSeller.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  More from this seller
                </Typography>
                <Grid container spacing={2}>
                  {moreFromSeller.map((item) => (
                    <Grid item key={item._id} xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => router.push(`/listing/${item._id}`)}
                        sx={{ textTransform: 'none', justifyContent: 'space-between' }}
                      >
                        <span>{item.name}</span>
                        <span>${item.price}</span>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            {relatedItems.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Related items
                </Typography>
                <Grid container spacing={2}>
                  {relatedItems.map((item) => (
                    <Grid item key={item._id} xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => router.push(`/listing/${item._id}`)}
                        sx={{ textTransform: 'none', justifyContent: 'space-between' }}
                      >
                        <span>{item.name}</span>
                        <span>${item.price}</span>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Dialog open={offerOpen} onClose={() => setOfferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make an Offer</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Asking price: ${product.price}
          </Typography>
          <TextField
            label="Your Offer ($)"
            type="number"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message (optional)"
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferOpen(false)}>Cancel</Button>
          <Button onClick={handleMakeOffer} variant="contained" disabled={!offerAmount}>
            Send Offer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Listing</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Report target"
            value={reportTarget}
            onChange={(e) => setReportTarget(e.target.value)}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
            SelectProps={{ native: true }}
          >
            <option value="listing">Listing</option>
            <option value="seller">Seller</option>
          </TextField>
          <TextField
            select
            label="Reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
            SelectProps={{ native: true }}
          >
            <option value="">Select a reason</option>
            <option value="prohibited">Prohibited item</option>
            <option value="scam">Suspected scam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="duplicate">Duplicate listing</option>
            <option value="other">Other</option>
          </TextField>
          <TextField
            label="Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button onClick={handleReport} variant="contained" color="error" disabled={!reportReason}>
            Submit Report
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
