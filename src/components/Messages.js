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
  TextField, 
  Button, 
  Avatar,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SendIcon from '@mui/icons-material/Send';

export default function Messages() {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState(null);
  
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
            Please log in to view your messages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <a href="/login" style={{ color: 'primary.main', textDecoration: 'none' }}>Log in</a> or{' '}
            <a href="/signup" style={{ color: 'primary.main', textDecoration: 'none' }}>Sign up</a> to access your messages
          </Typography>
        </Box>
      </Box>
    );
  }

  // Sample thread data
  const threads = [
    { id: '1', with: 'Alice Johnson', last: 'Is this still available?', time: '2m ago', unread: true },
    { id: '2', with: 'Bob Smith', last: 'Can pick up tomorrow', time: '1h ago', unread: false },
    { id: '3', with: 'Charlie Brown', last: 'When can you meet?', time: '3h ago', unread: true },
    { id: '4', with: 'Diana Prince', last: 'Thanks for the purchase!', time: '1d ago', unread: false },
    { id: '5', with: 'Eve Wilson', last: 'Is the price negotiable?', time: '2d ago', unread: false },
  ];

  // Sample messages for the selected thread
  const [messages, setMessages] = useState({
    '1': [
      { id: 1, text: 'Hi, is this still available?', sender: 'Alice Johnson', time: '10:30 AM', sentByUser: false },
      { id: 2, text: 'Yes, it\'s still available!', sender: user.name || 'You', time: '10:32 AM', sentByUser: true },
      { id: 3, text: 'Great! Can I pick it up tomorrow?', sender: 'Alice Johnson', time: '10:33 AM', sentByUser: false },
      { id: 4, text: 'Sure, what time works for you?', sender: user.name || 'You', time: '10:35 AM', sentByUser: true },
    ],
    '2': [
      { id: 1, text: 'Hey, can I pick this up tomorrow?', sender: 'Bob Smith', time: '9:15 AM', sentByUser: false },
      { id: 2, text: 'Yes, I\'ll be available after 3pm', sender: user.name || 'You', time: '9:18 AM', sentByUser: true },
    ]
  });

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      // In a real app, this would send to backend
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: user.name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentByUser: true
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedThread.id]: [...(prev[selectedThread.id] || []), newMsg]
      }));
      
      setNewMessage('');
    }
  };

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
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
      {/* Thread List */}
      <Paper 
        sx={{ 
          width: { xs: '100%', md: 320 },
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
            Messages
          </Typography>
        </Box>
        
        <List sx={{ flex: 1, overflowY: 'auto' }}>
          {threads.map((t) => (
            <ListItem 
              key={t.id} 
              disablePadding
              onClick={() => handleSelectThread(t)}
              sx={{
                backgroundColor: selectedThread?.id === t.id ? 'action.selected' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                paddingY: 1
              }}
            >
              <ListItemButton 
                sx={{ 
                  paddingX: 1,
                  borderRadius: 1
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    marginRight: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  {t.with.charAt(0)}
                </Avatar>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        component="span"
                        sx={{
                          fontWeight: t.unread ? 'bold' : 'medium',
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {t.with}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          marginLeft: 1
                        }}
                      >
                        {t.time}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          color: t.unread ? 'text.primary' : 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {t.last}
                      </Typography>
                      {t.unread && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            marginLeft: 1
                          }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      {selectedThread ? (
        <Paper 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0
          }}
        >
          {/* Chat Header */}
          <Box 
            sx={{ 
              padding: 2, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                marginRight: 2,
                bgcolor: 'primary.main'
              }}
            >
              {selectedThread.with.charAt(0)}
            </Avatar>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                flexGrow: 1
              }}
            >
              {selectedThread.with}
            </Typography>
          </Box>

          {/* Messages */}
          <Box 
            sx={{ 
              flex: 1, 
              padding: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {(messages[selectedThread.id] || []).map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sentByUser ? 'flex-end' : 'flex-start',
                  marginBottom: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: 1.5,
                    borderRadius: 2,
                    backgroundColor: msg.sentByUser ? 'primary.main' : 'background.paper',
                    color: msg.sentByUser ? 'primary.contrastText' : 'text.primary',
                    border: msg.sentByUser ? 'none' : `1px solid`,
                    borderColor: msg.sentByUser ? 'transparent' : 'divider',
                  }}
                >
                  <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                    {msg.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'right', 
                      marginTop: 0.5,
                      opacity: 0.7 
                    }}
                  >
                    {msg.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Message Input */}
          <Box 
            sx={{ 
              padding: 2, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                sx: {
                  backgroundColor: 'action.input',
                  borderRadius: 50,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSendMessage}
                      sx={{ 
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Paper 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h6" color="text.primary" gutterBottom>
            Select a conversation
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Choose a chat from the list to start messaging
          </Typography>
        </Paper>
      )}
    </Box>
  );
}


