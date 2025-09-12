import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, Tabs, Tab, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';

// Iconos para los campos de texto
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const LoginPage = () => {
  const [resellerCode, setResellerCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (user) {
    return null;
  }

  // Updated styles to match PrivacyPolicyPage
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
      backgroundColor: '#1E2F48',
      boxShadow: '0 6px 20px 0 rgba(38, 60, 92, 0.4)',
      transform: 'translateY(-2px)',
    },
  };
  
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: 'rgba(148, 145, 145, 1)',
      },
      '&:hover fieldset': {
        borderColor: '#263C5C',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#263C5C',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0, 0, 0, 0.7)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#263C5C',
    },
  };

  const tabStyle = {
    '& .MuiTab-root': { 
      color: 'rgba(0, 0, 0, 0.7)', 
      fontWeight: 600 
    },
    '& .Mui-selected': { 
      color: '#263C5C' 
    },
    '& .MuiTabs-indicator': { 
      backgroundColor: '#263C5C' 
    }
  };

  return (
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
      <Container maxWidth="xs">
        <Card sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 1)'
        }}>
          <CardContent>   
            <AuthBranding />      
            
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'rgba(0, 0, 0, 0.1)', 
              mb: 3 
            }}>
              <Tabs 
                value={tab} 
                onChange={handleTabChange} 
                centered
                textColor="inherit"
                sx={tabStyle}
              >
                <Tab label="Con Correo" />
                <Tab label="Con Código" />
              </Tabs>
            </Box>

            {tab === 0 && (
              <Box component="form" onSubmit={handleEmailSubmit} noValidate>
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
                    startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                  }} 
                />
                <TextField
                  margin="normal" 
                  required 
                  fullWidth 
                  name="password" 
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  autoComplete="current-password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined" 
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <MuiLink 
                  component={RouterLink} 
                  to="/forgot-password" 
                  variant="body2" 
                  sx={{ 
                    display: 'block', 
                    textAlign: 'right', 
                    mt: 1, 
                    mb: 2, 
                    color: 'text.secondary', 
                    '&:hover': { color: '#263C5C' } 
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  sx={primaryButtonStyle} 
                  disabled={loading || !email || !password}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Iniciar Sesión'}
                </Button>
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ mt: 2, color: 'text.secondary' }}
                >
                  ¿No tienes cuenta?{' '}
                  <MuiLink 
                    component={RouterLink} 
                    to="/register" 
                    underline="hover" 
                    sx={{ fontWeight: 'bold', color: '#263C5C' }}
                  >
                    Regístrate aquí
                  </MuiLink>
                </Typography>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={handleCodeSubmit} noValidate>
                <TextField 
                  margin="normal" 
                  required 
                  fullWidth 
                  id="resellerCode" 
                  label="Código de acceso" 
                  name="resellerCode" 
                  autoComplete="off" 
                  autoFocus 
                  value={resellerCode} 
                  onChange={(e) => setResellerCode(e.target.value)} 
                  variant="outlined" 
                  sx={textFieldStyle} 
                  InputProps={{ 
                    startAdornment: <VpnKeyOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                  }} 
                />
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  sx={primaryButtonStyle} 
                  disabled={loading || !resellerCode}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Ingresar con Código'}
                </Button>
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ mt: 3, color: 'text.secondary' }}
                >
                  ¿Necesitas un código?{' '}
                  <MuiLink 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    underline="hover" 
                    sx={{ fontWeight: 'bold', color: '#263C5C' }}
                  >
                    Contacta a tu administrador.
                  </MuiLink>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;