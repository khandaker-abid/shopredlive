"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Paper, Typography, List, ListItem, ListItemButton, useTheme } from '@mui/material';

export default function Sidebar() {
  const theme = useTheme();
  const categories = ['All', 'Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Tickets'];
  const searchParams = useSearchParams();
  const active = (searchParams.get('category') || 'All');
  
  return (
    <Paper 
      sx={{ 
        width: 240, 
        padding: 1.5, 
        backgroundColor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius}px`
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700, 
          marginBottom: 1, 
          color: 'text.primary',
          fontSize: '1rem'
        }}
      >
        Categories
      </Typography>
      <List sx={{ padding: 0, margin: 0 }}>
        {categories.map((c) => {
          const params = new URLSearchParams(searchParams.toString());
          if (c === 'All') params.delete('category'); else params.set('category', c);
          const href = `/?${params.toString()}`;
          const isActive = active === c || (c === 'All' && !searchParams.get('category'));
          return (
            <ListItem key={c} disablePadding>
              <ListItemButton
                component={Link}
                href={href}
                sx={{
                  padding: '8px',
                  borderRadius: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  }
                }}
              >
                {c}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}


