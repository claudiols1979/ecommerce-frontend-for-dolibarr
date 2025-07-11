import React from 'react';
import { Box, Typography, Container, Link as MuiLink, IconButton } from '@mui/material'; // <-- 1. IMPORTAR IconButton
import { useTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import FacebookIcon from '@mui/icons-material/Facebook';   // <-- 2. IMPORTAR ICONO DE FACEBOOK
import InstagramIcon from '@mui/icons-material/Instagram'; // <-- 3. IMPORTAR ICONO DE INSTAGRAM

const Footer = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: grey[100],
        color: theme.palette.text.secondary,
        textAlign: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth="lg">
        {/* --- 4. NUEVA SECCIÓN DE REDES SOCIALES --- */}
        <Box sx={{ mb: 1 }}>
          <MuiLink href="https://www.facebook.com/profile.php?id=61576158096800" target="_blank" rel="noopener noreferrer">
            <IconButton
              aria-label="Facebook"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', transform: 'scale(1.1)' },
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <FacebookIcon />
            </IconButton>
          </MuiLink>
          <MuiLink href="https://www.instagram.com/look_and_smell_cr" target="_blank" rel="noopener noreferrer">
            <IconButton
              aria-label="Instagram"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', transform: 'scale(1.1)' },
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <InstagramIcon />
            </IconButton>
          </MuiLink>
        </Box>

        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Look & Smell - Perfumería CR. Todos los derechos reservados.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <MuiLink href="/privacy" color="inherit" sx={{ mx: 1, '&:hover': { textDecoration: 'underline', color: theme.palette.primary.main } }}>
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
