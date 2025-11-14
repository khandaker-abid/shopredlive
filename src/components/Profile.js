'use client';

import { useState } from 'react';
import { 
  Box, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Typography, 
  Divider, 
  Avatar,
  IconButton,
  TextField,
  Button,
  InputAdornment,
  Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    bio: 'Campus marketplace user',
    location: 'University City'
  });
  
  if (!user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh',
          backgroundColor: 'background.default',
          padding: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.primary" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <a href="/login" style={{ color: 'primary.main', textDecoration: 'none' }}>Log in</a> or{' '}
            <a href="/signup" style={{ color: 'primary.main', textDecoration: 'none' }}>Sign up</a> to access your account
          </Typography>
        </Box>
      </Box>
    );
  }

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
    alert('Profile updated successfully!');
  };

  const renderProfileContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <Paper 
            sx={{ 
              padding: 3, 
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  marginBottom: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {profileData.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
              </Avatar>
              {isEditing ? (
                <TextField
                  fullWidth
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
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
              ) : (
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    textAlign: 'center',
                    marginBottom: 1
                  }}
                >
                  {profileData.name}
                </Typography>
              )}
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ textAlign: 'center' }}
              >
                @{user.email?.split('@')[0] || 'user'}
              </Typography>
            </Box>

            <Divider sx={{ marginBottom: 2 }} />

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
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
                  label="Bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  variant="outlined"
                  multiline
                  rows={3}
                  fullWidth
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
                  label="Location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      color: 'text.secondary',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
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
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ color: 'text.secondary', marginRight: 1 }} />
                  <Typography variant="body1" color="text.primary">
                    {profileData.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 0.5 }}>
                    Bio
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {profileData.bio}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'text.secondary', marginRight: 1 }} />
                  <Typography variant="body1" color="text.primary">
                    {profileData.location}
                  </Typography>
                </Box>
              </Box>
            )}

            {isEditing ? (
              <Box sx={{ display: 'flex', gap: 1, marginTop: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    flex: 1,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    padding: 1,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    padding: 1,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      color: 'primary.dark',
                    },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                variant="outlined"
                fullWidth
                sx={{
                  marginTop: 3,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  padding: 1,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(139, 0, 0, 0.04)',
                  },
                }}
              >
                Edit Profile
              </Button>
            )}
          </Paper>
        );
      case 'listings':
        return (
          <Paper 
            sx={{ 
              padding: 3, 
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              My Listings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't listed any items yet.
            </Typography>
            <Button
              component="a"
              href="/sell"
              variant="contained"
              sx={{
                marginTop: 2,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'bold',
                textTransform: 'none',
                padding: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Create New Listing
            </Button>
          </Paper>
        );
      case 'saved':
        return (
          <Paper 
            sx={{ 
              padding: 3, 
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Saved Items
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't saved any items yet.
            </Typography>
          </Paper>
        );
      case 'orders':
        return (
          <Paper 
            sx={{ 
              padding: 3, 
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', marginBottom: 2 }}>
              Order History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have any orders yet.
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      height: '75vh',
      backgroundColor: 'background.default',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <Paper 
        sx={{ 
          width: { xs: '100%', md: 280 },
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ padding: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              fontSize: '1.2rem'
            }}
          >
            Account
          </Typography>
        </Box>
        
        <List sx={{ flex: 1 }}>
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              sx={{ 
                paddingX: 2,
                borderRadius: 1,
                backgroundColor: activeTab === 'profile' ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText 
                primary="Profile" 
                primaryTypographyProps={{ 
                  color: 'text.primary',
                  sx: { fontWeight: activeTab === 'profile' ? 'bold' : 'medium' }
                }} 
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeTab === 'listings'}
              onClick={() => setActiveTab('listings')}
              sx={{ 
                paddingX: 2,
                borderRadius: 1,
                backgroundColor: activeTab === 'listings' ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText 
                primary="My Listings" 
                primaryTypographyProps={{ 
                  color: 'text.primary',
                  sx: { fontWeight: activeTab === 'listings' ? 'bold' : 'medium' }
                }} 
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
              sx={{ 
                paddingX: 2,
                borderRadius: 1,
                backgroundColor: activeTab === 'saved' ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText 
                primary="Saved" 
                primaryTypographyProps={{ 
                  color: 'text.primary',
                  sx: { fontWeight: activeTab === 'saved' ? 'bold' : 'medium' }
                }} 
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              sx={{ 
                paddingX: 2,
                borderRadius: 1,
                backgroundColor: activeTab === 'orders' ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText 
                primary="Orders" 
                primaryTypographyProps={{ 
                  color: 'text.primary',
                  sx: { fontWeight: activeTab === 'orders' ? 'bold' : 'medium' }
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      {/* Profile Content */}
      <Box sx={{ flex: 1, padding: 1 }}>
        {renderProfileContent()}
      </Box>
    </Box>
  );
}


