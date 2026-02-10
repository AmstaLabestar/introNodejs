import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Badge,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Stack
} from '@mui/material';
import { Send } from '@mui/icons-material';

const MessagesPage = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const messagesEndRef = useRef(null);

  const getId = (value) => (value && typeof value === 'object' ? value._id : value);

  const loadConversations = async () => {
    setLoadingConversations(true);
    setError('');
    try {
      const response = await api.get('/messages', { params: { page: 1, limit: 20 } });
      setConversations(response.data?.data || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des conversations';
      setError(message);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/auth');
      const list = (response.data || []).filter((item) => item._id !== user?.id);
      setUsers(list);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(message);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await api.get('/notifications/online-status');
      setStatusMap(response.data?.data || {});
    } catch (err) {
      // Ignore status errors
    }
  };

  const loadMessages = async (userId) => {
    if (!userId) return;
    setLoadingMessages(true);
    setError('');
    try {
      const response = await api.get(`/messages/${userId}`, { params: { page: 1, limit: 50 } });
      const data = response.data?.data || [];

      const unread = data.filter(
        (msg) => !msg.isRead && getId(msg.recipient)?.toString() === user?.id
      );

      if (unread.length > 0) {
        await Promise.all(unread.map((msg) => api.patch(`/messages/${msg._id}/read`)));
      }

      const unreadIds = new Set(unread.map((msg) => msg._id));
      const normalized = data.map((msg) => (unreadIds.has(msg._id) ? { ...msg, isRead: true } : msg));
      setMessages(normalized.slice().reverse());
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des messages';
      setError(message);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
    loadStatus();
    const intervalId = setInterval(loadStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (selectedUser?.userId) {
      loadMessages(selectedUser.userId);
    }
  }, [selectedUser?.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conv) => conv.username?.toLowerCase().includes(term));
  }, [conversations, search]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.username?.toLowerCase().includes(term));
  }, [users, search]);

  const handleSelectConversation = (conv) => {
    setSelectedUser({ userId: conv.userId, username: conv.username, email: conv.email });
    setSelectedUserId(conv.userId);
  };

  const handleStartConversation = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    const found = users.find((item) => item._id === userId);
    if (found) {
      setSelectedUser({ userId: found._id, username: found.username, email: found.email });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser?.userId) {
      setError('Sélectionne un utilisateur pour envoyer un message.');
      return;
    }
    const content = messageInput.trim();
    if (!content) return;

    try {
      await api.post('/messages', { content, recipientId: selectedUser.userId });
      setMessageInput('');
      await loadMessages(selectedUser.userId);
      await loadConversations();
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi du message';
      setError(message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" sx={{ mb: 3, color: 'primary.main' }}>
        Messages
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
          gap: 2
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Conversations
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
              label="Nouveau message"
              value={selectedUserId}
              onChange={handleStartConversation}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Choisir un utilisateur</MenuItem>
              {filteredUsers.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.username}
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ mb: 2 }} />

            {loadingConversations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List>
                {conversations.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aucune conversation pour l’instant.
                  </Typography>
                )}
                {filteredConversations.map((conv) => {
                  const status = statusMap[conv.userId];
                  return (
                  <ListItemButton
                    key={conv.userId}
                    selected={selectedUser?.userId === conv.userId}
                    onClick={() => handleSelectConversation(conv)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: status?.isOnline ? 'success.main' : 'grey.400'
                            }}
                          />
                          <Typography variant="subtitle2">{conv.username}</Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {conv.lastMessage}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {conv.lastMessageTime
                              ? formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })
                              : ''}
                          </Typography>
                        </Box>
                      }
                    />
                    {conv.unreadCount > 0 && (
                      <Badge color="error" badgeContent={conv.unreadCount} />
                    )}
                  </ListItemButton>
                )})}
              </List>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                {selectedUser ? `Conversation avec ${selectedUser.username}` : 'Choisis un contact'}
              </Typography>
              {selectedUser?.email && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedUser.email}
                </Typography>
              )}
              {selectedUser?.userId && statusMap[selectedUser.userId] && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {statusMap[selectedUser.userId].isOnline
                    ? 'En ligne'
                    : statusMap[selectedUser.userId].lastSeen
                      ? `Vu ${formatDistanceToNow(new Date(statusMap[selectedUser.userId].lastSeen), { addSuffix: true })}`
                      : 'Hors ligne'}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box sx={{ flex: 1, minHeight: 260, maxHeight: 420, overflowY: 'auto', py: 2 }}>
              {loadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack spacing={1}>
                  {messages.length === 0 && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Aucun message pour le moment.
                    </Typography>
                  )}
                  {messages.map((msg) => {
                    const isMine = getId(msg.sender)?.toString() === user?.id;
                    return (
                      <Box
                        key={msg._id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: isMine ? 'primary.main' : 'grey.200',
                            color: isMine ? 'white' : 'text.primary',
                            maxWidth: '75%'
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                        </Typography>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Écrire un message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                startIcon={<Send />}
                disabled={!messageInput.trim()}
              >
                Envoyer
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default MessagesPage;
