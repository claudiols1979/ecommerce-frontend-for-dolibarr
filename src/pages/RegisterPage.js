import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, useTheme, FormControl, InputLabel, Select, MenuItem
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
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    city: '',        // ✅ NUEVO CAMPO
    province: '',    // ✅ NUEVO CAMPO
  });
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Lista de provincias de Costa Rica
  const provinces = ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"];

  useEffect(() => {
    if (user) {
      navigate('/');      
    }
  }, [user, navigate]);

  const { firstName, lastName, email, password, confirmPassword, phoneNumber, address, city, province } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validaciones
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!province) {
      toast.error('Por favor seleccione su provincia.');
      return;
    }
    if (!city) {
      toast.error('Por favor ingrese su ciudad.');
      return;
    }

    setLoading(true);
    // ✅ INCLUIR city y province en los datos del usuario
    const userData = { firstName, lastName, email, password, phoneNumber, address, city, province };
    await register(userData);
    setLoading(false);
  };

  if (user) {
    return null;
  }

  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 3,
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

  const selectStyle = {
    ...textFieldStyle,
    '& .MuiSelect-select': {
      padding: '16.5px 14px',
      display: 'flex',
      alignItems: 'center'
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
      <Container maxWidth="sm">
        <Card sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 1)'
        }}>
          <CardContent>
            <AuthBranding />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                mb: 4, 
                fontWeight: 600, 
                color: '#263C5C' 
              }}
            >
              Crear Cuenta Nueva
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <TextField 
                    required 
                    fullWidth 
                    id="firstName" 
                    label="Nombre" 
                    name="firstName" 
                    autoComplete="given-name" 
                    value={firstName} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    required 
                    fullWidth 
                    id="lastName" 
                    label="Apellido" 
                    name="lastName" 
                    autoComplete="family-name" 
                    value={lastName} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    required 
                    fullWidth 
                    id="email" 
                    label="Correo Electrónico" 
                    name="email" 
                    autoComplete="email" 
                    value={email} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    required 
                    fullWidth 
                    name="password" 
                    label="Contraseña" 
                    type="password" 
                    id="password" 
                    autoComplete="new-password" 
                    value={password} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    required 
                    fullWidth 
                    name="confirmPassword" 
                    label="Confirmar Contraseña" 
                    type="password" 
                    id="confirmPassword" 
                    value={confirmPassword} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    required 
                    fullWidth 
                    name="phoneNumber" 
                    label="Número de Teléfono" 
                    type="tel" 
                    id="phoneNumber" 
                    autoComplete="tel" 
                    value={phoneNumber} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>    
                <Box sx={{ 
                      width: { 
                        xs: '75%',    // 100% en móvil
                        sm: '56%',     // 80% en tablet pequeña
                        md: '56%',     // 65% en tablet grande
                        lg: '56%'      // 56% en desktop
                      } 
                    }}>
                   <Grid item xs={12}>                 
                  <FormControl fullWidth required sx={selectStyle}>
                    <InputLabel>Provincia</InputLabel>
                    <Select
                      name="province"
                      value={province}
                      label="Provincia"
                      onChange={onChange}
                      startAdornment={<MapOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} />}
                    >
                      <MenuItem value=""><em>Seleccionar provincia</em></MenuItem>
                      {provinces.map((prov) => (
                        <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>                  
                </Grid>
                </Box>         
               
                
                {/* ✅ NUEVO: Campo Ciudad */}
                <Grid item xs={12}>
                  <TextField 
                    required 
                    fullWidth 
                    name="city" 
                    label="Ciudad" 
                    id="city" 
                    autoComplete="address-level2" 
                    value={city} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    InputProps={{ 
                      startAdornment: <LocationCityIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                  />
                </Grid>
                
                <Grid item xs={12}>                  
                  <TextField 
                    required 
                    fullWidth 
                    name="address" 
                    label="Dirección Completa" 
                    id="address" 
                    autoComplete="shipping address-line1" 
                    value={address} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle} 
                    multiline
                    rows={2}
                    InputProps={{ 
                      startAdornment: <HomeOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)', alignSelf: 'flex-start' }} /> 
                    }} 
                    placeholder="Calle, número, urbanización, punto de referencia, etc."
                  />                 
                </Grid>
            </Grid>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                sx={primaryButtonStyle} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Crear Cuenta'}
              </Button>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ color: 'text.secondary' }}
              >
                ¿Ya tienes una cuenta?{' '}
                <MuiLink 
                  component={RouterLink} 
                  to="/login" 
                  underline="hover" 
                  sx={{ fontWeight: 'bold', color: '#263C5C' }}
                >
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