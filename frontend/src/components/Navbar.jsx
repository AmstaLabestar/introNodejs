import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  ThemeProvider,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Message,
  Notifications,
  Person,
  Logout as LogoutIcon
} from '@mui/icons-material';
import muiTheme from '../theme/muiTheme';
import api from '../services/api';

export function Navbar() {
  const { user, logout, isLoggedIn } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadMessages(0);
      setUnreadNotifications(0);
      return undefined;
    }

    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const [notificationsRes, messagesRes] = await Promise.all([
          api.get('/notifications', { params: { page: 1, limit: 1 } }),
          api.get('/messages', { params: { page: 1, limit: 20 } })
        ]);

        const unreadTotal = notificationsRes.data?.unreadTotal || 0;
        const conversations = messagesRes.data?.data || [];
        const unreadMessagesCount = conversations.reduce(
          (sum, conv) => sum + (Number(conv.unreadCount) || 0),
          0
        );

        if (isMounted) {
          setUnreadNotifications(unreadTotal);
          setUnreadMessages(unreadMessagesCount);
        }
      } catch (err) {
        // Silence polling errors to avoid breaking navigation UI
      }
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 30000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const wrapIcon = (icon, count) => (
    <Badge color="error" badgeContent={count} max={99} invisible={!count}>
      {icon}
    </Badge>
  );

  const navigationItems = [
    { label: 'Feed', path: '/feed', icon: <Home /> },
    { label: 'Messages', path: '/messages', icon: wrapIcon(<Message />, unreadMessages) },
    { label: 'Notifications', path: '/notifications', icon: wrapIcon(<Notifications />, unreadNotifications) },
    { label: 'Profil', path: `/profile/${user?.id}`, icon: <Person /> }
  ];

  return (
    <ThemeProvider theme={muiTheme}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/feed"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: isMobile ? 1 : 0
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Home sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            {!isMobile && (
              <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
                SocialHub
              </Typography>
            )}
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                onClick={handleLogout}
                color="inherit"
                startIcon={<LogoutIcon />}
                sx={{
                  bgcolor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.dark'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box
          sx={{
            width: 250,
            bgcolor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              SocialHub
            </Typography>
          </Box>
          <Divider />

          <List sx={{ flex: 1 }}>
            {navigationItems.map((item) => (
              <ListItem
                key={item.path}
                component={RouterLink}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>

          <Divider />
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              bgcolor: 'error.light',
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}

export default Navbar;
