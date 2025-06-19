import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';

// Iconos para los campos
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      navigate('/');      
    }
  }, [user, navigate]);

  const { firstName, lastName, email, password, confirmPassword, phoneNumber, address } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    const userData = { firstName, lastName, email, password, phoneNumber, address };
    await register(userData);
    setLoading(false);
  };

  if (user) {
    return null;
  }

  // Estilos consistentes con LoginPage
  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 3,
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
      <Container maxWidth="sm">
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
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600, color: 'white' }}>
              Crear Cuenta Nueva
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth id="firstName" label="Nombre" name="firstName" autoComplete="given-name" value={firstName} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth id="lastName" label="Apellido" name="lastName" autoComplete="family-name" value={lastName} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={email} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="new-password" value={password} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth name="confirmPassword" label="Confirmar Contraseña" type="password" id="confirmPassword" value={confirmPassword} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth name="phoneNumber" label="Número de Teléfono" type="tel" id="phoneNumber" autoComplete="tel" value={phoneNumber} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth name="address" label="Dirección de Envío" id="address" autoComplete="shipping address-line1" value={address} onChange={onChange} variant="outlined" sx={textFieldStyle} InputProps={{ startAdornment: <HomeOutlinedIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} /> }} />
                </Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" sx={primaryButtonStyle} disabled={loading}>
                {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : 'Crear Cuenta'}
              </Button>
              <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                ¿Ya tienes una cuenta?{' '}
                <MuiLink component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
                  Inicia sesión aquí
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;