import React from 'react';
import { Box, Typography } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// --- ANIMACIÓN CORREGIDA Y MEJORADA ---
// La animación mueve el contenedor del texto de su posición inicial (0%)
// a una posición donde la primera mitad ha desaparecido por la izquierda (-50%).
const marqueeAnimation = {
  '@keyframes marquee': {
    '0%': { transform: 'translateX(0%)' },
    '100%': { transform: 'translateX(-50%)' },
  },
};

const PromotionalBanner = () => {
  // El texto de la promoción, para poder duplicarlo fácilmente.
  const promoText = (
    <Typography
      variant="subtitle1"
      component="span" // Usamos span para que sea parte del flujo del texto
      sx={{
        // Cada instancia del texto ocupa el 50% del contenedor animado
        width: '50%', 
        color: '#ffffffff',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Centra el contenido dentro de su 50% de espacio
        flexShrink: 0, // Evita que el texto se encoja
      }}
    >
      {/* <StarBorderIcon sx={{ mx: 3, fontSize: '1.2rem' }} /> */}
      Aprovecha todas nuestras ofertas de apertura
      {/* <StarBorderIcon sx={{ mx: 3, fontSize: '1.2rem' }} /> */}
    </Typography>
  );

  return (
    <Box sx={{
      //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      background: 'linear-gradient(155deg, rgba(154, 37, 128, 0.9) 40%, rgba(75, 51, 150, 0.95) 80%, rgba(167, 178, 214, 0.95) 100%)',
      width: '98%',      
      py: 1.5,
      mx: 'auto',
      overflow: 'hidden',
      whiteSpace: 'whitespace-nowrap',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      mb: 1,
      mt: 1,
      borderRadius: 20
    }}>
      {/* --- CONTENEDOR DE LA ANIMACIÓN --- */}
      <Box
        sx={{
          ...marqueeAnimation,
          display: 'flex', // Crucial para alinear los hijos en una fila
          width: '200%',   // El contenedor es el doble de ancho que la pantalla
          animation: 'marquee 10s linear infinite', // Animación más rápida
        }}
      >
        {/* --- CORRECCIÓN: Se duplica el contenido para un bucle infinito --- */}
        {promoText}
        {promoText}
      </Box>
    </Box>
  );
};

export default PromotionalBanner;