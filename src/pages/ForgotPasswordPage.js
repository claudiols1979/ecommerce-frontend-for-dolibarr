import React, { useState } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress,
  Card, CardContent, Link as MuiLink, Alert, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';

// Iconos
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await forgotPassword(email);
    
    if (result.success) {
      toast.success(result.message || 'Si el correo existe, recibirás un enlace de reseteo.');
      setMessage(result.message || 'Si tu correo está registrado, recibirás las instrucciones en breve.');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  // Estilos consistentes con LoginPage
  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 2,
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '8px',
    color: 'common.black',
    backgroundColor: '#FFD700',
    boxShadow: '0 4px 15px 0 rgba(255, 215, 0, 0.4)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#FFC700',
      boxShadow: '0 6px 20px 0 rgba(255, 215, 0, 0.5)',
      transform: 'translateY(-2px)',
    },
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '& .MuiInputBase-input': { color: 'white' },
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
      '&:hover fieldset': { borderColor: '#FFD700' },
      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #121212 30%, #282828 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Container maxWidth="xs">
        <Card sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 4, 
          boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.5)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent>
            <AuthBranding />
            <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 1, fontWeight: 600, color: 'white' }}>
              Restablecer Contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
              Ingresa tu correo y te enviaremos un enlace.
            </Typography>

            {message ? (
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3, bgcolor: 'success.dark', color: 'white' }}>{message}</Alert>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryButtonStyle}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Enviar Enlace'}
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <MuiLink component={RouterLink} to="/login" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#FFD700' } }}>
                Volver a Iniciar Sesión
              </MuiLink>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;