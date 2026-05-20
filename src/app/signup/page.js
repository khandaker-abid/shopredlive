'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Divider, Container, Alert, Chip } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProofOfWorkCaptcha from '../../components/ProofOfWorkCaptcha';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  const isSbuEmail = email.toLowerCase().endsWith('@stonybrook.edu') ||
                     email.toLowerCase().endsWith('.stonybrook.edu');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!captcha) {
      setError('Please wait for the security challenge to finish.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first: firstName,
          last: lastName,
          username: username,
          email: email,
          password: password,
          captcha
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      login(data.user);
      router.push('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
              maxWidth: 400,
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
                  Create a new account
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    margin="normal"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    margin="normal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText={
                    email && (
                      isSbuEmail
                        ? <Chip label="SBU Email - Verified Status" size="small" color="success" sx={{ mt: 0.5 }} />
                        : "Use @stonybrook.edu for verified student status"
                    )
                  }
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

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <ProofOfWorkCaptcha purpose="register" onSolved={setCaptcha} />

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
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>

              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Divider sx={{ marginY: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/login')}
                sx={{
                  marginBottom: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '16px',
                  padding: 1.2,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(139, 0, 0, 0.04)',
                  },
                }}
              >
                Already have an account? Log In
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
