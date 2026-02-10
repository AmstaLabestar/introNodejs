import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { Done, Delete } from '@mui/icons-material';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/notifications', { params: { page, limit: 20 } });
      setNotifications(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ color: 'primary.main' }}>
          Notifications
        </Typography>
        <Button variant="outlined" onClick={markAllAsRead}>
          Tout marquer comme lu
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <List>
              {notifications.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Aucune notification.
                </Typography>
              )}
              {notifications.map((notification) => (
                <ListItem key={notification._id} sx={{ alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {notification.type === 'message'
                            ? `Message de ${notification.sender?.username || 'Utilisateur'}`
                            : `Nouvel abonné: ${notification.sender?.username || 'Utilisateur'}`}
                        </Typography>
                        {!notification.isRead && <Chip label="Nouveau" color="primary" size="small" />}
                      </Stack>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {notification.type === 'message' && notification.messageId?.content && (
                          <Typography variant="body2">{notification.messageId.content}</Typography>
                        )}
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {notification.createdAt
                            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                            : ''}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!notification.isRead && (
                      <IconButton color="primary" onClick={() => markAsRead(notification._id)}>
                        <Done />
                      </IconButton>
                    )}
                    <IconButton color="error" onClick={() => deleteNotification(notification._id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2">
            Page {pagination.page} / {pagination.totalPages}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default NotificationsPage;
