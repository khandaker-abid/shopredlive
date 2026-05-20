'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material';
import ProtectedRoute from '../../components/ProtectedRoute';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email && token && newPassword.length >= 6, [email, token, newPassword]);

  const submit = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }
      setMessage('Password updated. Redirecting to login.');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete the password reset using the emailed token.
            </Typography>

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}

            <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="Reset token" fullWidth value={token} onChange={(e) => setToken(e.target.value)} sx={{ mb: 2 }} />
            <TextField label="New password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth disabled={!canSubmit || loading} onClick={submit}>
              {loading ? 'Saving...' : 'Update password'}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </ProtectedRoute>
  );
}
