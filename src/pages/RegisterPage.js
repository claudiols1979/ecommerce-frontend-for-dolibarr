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
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
    // ✅ NUEVOS CAMPOS PARA DOLIBARR
    tipoIdentificacion: '',
    cedula: '',
    codigoActividadReceptor: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Lista de provincias de Costa Rica
  const provinces = ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"];

  // ✅ OPCIONES PARA TIPO DE IDENTIFICACIÓN
  const tiposIdentificacion = [
    { value: 'Fisica', label: 'Persona Física' },
    { value: 'Juridica', label: 'Persona Jurídica' },
    { value: 'Dimex', label: 'DIMEX' },
    { value: 'Nite', label: 'NITE' }
  ];

  useEffect(() => {
    if (user) {
      navigate('/');      
    }
  }, [user, navigate]);

  const { 
    firstName, lastName, email, password, confirmPassword, 
    phoneNumber, address, city, province, tipoIdentificacion, 
    cedula, codigoActividadReceptor 
  } = formData;

  const onChange = (e) => {
    let value = e.target.value;

    let processedValue = value;

    if (e.target.name === 'cedula') {
        processedValue = value.replace(/[-]/g, '');
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  // ✅ VALIDACIONES CONDICIONALES
  const validateForm = () => {
    const errors = {};

    // Validaciones básicas
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return false;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (!province) {
      errors.province = 'Por favor seleccione su provincia.';
    }
    if (!city) {
      errors.city = 'Por favor ingrese su ciudad.';
    }

    // ✅ VALIDACIONES PARA CAMPOS NUEVOS
    if (!tipoIdentificacion) {
      errors.tipoIdentificacion = 'Por favor seleccione el tipo de identificación.';
    } else {
      // Validaciones condicionales según tipo de identificación
      if (['Fisica', 'Dimex', 'Nite'].includes(tipoIdentificacion) && !cedula) {
        errors.cedula = `La cédula es requerida para tipo de identificación ${tipoIdentificacion}.`;
      }
      
      if (tipoIdentificacion === 'Juridica') {
        if (!cedula) {
          errors.cedula = 'La cédula jurídica es requerida.';
        }
        if (!codigoActividadReceptor) {
          errors.codigoActividadReceptor = 'El código de actividad receptor es requerido para persona jurídica.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Mostrar el primer error en toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    // ✅ INCLUIR TODOS LOS CAMPOS en los datos del usuario
    const userData = { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      address, 
      city, 
      province,
      tipoIdentificacion,
      cedula: cedula ? cedula.replace(/[-]/g, '') : '',
      codigoActividadReceptor
    };
    
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
                
                {/* Campos Personales */}
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

                {/* ✅ TIPO DE IDENTIFICACIÓN */}   
                <Box sx={{ width: { xs: '75%', sm: '56%', md: '56%', lg: '56%' } }}>            
                <Grid item xs={12}>
                  <FormControl fullWidth required sx={selectStyle} error={!!fieldErrors.tipoIdentificacion}>
                    <InputLabel>Tipo de Identificación</InputLabel>
                    <Select
                      name="tipoIdentificacion"
                      value={tipoIdentificacion}
                      label="Tipo de Identificación"
                      onChange={onChange}
                      startAdornment={<BadgeOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} />}
                    >
                      <MenuItem value=""><em>Seleccionar tipo</em></MenuItem>
                      {tiposIdentificacion.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                </Box> 
                {/* ✅ CÉDULA - Requerido para todos excepto si no hay tipo seleccionado */}
                <Grid item xs={12}>
                  <TextField 
                    required={['Fisica', 'Juridica', 'Dimex', 'Nite'].includes(tipoIdentificacion)}
                    fullWidth 
                    name="cedula" 
                    label={
                      tipoIdentificacion === 'Juridica' ? 'Cédula Jurídica' : 
                      tipoIdentificacion === 'Dimex' ? 'Número DIMEX' :
                      tipoIdentificacion === 'Nite' ? 'Número NITE' : 'Cédula'
                    }
                    id="cedula" 
                    value={cedula} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle}
                    error={!!fieldErrors.cedula}
                    helperText={fieldErrors.cedula}
                    InputProps={{ 
                      startAdornment: <BadgeOutlinedIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                    placeholder={
                      tipoIdentificacion === 'Juridica' ? 'Ingrese cédula jurídica' :
                      tipoIdentificacion === 'Dimex' ? 'Ingrese número DIMEX' :
                      tipoIdentificacion === 'Nite' ? 'Ingrese número NITE' : 'Ingrese su cédula'
                    }
                  />
                </Grid>

                {/* ✅ CÓDIGO ACTIVIDAD RECEPTOR - Solo requerido para Jurídica */}
                <Grid item xs={12}>
                  <TextField 
                    required={tipoIdentificacion === 'Juridica'}
                    fullWidth 
                    name="codigoActividadReceptor" 
                    label="Código Actividad Receptor" 
                    id="codigoActividadReceptor" 
                    value={codigoActividadReceptor} 
                    onChange={onChange} 
                    variant="outlined" 
                    sx={textFieldStyle}
                    error={!!fieldErrors.codigoActividadReceptor}
                    helperText={fieldErrors.codigoActividadReceptor || "Requerido solo para persona jurídica"}
                    InputProps={{ 
                      startAdornment: <BusinessCenterIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.7)' }} /> 
                    }} 
                    placeholder="Ej: 620100, 461000, etc."
                    disabled={tipoIdentificacion !== 'Juridica'}
                  />
                </Grid>

                {/* Campos de Contacto */}
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

                {/* Ubicación */}
                <Box sx={{ width: { xs: '75%', sm: '56%', md: '56%', lg: '56%' } }}>
                  <Grid item xs={12}>                 
                    <FormControl fullWidth required sx={selectStyle} error={!!fieldErrors.province}>
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
                    error={!!fieldErrors.city}
                    helperText={fieldErrors.city}
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
                    multiline
                    rows={2}
                    sx={{
                      ...textFieldStyle,
                      width: '115%',
                      ml: -2,
                      display: 'block'
                    }}
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