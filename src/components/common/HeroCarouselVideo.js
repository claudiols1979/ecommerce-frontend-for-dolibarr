import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useHeroCarouselVideo } from '../../contexts/HeroCarouselVideoContext';

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
  const { videoData, loading, error } = useHeroCarouselVideo();
  
  // Si está cargando o no hay datos, mostrar un estado de carga o el video por defecto
  if (loading) {
    return (
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 300, sm: 400, md: 650 },
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        Cargando video...
      </Box>
    );
  }

  // Usar los datos del video del contexto (pueden ser del backend o por defecto)
  const currentVideo = videoData || {
    video: 'https://res.cloudinary.com/dl4k0gqfv/video/upload/v1758212825/video_promocion_erp_ecommerce_pifbth.mp4',
    title: 'Tu estilo, a un clic de distancia.',
    subtitle: 'Las mejores marcas. El mejor precio. Todo para ti.',
    buttonText: 'Explorar Productos',
    buttonLink: '/products',
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: { xs: 300, sm: 400, md: 650 },
      mb: 4,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 3,
      backgroundColor: 'black',
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        // --- CORRECCIÓN CLAVE 2: Estilos para que el video cubra el contenedor ---
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%', // El video siempre ocupará el 100% del ancho
          height: 'auto', // La altura se ajustará para mantener la proporción
          transform: 'translate(-50%, -50%)', // Centra el video
          zIndex: 1,
        }}
      >
        <source src={currentVideo.video} type="video/mp4" />
        Tu navegador no soporta la etiqueta de video.
      </video>
      
      <CarouselSlideContent sx={{ zIndex: 2 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' } }}>
          {currentVideo.title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: { xs: '90%', md: '50%' }, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
          {currentVideo.subtitle}
        </Typography>
        <Button
          variant="contained"         
          size="large"
          onClick={() => navigate(currentVideo.buttonLink || '/products')}
          sx={{ 
            px: { xs: 4, sm: 6 }, 
            py: { xs: 1.5, sm: 2 }, 
            borderRadius: 8,
            fontWeight: 'bold',
            backgroundColor: '#bb4343ff', 
            color: 'white', 
            '&:hover': { backgroundColor: '#ff0000ff' },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          {currentVideo.buttonText}
        </Button>
      </CarouselSlideContent>
    </Box>
  );
};

export default HeroCarouselVideo;