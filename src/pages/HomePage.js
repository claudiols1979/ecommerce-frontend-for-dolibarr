import React, { useEffect } from 'react';
import { Container, Box, Typography, Button, Grid, CircularProgress, Alert, Card, CardContent, CardMedia } from '@mui/material';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/common/HeroCarousel';
import { useProducts } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';

// Importa los iconos necesarios para los widgets y las features
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DiscountIcon from '@mui/icons-material/Discount';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupAddIcon from '@mui/icons-material/GroupAdd';


const HomePage = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts(1, 8, 'createdAt_desc'); 
  }, [fetchProducts]);

  // Datos para la primera sección de widgets (Envío, Soporte, etc.)
  const topWidgetData = [
    { title: 'Envíos a todo el país', description: 'Envío seguro con Correos de Costa Rica', icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Soporte 24/7', description: 'Soporte al cliente disponible a toda hora', icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Devolución de Dinero', description: 'Garantía de devolución total en tus compras', icon: <MonetizationOnIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Descuento en Pedidos', description: 'Disfruta de ofertas exclusivas y descuentos', icon: <DiscountIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  ];

  // Datos para la NUEVA sección de widgets (reemplazando categorías)
  const middleWidgetData = [
    { title: 'Calidad Garantizada', description: 'Productos seleccionados con los más altos estándares.', icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Innovación Constante', description: 'Siempre con las últimas tendencias del mercado.', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Atención Personalizada', description: 'Un equipo dedicado a tus necesidades y consultas.', icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { 
      title: 'Únete a Nuestra Red', 
      description: 'Forma parte de nuestro selecto grupo de WhatsApp.', 
      icon: <GroupAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      // CAMBIO CLAVE AQUÍ: Añadimos un enlace de WhatsApp
      link: 'https://chat.whatsapp.com/KJtYhoXgz2N6LqO3ehSaSh', 
    },
  ];

  // Datos para la sección "Por Qué Elegirnos"
  const features = [
    { icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Envío Rápido', description: 'Entregas eficientes y seguras a todo el país.' },
    { icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Soporte 24/7', description: 'Atención personalizada para todas tus dudas.' },
    { icon: <StorefrontIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Amplio Catálogo', description: 'Cientos de productos para diversificar tu negocio.' },
  ];

  return (
    <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
      {/* Carrusel Principal */}
      <HeroCarousel />

      {/* SECCIÓN DE WIDGETS SUPERIOR */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {topWidgetData.map((widget, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'transparent',
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%', 
                textAlign: 'center',
              }}>
                {widget.icon}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'primary.main' }}>
                  {widget.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {widget.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* FIN SECCIÓN DE WIDGETS SUPERIOR */}

      {/* BOTÓN EXPLORAR TODOS LOS PRODUCTOS */}
      <Box sx={{ textAlign: 'center', my: 6 }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate('/products')}
          sx={{ 
            borderRadius: 8, 
            px: 5, 
            py: 1.5,
            boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 20px rgba(255, 193, 7, 0.6)',
              backgroundColor: '#FFD740',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          Explorar Todos los Productos
        </Button>
      </Box>
      {/* FIN BOTÓN EXPLORAR */}


      {/* Sección de Productos Destacados */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>Nuestros Productos Destacados</Typography>
      {loading && products.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress color="primary" />
          <Typography ml={2}>Cargando productos...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : products.length === 0 ? (
        <Alert severity="info" sx={{ p: 3 }}>No hay productos destacados disponibles.</Alert>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={3} lg={3}> 
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* NUEVA SECCIÓN DE WIDGETS EN MEDIO */}
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {middleWidgetData.map((widget, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  border: 'none',
                  borderRadius: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%', 
                  textAlign: 'center',
                  cursor: widget.link ? 'pointer' : 'default', // Hace el cursor de puntero si hay un enlace
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: widget.link ? 'translateY(-5px)' : 'none', // Sutil elevación al pasar el ratón si es clicable
                  }
                }}
                onClick={() => {
                  if (widget.link) {
                    window.open(widget.link, '_blank'); // Abre el enlace en una nueva pestaña
                  }
                }}
              >
                {widget.icon}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'primary.main' }}>
                  {widget.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {widget.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* FIN NUEVA SECCIÓN DE WIDGETS EN MEDIO */}

      {/* Sección de Nuestros Servicios/Características */}
      <Box sx={{ 
        my: 8, 
        textAlign: 'center', 
        bgcolor: 'background.default', 
        color: 'text.primary', 
        p: { xs: 4, sm: 6 }, 
        borderRadius: 3,
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
      }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: 'primary.main' }}>
          Por Qué Elegirnos
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                {feature.icon} 
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: 'primary.main' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;