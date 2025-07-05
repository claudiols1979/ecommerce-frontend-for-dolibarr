import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, Button, Grid, CircularProgress, Alert, Card, CardContent, CardMedia, Paper, TextField, InputAdornment } from '@mui/material';
import ProductCard from '../components/product/ProductCard';
import HeroCarousel from '../components/common/HeroCarousel';
import { useProducts } from '../contexts/ProductContext';
import { useNavigate } from 'react-router-dom';

// --- Import necessary hooks and components for the fix ---
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import PromotionalBanner from '../components/common/PromotionBanner';

// Importa los iconos necesarios para los widgets y las features
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DiscountIcon from '@mui/icons-material/Discount';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';

const HomePage = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();
  
  // --- Add hooks needed for the "Add to Cart" functionality ---
  const { addItemToCart } = useOrders();
  const { user } = useAuth();
  
  // --- Add local state to manage the loading of a single product card ---
  const [addingProductId, setAddingProductId] = useState(null);

  const [homeSearchTerm, setHomeSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts(1, 8, 'createdAt_desc'); 
  }, [fetchProducts]);

  // --- NEW: Handler to add items to cart, with local loading state ---
  const handleAddToCart = useCallback(async (product) => {
    if (typeof addItemToCart !== 'function') {
      toast.error("La funcionalidad para añadir al carrito no está disponible.");
      return;
    }

    // Set loading state for THIS CARD ONLY
    setAddingProductId(product._id);

    // --- Price Calculation Logic (replicated from your other components) ---
    const getPriceForCart = () => {
        let calculatedPrice = null;
        if (user && user.role === 'Revendedor' && user.resellerCategory && product.resellerPrices) {
            const priceForCategory = product.resellerPrices[user.resellerCategory];
            if (typeof priceForCategory === 'number' && priceForCategory > 0) {
                calculatedPrice = priceForCategory;
            }
        }
        if (calculatedPrice === null && product.resellerPrices && typeof product.resellerPrices.cat1 === 'number' && product.resellerPrices.cat1 > 0) {
            calculatedPrice = product.resellerPrices.cat1;
        }
        return calculatedPrice || 0;
    };

    const priceToPass = getPriceForCart();
    if (priceToPass <= 0) {
        toast.error("No se puede añadir al carrito: precio no disponible.");
        setAddingProductId(null); // Stop loading
        return;
    }
    // --- End of Price Logic ---

    try {
      await addItemToCart(product._id, 1, priceToPass);      
    } catch (err) {
      toast.error(err.message || "No se pudo añadir el producto.");
    } finally {
      // ALWAYS reset the loading state
      setAddingProductId(null);
    }
  }, [addItemToCart, user]);

  // --- NUEVO HANDLER PARA LA BÚSQUEDA ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (homeSearchTerm.trim()) {
      // Navega a la página de productos y pasa el término de búsqueda como un parámetro en la URL
      navigate(`/products?search=${encodeURIComponent(homeSearchTerm)}`);
    }
  };


  // All original data and layout constants remain untouched
  const topWidgetData = [
    { title: 'Envíos a todo el país', description: 'Envío seguro con Correos de Costa Rica', icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Soporte 24/7', description: 'Soporte al cliente disponible a toda hora', icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Devolución de Dinero', description: 'Garantía de devolución total en tus compras', icon: <MonetizationOnIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Descuento en Pedidos', description: 'Disfruta de ofertas exclusivas y descuentos', icon: <DiscountIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  ];

  const middleWidgetData = [
    { title: 'Calidad Garantizada', description: 'Productos seleccionados con los más altos estándares.', icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Innovación Constante', description: 'Siempre con las últimas tendencias del mercado.', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Atención Personalizada', description: 'Un equipo dedicado a tus necesidades y consultas.', icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { 
      title: 'Únete a Nuestra Red', 
      description: 'Forma parte de nuestro selecto grupo de WhatsApp.', 
      icon: <GroupAddIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      link: 'https://chat.whatsapp.com/KDAzFEvMzpn8MnTBtmntaD', 
    },
  ];

  const features = [
    { icon: <LocalShippingIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Envío Rápido', description: 'Entregas eficientes y seguras a todo el país.' },
    { icon: <SupportAgentIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Soporte 24/7', description: 'Atención personalizada para todas tus dudas.' },
    { icon: <StorefrontIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Amplio Catálogo', description: 'Cientos de productos para diversificar tu negocio.' },
  ];

  return (
    <>
    <Helmet>
        <title>Look & Smell - Perfumería y Cosméticos para Revendedores en Costa Rica</title>
        <meta name="description" content="Descubre el catálogo de perfumes y cosméticos en Look & Smell. Accede a precios exclusivos. Envíos a toda Costa Rica." />
        <meta property="og:title" content="Look & Smell - Perfumería Fina en Costa Rica" />
        <meta property="og:description" content="Tu socio de confianza en perfumería y cosméticos. Calidad, variedad y los mejores precios en Costa Rica." />
        <meta property="og:image" content="https://res.cloudinary.com/dl4k0gqfv/image/upload/v1751088623/Gemini_Generated_Image_oscuvxoscuvxoscu_rck3fh.png" />
        <meta property="og:url" content="https://www.look-and-smell.com/" />
        <meta property="og:type" content="website" />
      </Helmet>


    <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>   

      {/* Banner */}
      <PromotionalBanner />

      {/* --- NUEVA SECCIÓN DE BÚSQUEDA --- */}
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            my: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(18,18,18,0.95) 60%, rgba(139, 112, 0, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, textAlign: 'center', mb: 2 }}>
            Encuentra tu Esencia
          </Typography>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label=""
              variant="outlined"
              fullWidth
              size="medium"
              value={homeSearchTerm}
              onChange={(e) => setHomeSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: '#FFD700' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 4,
                borderRadius: '8px',
                color: 'common.black',
                backgroundColor: '#FFD700',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#FFC700' },
              }}
            >
              Buscar
            </Button>
          </Box>
        </Paper>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Top Widgets Section */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {topWidgetData.map((widget, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Box sx={{ p: 3, bgcolor: 'transparent', boxShadow: 'none', border: 'none', borderRadius: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', }}>
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

      {/* Explore All Products Button */}
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
          Explorar Todos los Perfumes
        </Button>
      </Box>


      {/* Featured Products Section */}
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
        <Grid container spacing={2} justifyContent="center">
          {products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={3} lg={3}> 
              {/* --- MODIFIED: Pass the new props to ProductCard --- */}
              <ProductCard 
                product={product} 
                onAddToCart={() => handleAddToCart(product)}
                isAdding={addingProductId === product._id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* call in action button  */}
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
          Explorar Todos los Perfumes
        </Button>
      </Box>

      {/* Middle Widgets Section */}
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
                  cursor: widget.link ? 'pointer' : 'default', 
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: widget.link ? 'translateY(-5px)' : 'none', 
                  }
                }}
                onClick={() => {
                  if (widget.link) {
                    window.open(widget.link, '_blank'); 
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

      

      {/* "Why Choose Us" Section */}
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
    </>
  );
};

export default HomePage;