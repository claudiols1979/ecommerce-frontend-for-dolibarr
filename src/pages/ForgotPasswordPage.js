import React, { useState } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress,
  Card, CardContent, Link as MuiLink, Alert, Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

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

  // Nuevos estilos que coinciden con PrivacyPolicyPage
  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 2,
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: '#263C5C',
    boxShadow: '0 4px 15px 0 rgba(38, 60, 92, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#1E2F4A',
      boxShadow: '0 6px 20px 0 rgba(38, 60, 92, 0.4)',
      transform: 'translateY(-2px)',
    },
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '& .MuiInputBase-input': { color: '#263C5C' },
      '& fieldset': { borderColor: 'rgba(38, 60, 92, 0.3)' },
      '&:hover fieldset': { borderColor: '#263C5C' },
      '&.Mui-focused fieldset': { borderColor: '#263C5C' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(38, 60, 92, 0.7)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#263C5C' },
  };

  return (
    <>
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'white',
        py: { xs: 4, md: 8 },
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Container maxWidth="sm">
          <Paper sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(38, 60, 92, 0.2)',
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)',
          }}>
            <AuthBranding />
            
            <Typography variant="h4" component="h1" sx={{ 
              textAlign: 'center', 
              mb: 1, 
              fontWeight: 700, 
              color: '#263C5C' 
            }}>
              Restablecer Contraseña
            </Typography>
            
            <Typography variant="body2" sx={{ 
              textAlign: 'center', 
              mb: 4, 
              color: '#263C5C' 
            }}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Typography>

            {message ? (
              <Box textAlign="center">
                <Alert severity="success" sx={{ 
                  mb: 3, 
                  bgcolor: 'rgba(76, 175, 80, 0.1)', 
                  color: '#2e7d32',
                  border: '1px solid #2e7d32',
                  borderRadius: '8px'
                }}>
                  {message}
                </Alert>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
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
                  InputProps={{ 
                    startAdornment: <EmailOutlinedIcon sx={{ 
                      mr: 1, 
                      color: 'rgba(38, 60, 92, 0.7)' 
                    }} /> 
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryButtonStyle}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Enviar Enlace'}
                </Button>
              </Box>
            )}

            <Box sx={{ 
              mt: 3, 
              textAlign: 'center',
              borderTop: '1px solid rgba(38, 60, 92, 0.1)',
              pt: 2
            }}>
              <MuiLink 
                component={RouterLink} 
                to="/login" 
                underline="hover" 
                sx={{ 
                  color: '#263C5C', 
                  fontWeight: 500,
                  '&:hover': { 
                    color: '#1E2F4A',
                    textDecoration: 'underline'
                  } 
                }}
              >
                ← Volver a Iniciar Sesión
              </MuiLink>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ForgotPasswordPage;