'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, Typography, TextField, Button, Link, Divider, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
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

    // For now, simulate a signup process
    const userData = {
      id: Date.now(), // Simple ID generation for demo
      email: email,
      name: name,
      avatar: null
    };

    login(userData);
    router.push('/'); // Redirect to home after signup
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
                  Create a new account
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
                  label="Full Name"
                  type="text"
                  variant="outlined"
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
            
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Sign Up
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