import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [resellerCode, setResellerCode] = useState(''); // Estado para el código de revendedor
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // --- WhatsApp Link Configuration ---
  const WHATSAPP_AGENT_NUMBER = '50672317420';
  const whatsappMessage = "Hola, Soy nuevo usuario y quisiera obtener un codigo para ingresar a la tienda en linea.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  // Redirigir si ya ha iniciado sesión
  useEffect(() => {
    if (user) {
      navigate('/');      
    }
  }, [user, navigate]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    // Llama a la función de login del contexto con el código de revendedor
    const success = await login(resellerCode);
    setLoading(false);
    // La navegación ya se gestiona en AuthContext y el useEffect de arriba
  };

  if (user) {
    return null; // No renderizar la página de inicio de sesión si ya está autenticado
  }

  return (
    <Container maxWidth="sm" sx={{ my: 4, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
      <Card sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Iniciar Sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="resellerCode"
              label="Código de acceso"
              name="resellerCode"
              autoComplete="off" // No autocompletar códigos
              autoFocus
              value={resellerCode}
              onChange={(e) => setResellerCode(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ p: 1.5, mb: 2 }}
              disabled={loading || !resellerCode} // Deshabilita si no hay código
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            <Grid container justifyContent="center" sx={{ mt: 3 }}>
              <Grid item>
                <Typography variant="body2">
                  ¿Necesitas un código?{' '}
                  <MuiLink
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    Contacta a tu administrador.
                  </MuiLink>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
