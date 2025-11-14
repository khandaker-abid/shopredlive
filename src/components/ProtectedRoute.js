'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/login');
      } else if (!requireAuth && user) {
        router.push('/'); // Redirect logged-in users away from login/signup pages
      }
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If it's a protected route and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null; // The redirect happens in useEffect
  }

  // If it's a public route and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null; // The redirect happens in useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;