import React, { useState } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress,
  Card, CardContent, Link as MuiLink, Alert, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';
import { Helmet } from 'react-helmet-async';

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

  return (
    <>
      <Helmet>
        <title>Nueva Contraseña - Software Factory ERP</title>
        <meta name="description" content="Establece una nueva contraseña para tu cuenta de revendedor." />
      </Helmet>
      
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'white',
        py: { xs: 4, md: 8 },
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <Card sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 4, 
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(148, 145, 145, 0.3)'
          }}>
            <CardContent>
              <AuthBranding />
              <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mb: 2, fontWeight: 700, color: '#263C5C' }}>
                Establecer Nueva Contraseña
              </Typography>

              {message ? (
                <Box textAlign="center">
                  <Alert severity="success" sx={{ mb: 3, bgcolor: 'success.light', color: 'black' }}>
                    {message}
                  </Alert>
                  <Button
                    variant="contained"
                    sx={{
                      p: 1.5,
                      mb: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      borderRadius: '8px',
                      color: 'white',
                      backgroundColor: '#263C5C',
                      '&:hover': {
                        backgroundColor: '#1E2E45',
                      },
                    }}
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
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                    InputProps={{ 
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} /> 
                    }}
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
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                    InputProps={{ 
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} /> 
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      p: 1.5,
                      mb: 2,
                      mt: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      borderRadius: '8px',
                      color: 'white',
                      backgroundColor: '#263C5C',
                      '&:hover': {
                        backgroundColor: '#1E2E45',
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Restablecer Contraseña'}
                  </Button>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <MuiLink component={RouterLink} to="/login" underline="hover" sx={{ color: '#263C5C', '&:hover': { color: '#1E2E45' } }}>
                      Volver a Iniciar Sesión
                    </MuiLink>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default NewPasswordPage;