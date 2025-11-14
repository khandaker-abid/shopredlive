'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Divider, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // For now, simulate a login process
    // In a real app, you would call an API to authenticate the user
    const userData = {
      id: 1,
      email: email,
      name: email.split('@')[0], // Use part of email as name for demo
      avatar: null
    };

    login(userData);
    router.push('/'); // Redirect to home after login
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 1,
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: null
    };
    login(demoUser);
    router.push('/');
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
                  sx={{ 
                    fontWeight: 800, 
                    color: 'text.primary',
                    marginBottom: 1
                  }}
                >
                  ShopRedLive
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to continue
                </Typography>
              </Box>

              {error && (
                <Typography color="error" variant="body2" align="center" sx={{ marginBottom: 2 }}>
                  {error}
                </Typography>
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
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
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
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Log In
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
                onClick={handleDemoLogin}
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
                Continue as Demo User
              </Button>

              <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    underline="hover"
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}