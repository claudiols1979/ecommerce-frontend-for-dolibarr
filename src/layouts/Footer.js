import React from 'react';
import { Box, Typography, Container, Link as MuiLink } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors'; // Importa colores grises de MUI

const Footer = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto', // Empuja el footer hacia la parte inferior
        // Usamos un tono pastel suave (ej. un gris muy claro de la paleta de MUI)
        backgroundColor: grey[100], // Un gris muy suave, cercano al blanco con un toque de color
        color: theme.palette.text.secondary, // Color de texto secundario para buen contraste
        textAlign: 'center',
        borderTopLeftRadius: 16, // Esquinas superiores redondeadas
        borderTopRightRadius: 16,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', // Sombra sutil hacia arriba
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Look & Smell - Perfumería CR. Todos los derechos reservados.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <MuiLink href="/Privacy" color="inherit" sx={{ mx: 1, '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main } }}>
            Política de Privacidad
          </MuiLink>
          |
          <MuiLink href="/conditions" color="inherit" sx={{ mx: 1, '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main } }}>
            Términos de Servicio
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;