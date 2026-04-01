"use client";
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import NotificationBell from './NotificationBell';

export default function Header() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQ(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set('q', q);
      } else if (searchParams.get('q')) {
        params.delete('q');
      }

      if (params.toString() !== searchParams.toString()) {
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [q, router, searchParams, pathname]);

  const handleLogout = () => {
    logout();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#121212',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography component={Link} href="/" variant="h6" sx={{ fontWeight: 800, color: 'text.primary', textDecoration: 'none' }}>
          ShopRedLive
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search items"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: '#1e1e1e',
                borderRadius: '20px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                }
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                py: '8px',
                px: '12px',
              }
            }}
          />
        </Box>
        <Button component={Link} href="/sell" color="secondary">Sell</Button>
        <Button component={Link} href="/messages" color="secondary">Messages</Button>
        {user ? (
          <>
            <Button component={Link} href="/profile" color="secondary">
              {user.name || 'Profile'}
            </Button>
            <Button onClick={handleLogout} color="secondary">
              Logout
            </Button>
            <NotificationBell />
          </>
        ) : (
          <>
            <Button component={Link} href="/login" color="secondary">Login</Button>
            <Button component={Link} href="/signup" color="secondary" variant="contained" sx={{ color: 'primary.contrastText' }}>
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


