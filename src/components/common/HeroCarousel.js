import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Box, Typography, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// IMPORTAR TUS IMÁGENES
// Asegúrate de que las rutas sean correctas según donde tengas tu carpeta 'assets'
// Si 'assets' está directamente dentro de 'src', la ruta sería './assets/heroX.jpg'
// Si 'components/common' y 'assets' están al mismo nivel dentro de 'src', la ruta sería '../assets/heroX.jpg'
// Asumo que están en `src/assets` y este componente está en `src/components/common`
// import hero1 from '../../assets/hero1.jpg'; 
// import hero2 from '../../assets/hero2.jpg';
// import hero3 from '../../assets/hero3.jpg';

// Componente estilizado para el contenedor del slide
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
    alignItems: 'flex-start', // Alinear a la izquierda en pantallas grandes
    textAlign: 'left',
    left: '10%', // Empujar contenido hacia la derecha
    right: 'unset',
    width: '80%', // Limitar ancho del contenido
  },
}));

const HeroCarousel = () => {
  const navigate = useNavigate();

  const slides = [
    {
      //image: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1754589232/imageHome_rr1pkn.jpg', // USANDO LA IMAGEN IMPORTADA
      image: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1757961934/nike-vaporfly4-ficha-recurso-foto1-bene_l9kien.jpg',
      alt: 'Nueva Colección Primavera',
      title: 'Descubre las nuevas colecciones',
      description: 'Estilo para cada gusto. ¡Explora nuestros últimos productos!',
      buttonText: 'Ver Productos',
      buttonLink: '/products',
    },
    {
      image: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1754589040/syed-muhammad-baqir-zaidi-3qNVEa7SN_8-unsplash_jrfvpr.jpg', // USANDO LA IMAGEN IMPORTADA
      alt: 'Ofertas Exclusivas',
      title: 'Ofertas Exclusivas',
      description: 'Precios especiales que no querrás perder!',
      buttonText: 'Ver Ofertas',
      buttonLink: '/products', // O una ruta de ofertas real
    },
    {
      image: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1754589517/dolce-gabbana-dolce-gabbana-intenso-edp-for-men-710655_v3hkhw.jpg', // USANDO LA IMAGEN IMPORTADA
      alt: 'Calidad Garantizada',
      title: 'Productos 100% originales',
      description: 'Comprometidos con la excelencia en cada artículo.',
      buttonText: 'Conocer Más',
      buttonLink: '/products', // Puedes crear una página "acerca de"
    },
  ];

  return (
    <Box sx={{ width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        stopOnHover={true}
        swipeable={true}
        emulateTouch={true}
      >
        {slides.map((slide, index) => (
          <Box key={index} sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={slide.image}
              alt={slide.alt}
              sx={{ width: '100%', height: { xs: 250, sm: 350, md: 500 }, objectFit: 'cover' }}
            />
            <CarouselSlideContent>
              <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' } }}>
                {slide.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, maxWidth: { xs: '90%', md: '60%' }, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                {slide.description}
              </Typography>
              <Button
                variant="contained"                
                size="large"
                onClick={() => navigate(slide.buttonLink)}
                sx={{
                  px: { xs: 3, sm: 5 }, py: { xs: 1, sm: 1.5 }, boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)', borderRadius: 8, backgroundColor: '#bb4343ff', color: 'white', '&:hover': {
                    backgroundColor: '#ff0000ff', // Un tono más oscuro para el hover
                  }
                }}
              >
                {slide.buttonText}
              </Button>
            </CarouselSlideContent>
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default HeroCarousel;
