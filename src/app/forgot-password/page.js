'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material';
import ProofOfWorkCaptcha from '../../components/ProofOfWorkCaptcha';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captcha })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Password reset request failed');
      }

      setMessage(data.message || 'If the account exists, a reset email was queued.');
      if (data.resetToken) {
        setMessage(`${data.message || 'Password reset queued.'} Dev token: ${data.resetToken}`);
      }
    } catch (err) {
      setError(err.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Request a reset link protected by CAPTCHA.
              </Typography>

              {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
              {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}

              <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              <ProofOfWorkCaptcha purpose="password-reset" onSolved={setCaptcha} />
              <Button variant="contained" fullWidth onClick={submitReset} disabled={loading || !captcha || !email} sx={{ mt: 2 }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
              <Button variant="text" fullWidth onClick={() => router.push('/login')} sx={{ mt: 1 }}>
                Back to login
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}