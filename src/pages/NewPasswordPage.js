import React, { useState } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress,
  Card, CardContent, Link as MuiLink, Alert, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';

// Iconos
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const NewPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const theme = useTheme();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    
    if (result.success) {
      toast.success(result.message);
      setMessage(result.message);
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  // Estilos consistentes
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
            <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600, color: 'white' }}>
              Establecer Nueva Contraseña
            </Typography>

            {message ? (
              <Box textAlign="center">
                <Alert severity="success" sx={{ mb: 3, bgcolor: 'success.dark', color: 'white' }}>{message}</Alert>
                <Button
                  variant="contained"
                  sx={primaryButtonStyle}
                  onClick={() => navigate('/login')}
                >
                  Ir a Iniciar Sesión
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Nueva Contraseña"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryButtonStyle}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Restablecer Contraseña'}
                </Button>
                {/* --- ENLACE AÑADIDO --- */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <MuiLink component={RouterLink} to="/login" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#FFD700' } }}>
                    Volver a Iniciar Sesión
                  </MuiLink>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NewPasswordPage;