import React from 'react';
import { Box, Typography, useTheme, Divider } from '@mui/material';

// Para que este componente funcione, primero debes instalar las tipografías desde tu terminal:
// npm install @fontsource/playfair-display @fontsource/lato
// O si usas yarn:
// yarn add @fontsource/playfair-display @fontsource/lato
import '@fontsource/playfair-display/700.css'; // Importa el peso 700 (Bold)
import '@fontsource/lato/300.css';           // Importa el peso 300 (Light)

/**
 * Componente de Branding para las páginas de autenticación.
 * Muestra el nombre de la tienda "Look & Smell" con un estilo profesional y minimalista.
 */
const AuthBranding = () => {
  const theme = useTheme();

  return (
    // Box principal que centra el contenido y añade margen vertical (my: 4)
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Typography
        variant="h2" // Tamaño base grande para impacto visual
        component="h1"
        sx={{
          fontFamily: '"Playfair Display", serif', // Tipografía elegante y clásica para "Look" y "Smell"
          fontWeight: 700, // Bold
          color: 'text.secondary', // Se adapta automáticamente al modo claro/oscuro
          letterSpacing: '0.1em', // Espaciado entre letras para un look más refinado
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        Look
        <Typography
          component="span"
          variant="h3" // Ligeramente más pequeño
          sx={{
            fontFamily: '"Lato", sans-serif', // Tipografía moderna y limpia para el "&"
            fontWeight: 300, // Light
            fontStyle: 'italic', // Cursiva para darle un toque especial
            mx: 2, // Margen horizontal para separarlo
            color: 'text.secondary', // Un color secundario sutil
          }}
        >
          &
        </Typography>
        Smell
      </Typography>

      {/* Un subtítulo o eslogan opcional */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mt: 1, letterSpacing: '0.05em' }}
      >
        Tu Esencia, Tu Estilo
      </Typography>
    </Box>
  );
};

export default AuthBranding;