'use client';

import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProductGrid from '../components/ProductGrid';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // If not authenticated, the redirect will happen via useEffect
  // So we don't render the page content until redirect occurs
  if (!user && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Loading...
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        padding: 2, 
        alignItems: 'flex-start',
        flex: 1,
        backgroundColor: 'background.default'
      }}>
        <Sidebar />
        <Box sx={{ 
          flex: 1,
          backgroundColor: 'background.default'
        }}>
          <ProductGrid />
        </Box>
      </Box>
    </Box>
  );
}


