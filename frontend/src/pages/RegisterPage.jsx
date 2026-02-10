import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  ThemeProvider
} from '@mui/material';
import { Person, Mail, Lock } from '@mui/icons-material';
import muiTheme from '../theme/muiTheme';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { user, token } = response.data;
      register(user, token);
      toast.success('Inscription réussie!');
      navigate('/feed');
    } catch (err) {
      const details = err.response?.data?.details;
      const detailsMessage = Array.isArray(details)
        ? details.map((detail) => detail.message).join(' | ')
        : null;
      const errorMessage = detailsMessage || err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0f2fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h1" sx={{ color: 'primary.main', mb: 1 }}>
              SocialHub
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Rejoignez notre communauté
            </Typography>
          </Box>

          {/* Form Card */}
          <Card sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Username */}
              <TextField
                fullWidth
                label="Pseudonyme"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="votre_pseudo"
                required
                helperText="Lettres, chiffres et underscore uniquement"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'primary.light' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Email */}
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail sx={{ color: 'primary.light' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                helperText="Min. 6 caractères"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.light' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirm Password */}
              <TextField
                fullWidth
                label="Confirmer mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.light' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'S\'inscrire'}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Déjà inscrit ?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default RegisterPage;
