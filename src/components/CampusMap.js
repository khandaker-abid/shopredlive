'use client';

import { Box, Button, Typography } from '@mui/material';

const CAMPUS_POINTS = [
  { id: 'Main Campus', label: 'Main', x: '18%', y: '30%' },
  { id: 'South Campus', label: 'South', x: '65%', y: '55%' },
  { id: 'East Campus', label: 'East', x: '75%', y: '25%' },
  { id: 'West Campus', label: 'West', x: '10%', y: '60%' },
  { id: 'HSC Campus', label: 'HSC', x: '45%', y: '75%' }
];

export default function CampusMap({ selected, onSelect }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Campus Map
      </Typography>
      <Box
        sx={{
          position: 'relative',
          height: 170,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(139,0,0,0.1), rgba(33,33,33,0.4))'
        }}
      >
        {CAMPUS_POINTS.map((point) => {
          const isSelected = selected === point.id;
          return (
            <Button
              key={point.id}
              size="small"
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => onSelect?.(point.id)}
              sx={{
                position: 'absolute',
                left: point.x,
                top: point.y,
                transform: 'translate(-50%, -50%)',
                minWidth: 0,
                px: 1,
                py: 0.25,
                fontSize: '0.7rem'
              }}
            >
              {point.label}
            </Button>
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Locations are campus-level to keep meetups safe.
      </Typography>
    </Box>
  );
}
