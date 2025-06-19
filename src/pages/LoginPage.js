import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, Tabs, Tab, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding'; // Importa tu componente de branding

// Iconos para los campos de texto
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

const LoginPage = () => {
  const [resellerCode, setResellerCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0); 
  
  const { login, loginWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const WHATSAPP_AGENT_NUMBER = '50672317420';
  const whatsappMessage = "Hola, Soy nuevo usuario y quisiera obtener un codigo para ingresar a la tienda en linea.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (user) {
      navigate('/');      
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const success = await login(resellerCode);
    if (!success) {
      setResellerCode('');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await loginWithEmail(email, password);
    setLoading(false);
  };

  if (user) {
    return null;
  }

  // Estilo para los botones principales
  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 2,
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '8px',
    color: 'common.black',
    backgroundColor: '#FFD700', // Un dorado vibrante
    boxShadow: '0 4px 15px 0 rgba(255, 215, 0, 0.4)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#FFC700',
      boxShadow: '0 6px 20px 0 rgba(255, 215, 0, 0.5)',
      transform: 'translateY(-2px)',
    },
  };
  
  // --- ESTILO CORREGIDO PARA LOS CAMPOS DE TEXTO ---
  const textFieldStyle = {
    // Estilo para el contenedor del campo de texto
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      // Estilo para el color del texto que se escribe
      '& .MuiInputBase-input': {
        color: 'white', 
      },
      // Estilo para el borde del campo
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.23)',
      },
      '&:hover fieldset': {
        borderColor: '#FFD700', // Borde dorado al pasar el ratón
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFD700', // Borde dorado cuando está enfocado
      },
    },
    // Estilo para la etiqueta (label)
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)', // Color de la etiqueta por defecto
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#FFD700', // Color dorado de la etiqueta cuando está enfocada
    },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #121212 30%, #282828 90%)', // Gradiente de negro a gris oscuro
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
          backgroundColor: 'rgba(255, 255, 255, 0.05)', // Efecto de vidrio esmerilado
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent>   
            <AuthBranding />      
            
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 3 }}>
              <Tabs 
                value={tab} 
                onChange={handleTabChange} 
                centered
                textColor="inherit"
                sx={{
                    '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 },
                    '& .Mui-selected': { color: '#FFD700' },
                    '& .MuiTabs-indicator': { backgroundColor: '#FFD700' }
                }}
              >
                <Tab label="Con Correo" />
                <Tab label="Con Código" />
              </Tabs>
            </Box>

            {tab === 0 && (
              <Box component="form" onSubmit={handleEmailSubmit} noValidate>
                <TextField margin="normal" required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                <MuiLink component={RouterLink} to="/forgot-password" variant="body2" sx={{ display: 'block', textAlign: 'right', mt: 1, mb: 2, color: 'text.secondary', '&:hover': { color: '#FFD700' } }}>
                  ¿Olvidaste tu contraseña?
                </MuiLink>
                <Button type="submit" fullWidth variant="contained" sx={primaryButtonStyle} disabled={loading || !email || !password}>
                  {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Iniciar Sesión'}
                </Button>
                <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                  ¿No tienes cuenta?{' '}
                  <MuiLink component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                    Regístrate aquí
                  </MuiLink>
                </Typography>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={handleCodeSubmit} noValidate>
                <TextField margin="normal" required fullWidth id="resellerCode" label="Código de acceso" name="resellerCode" autoComplete="off" autoFocus value={resellerCode} onChange={(e) => setResellerCode(e.target.value)} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <VpnKeyOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                <Button type="submit" fullWidth variant="contained" sx={primaryButtonStyle} disabled={loading || !resellerCode}>
                  {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Ingresar con Código'}
                </Button>
                <Grid container justifyContent="center" sx={{ mt: 3 }}>
                  <Grid item>
                    <Typography variant="body2" color="text.secondary">
                      ¿Necesitas un código?{' '}
                      <MuiLink href={whatsappUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                        Contacta a tu administrador.
                      </MuiLink>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;