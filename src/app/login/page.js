'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Divider, Container, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!data.validEmail) {
        setError('Email not found');
        return;
      }
      if (!data.validPassword) {
        setError('Invalid password');
        return;
      }

      const userRes = await fetch(`${BACKEND_URL}/user/${data.userId}`);
      const userData = await userRes.json();

      login(userData);
      router.push('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              maxWidth: 350,
              margin: 'auto',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <CardContent sx={{ padding: 4 }}>
              <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: 'text.primary', marginBottom: 1 }}
                >
                  ShopRedLive
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to continue
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '16px',
                    padding: 1.2,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'primary.dark' },
                  }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Divider sx={{ marginY: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
              </Box>

              <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Sign up
                  </Link>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Use your @stonybrook.edu email for verified status
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
