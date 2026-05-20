'use client';

import { useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ onSuccess, returnUrl }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl
      },
      redirect: 'if_required'
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setLoading(false);
      return;
    }

    onSuccess?.(result.paymentIntent || null);
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
      <PaymentElement />
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button type="submit" disabled={!stripe || loading} variant="contained" size="large">
        {loading ? 'Processing...' : 'Pay securely'}
      </Button>
    </Box>
  );
}

export default function StripeCheckoutForm({ clientSecret, returnUrl, onSuccess }) {
  if (!clientSecret) {
    return null;
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Alert severity="warning">
        Stripe publishable key is not configured.
      </Alert>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#8B0000'
          }
        }
      }}
    >
      <PaymentForm onSuccess={onSuccess} returnUrl={returnUrl} />
    </Elements>
  );
}