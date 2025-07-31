import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Componente estilizado para el contenedor del slide (se mantiene sin cambios)
const CarouselSlideContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: theme.palette.common.white,
  background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))', // Overlay oscuro
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
    alignItems: 'flex-start',
    textAlign: 'left',
    left: '10%',
    right: 'unset',
    width: '80%',
  },
}));

const HeroCarouselVideo = () => {
  const navigate = useNavigate();
  // Esta es una URL de incrustación (embed) para el reproductor de Cloudinary
  const videoEmbedURL = 'https://player.cloudinary.com/embed/?cloud_name=dl4k0gqfv&public_id=Mother_s_Day_Perfume_Ad_Request_moc2w1&fluid=true&controls=false&loop=true&autoplay=true&muted=true';

  return (
    <Box sx={{
      position: 'relative', // Necesario para anclar el contenido superpuesto
      width: '100%',
      height: { xs: 300, sm: 400, md: 550 }, // Altura del video
      mb: 4,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 3,
      backgroundColor: 'black', // Fondo de respaldo mientras carga el video
    }}>
      {/* --- CORRECCIÓN CLAVE: Se usa un <iframe> en lugar de <video> --- */}
      <iframe
        src={videoEmbedURL}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          border: 'none', // Quitar el borde del iframe
          zIndex: 1,
        }}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Hero Video"
      ></iframe>
      
      {/* El contenido se coloca encima del video */}
      <CarouselSlideContent sx={{ zIndex: 2 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' } }}>
          Siente la Esencia de la Elegancia
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: { xs: '90%', md: '50%' }, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
          Fragancias que enamoran. Descubre nuestra colección exclusiva.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate('/products')}
          sx={{ 
            px: { xs: 4, sm: 6 }, 
            py: { xs: 1.5, sm: 2 }, 
            borderRadius: 8,
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          Explorar Colección
        </Button>
      </CarouselSlideContent>
    </Box>
  );
};

export default HeroCarouselVideo;
