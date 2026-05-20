'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Card, CardContent, Container, Divider, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import StripeCheckoutForm from '../../components/StripeCheckoutForm';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = searchParams.get('productId');

  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: 'Stony Brook',
    state: 'NY',
    postalCode: '',
    country: 'US'
  });
  const [clientSecret, setClientSecret] = useState('');
  const [riskFlags, setRiskFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/checkout';
    }
    return `${window.location.origin}/checkout?status=success`;
  }, []);

  const startCheckout = async () => {
    if (!user?._id || !productId) {
      setMessage('Missing product or user session.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user._id,
          productId,
          shippingAddress,
          returnUrl
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to start checkout');
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setRiskFlags(data.riskFlags || []);
      setMessage(data.requiresReview ? 'This checkout is flagged for manual review.' : 'Payment ready.');
    } catch (error) {
      setMessage(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Secure Checkout
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Stripe Connect-powered managed payments keep the buyer on site while supporting Apple Pay and Google Pay.
          </Typography>

          {message ? <Alert severity={riskFlags.length ? 'warning' : 'info'} sx={{ mb: 2 }}>{message}</Alert> : null}

          {!clientSecret ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Address line 1"
                value={shippingAddress.line1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                fullWidth
              />
              <TextField
                label="Address line 2"
                value={shippingAddress.line2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                fullWidth
              />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <TextField
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <TextField
                  label="Postal code"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  fullWidth
                />
              </Box>

              <Button variant="contained" onClick={startCheckout} disabled={loading || !productId}>
                {loading ? 'Starting checkout...' : 'Continue to payment'}
              </Button>

              <Divider />
              <Button variant="text" onClick={() => router.push(`/listing/${productId}`)}>
                Back to listing
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Alert severity="success">Checkout session created for order {orderId}.</Alert>
              <StripeCheckoutForm
                clientSecret={clientSecret}
                returnUrl={returnUrl}
                onSuccess={() => setMessage('Payment completed. Your order is being finalized.')}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <CheckoutContent />
      </Box>
    </ProtectedRoute>
  );
}