'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  TextField,
  Avatar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import FlagIcon from '@mui/icons-material/Flag';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      fetchConversations();
      pollIntervalRef.current = setInterval(fetchConversations, 10000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [user]);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages(selectedConvo._id);
      markAsRead(selectedConvo._id);
    }
  }, [selectedConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/conversations/${user._id}`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/conversation/${convoId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (convoId) => {
    try {
      await fetch(`${BACKEND_URL}/conversation/${convoId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvo || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/conversation/${selectedConvo._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user._id, body: newMessage })
      });
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleReport = async () => {
    try {
      const other = getOtherParticipant(selectedConvo);
      if (!other?._id) return;
      await fetch(`${BACKEND_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user._id,
          targetUserId: other._id,
          reason: reportReason,
          details: reportDetails
        })
      });
      setReportOpen(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error('Error reporting user:', error);
    }
  };

  const getOtherParticipant = (convo) => {
    return convo.participants?.find(p => p._id !== user._id) || {};
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

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

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      height: '75vh',
      backgroundColor: 'background.default',
      borderRadius: 2,
      overflow: 'hidden'
    }}>
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
            sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.2rem' }}
          >
            Messages
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ padding: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No conversations yet</Typography>
          </Box>
        ) : (
          <List sx={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map((convo) => {
              const other = getOtherParticipant(convo);
              const hasUnread = convo.lastMessageAt &&
                messages.some(m => !m.readBy?.includes(user._id) && m.sender._id !== user._id);
              return (
                <ListItem
                  key={convo._id}
                  disablePadding
                  onClick={() => setSelectedConvo(convo)}
                  sx={{
                    backgroundColor: selectedConvo?._id === convo._id ? 'action.selected' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                    paddingY: 1
                  }}
                >
                  <ListItemButton sx={{ paddingX: 1, borderRadius: 1 }}>
                    <Avatar
                      src={other.profilePic}
                      sx={{ width: 50, height: 50, marginRight: 2, bgcolor: 'primary.main' }}
                    >
                      {other.actualName?.charAt(0) || other.name?.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: hasUnread ? 'bold' : 'medium',
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {other.actualName || other.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', marginLeft: 1 }}>
                            {convo.lastMessageAt ? formatTime(convo.lastMessageAt) : ''}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: hasUnread ? 'text.primary' : 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {convo.product?.name && <span style={{ fontStyle: 'italic' }}>Re: {convo.product.name} - </span>}
                            {convo.lastMessage || 'No messages yet'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {selectedConvo ? (
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
              src={getOtherParticipant(selectedConvo).profilePic}
              sx={{ width: 40, height: 40, marginRight: 2, bgcolor: 'primary.main' }}
            >
              {getOtherParticipant(selectedConvo).actualName?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {getOtherParticipant(selectedConvo).actualName || getOtherParticipant(selectedConvo).name}
              </Typography>
              {selectedConvo.product && (
                <Typography variant="caption" color="text.secondary">
                  About: {selectedConvo.product.name} - ${selectedConvo.product.price}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setReportOpen(true)} aria-label="Report user">
              <FlagIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              padding: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg._id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                  marginBottom: 2
                }}
              >
                <Box
                  sx={{
                    maxWidth: '75%',
                    padding: 1.5,
                    borderRadius: 2,
                    backgroundColor: msg.sender._id === user._id ? 'primary.main' : 'background.paper',
                    color: msg.sender._id === user._id ? 'primary.contrastText' : 'text.primary',
                    border: msg.sender._id === user._id ? 'none' : '1px solid',
                    borderColor: msg.sender._id === user._id ? 'transparent' : 'divider',
                  }}
                >
                  <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
                    {msg.body}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', textAlign: 'right', marginTop: 0.5, opacity: 0.7 }}
                  >
                    {formatTime(msg.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

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
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={sending}
              InputProps={{
                sx: {
                  backgroundColor: 'action.input',
                  borderRadius: 50,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      sx={{
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { backgroundColor: 'primary.dark' },
                        '&:disabled': { backgroundColor: 'action.disabledBackground' }
                      }}
                    >
                      {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
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

      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report user</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Select a reason</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="scam">Suspected scam</option>
            <option value="other">Other</option>
          </TextField>
          <TextField
            label="Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReport} disabled={!reportReason}>
            Submit report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
