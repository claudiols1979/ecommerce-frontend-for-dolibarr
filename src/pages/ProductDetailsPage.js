import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,Card, CardContent,
  TextField, Link as MuiLink, IconButton, useTheme, Divider, Paper, Chip, useMediaQuery,
  Accordion, AccordionSummary, AccordionDetails, Rating, List, ListItem, Avatar, ListItemText, 
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useReviews } from '../contexts/ReviewContext';
import { toast } from 'react-toastify';
import ProductImageCarousel from '../components/product/ProductImageCarousel';
import ProductCard from '../components/product/ProductCard';
import axios from 'axios';
import API_URL from '../config';
import { formatPrice } from '../utils/formatters';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { products: allProductsFromContext } = useProducts();
  const { addItemToCart, loading: cartLoading, myOrders } = useOrders();
  const { user } = useAuth();

  const { reviews, loading: reviewsLoading, fetchReviews, createReview } = useReviews();

  const [product, setProduct] = useState(null);
  const [loadingSpecificProduct, setLoadingSpecificProduct] = useState(true);
  const [errorSpecificProduct, setErrorSpecificProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingProductId, setAddingProductId] = useState(null);
  // --- 2. NUEVO ESTADO PARA LA PREGUNTA DEL CLIENTE ---
  const [customerQuestion, setCustomerQuestion] = useState('');


  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const [canReview, setCanReview] = useState(false);
  const [reviewDisabledMessage, setReviewDisabledMessage] = useState('');
  
  const WHATSAPP_AGENT_NUMBER = '50672317420';

  const getPriceAtSale = useCallback((productData) => {
    if (!productData) return 0;
    let calculatedPrice = 0;
    if (user && user.role === 'Revendedor' && user.resellerCategory && productData.resellerPrices) {
      const resellerCategory = user.resellerCategory;
      const priceForCategory = productData.resellerPrices[resellerCategory];
      if (typeof priceForCategory === 'number' && priceForCategory > 0) {
        calculatedPrice = priceForCategory;
      }
    }
    if (calculatedPrice <= 0 && productData.resellerPrices && typeof productData.resellerPrices.cat1 === 'number' && productData.resellerPrices.cat1 > 0) {
      calculatedPrice = productData.resellerPrices.cat1;
    }
    return isNaN(calculatedPrice) || calculatedPrice <= 0 ? 0 : calculatedPrice;
  }, [user]);

  // --- LÓGICA DE CARGA DE DATOS CORREGIDA Y ROBUSTA ---
useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductDetails = async () => {
      setLoadingSpecificProduct(true);
      setErrorSpecificProduct(null);
      try {
        const token = user?.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get(`${API_URL}/api/products/${id}`, config);
        setProduct(data);

        // Se obtienen las reseñas para este producto
        fetchReviews(id);

        if (allProductsFromContext.length > 1) {
          const filtered = allProductsFromContext.filter(p => p._id !== id);
          const shuffled = [...filtered].sort(() => 0.5 - Math.random());
          setRelatedProducts(shuffled.slice(0, 3));
        }
      } catch (err) {
        setErrorSpecificProduct(err.response?.data?.message || 'Producto no encontrado o error al cargar.');
      } finally {
        setLoadingSpecificProduct(false);
      }
    };
    if (id) {
      fetchProductDetails();
    }
    setQuantity(1);
  }, [id, user?.token, allProductsFromContext, fetchReviews]);


  // --- useEffect para determinar si el usuario puede dejar una reseña ---
  useEffect(() => {
    if (!user) {
      setCanReview(false);
      setReviewDisabledMessage('Inicia sesión para dejar una reseña.');
      return;
    }

    const hasReviewed = reviews.some(review => review.user._id === user._id);
    if (hasReviewed) {
      setCanReview(false);
      setReviewDisabledMessage('Ya has dejado una reseña para este producto.');
      return;
    }

    const hasPurchased = myOrders.some(order => 
      order.status === 'delivered' && 
      order.items.some(item => item.product && item.product._id === id)
    );
    
    if (!hasPurchased) {
      setCanReview(false);
      setReviewDisabledMessage('Debes haber comprado este producto para dejar una reseña.');
      return;
    }
    
    setCanReview(true);
    setReviewDisabledMessage('Tu comentario (opcional)');
  }, [user, reviews, myOrders, id]);


  const displayPrice = getPriceAtSale(product);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;

    }
    if (!product) { return; }
    if (quantity <= 0) {

      return;
    }
    if (quantity > product.countInStock) {

      return;
    }
    const priceToPass = getPriceAtSale(product);
    if (priceToPass <= 0) {

      return;
    }
    await addItemToCart(product._id, quantity, priceToPass);
  };

  const handleRelatedProductAddToCart = useCallback(async (relatedProduct, qty) => {
    if (typeof addItemToCart !== 'function') {

      return;
    }
    setAddingProductId(relatedProduct._id);
    const priceToPass = getPriceAtSale(relatedProduct);
    if (priceToPass <= 0) {

      setAddingProductId(null);
      return;
    }
    try {
      await addItemToCart(relatedProduct._id, qty, priceToPass);

    } catch (err) {
      console.log(err.message);
    } finally {
      setAddingProductId(null);
    }
  }, [addItemToCart, getPriceAtSale]);

  // --- 3. NUEVA FUNCIÓN PARA ENVIAR CONSULTA POR WHATSAPP ---
  const handleWhatsAppInquiry = () => {
    if (!product) {
        toast.error("No se puede enviar la consulta, los detalles del producto no están disponibles.");
        return;
    }

    let message = `¡Hola! 👋\n\nQuisiera hacer una consulta sobre el siguiente producto:\n\n`;
    message += `*Producto:* ${product.name}\n`;
    message += `*Código:* ${product.code}\n`;
    message += `*Precio:* ${formatPrice(displayPrice)}\n\n`;
    message += `*Mi consulta es:*\n${customerQuestion || "(Por favor, escribe tu pregunta aquí)"}\n\n`;
    message += `¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappLink, '_blank');
    setCustomerQuestion('')
  };


const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!canReview) {
      toast.info("No cumples los requisitos para dejar una reseña.");
      return;
    }
    if (newRating === 0) {
      toast.error("Por favor, selecciona una calificación de estrellas.");
      return;
    }
    try {
      await createReview({
        productId: id,
        rating: newRating,
        comment: newComment,
      });
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      console.error("Fallo al enviar la reseña:", err);
    }
  };


// --- DATOS DE FAQ ACTUALIZADOS ---

// 1. Se define el número de WhatsApp y el mensaje por defecto
const WHATSAPP_AGENT_NUMBER_ = '50672317420';
const wholesaleMessage = "Hola, estoy interesado/a en sus precios de mayoreo y me gustaría recibir más información. Gracias.";
const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER_}?text=${encodeURIComponent(wholesaleMessage)}`;

// 2. Se reescribe el contenido para un tono más profesional
const faqData = [
  {
    question: '1. ¿Cuáles son los métodos de pago aceptados?',
    answer: 'Aceptamos pagos a través de SINPE Móvil y Transferencia Bancaria. Una vez que finalices tu pedido, se abrirá una ventana de WhatsApp donde nuestro equipo coordinará contigo los detalles del pago y la confirmación del envío de manera segura y personalizada.'
  },
  {
    question: '2. ¿Cuál es el tiempo de entrega estimado?',
    answer: 'Para envíos dentro de la GAM, trabajamos con Mensajería Fonseca para garantizar una entrega rápida, usualmente en las siguientes 24 horas. Dependiendo de la demanda, el plazo puede extenderse a un máximo de 48 horas. Tu entrega es nuestra prioridad y está 100% garantizada.'
  },
  {
    question: '3. ¿La perfumería es original?',
    answer: 'Absolutamente. Garantizamos que todos nuestros productos son 100% originales, nuevos y se entregan sellados en su empaque de fábrica. La autenticidad es el pilar de nuestra marca.'
  },
  {
    question: '4. ¿Realizan envíos fuera de la GAM?',
    answer: 'Sí. Para las provincias de Guanacaste, Puntarenas y Limón, los envíos se gestionan a través de Correos de Costa Rica. El costo del envío se cancela contra entrega directamente en la sucursal. Te proporcionaremos el número de guía oficial para que puedas rastrear tu paquete en todo momento.'
  },
  {
    question: '5. ¿Ofrecen precios especiales para ventas al por mayor?',
    answer: (
      // 3. La respuesta ahora es un componente de React para incluir el botón
      <>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
          Definitivamente. Nuestro modelo de negocio está diseñado para potenciar a los revendedores. Para acceder a nuestras listas de precios mayoristas y recibir asesoría personalizada, por favor contáctanos directamente.
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            bgcolor: '#25D366',
            '&:hover': {
              bgcolor: '#1EBE57',
            },
            fontWeight: 'bold',
          }}
        >
          Consultar por WhatsApp
        </Button>
      </>
    )
  }
];


  if (loadingSpecificProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        {/* Contenedor para aplicar el efecto de sombra/resplandor */}
        <Box sx={{ position: 'relative', display: 'inline-flex', filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))' }}>
          {/* Círculo de fondo (la pista) */}
          <CircularProgress
            variant="determinate"
            sx={{
              color: 'rgba(255, 215, 0, 0.25)', // Pista de un color amarillo muy tenue
            }}
            size={40}
            thickness={4}
            value={100}
          />
          {/* Círculo de progreso animado */}
          <CircularProgress
            variant="indeterminate"
            disableShrink
            sx={{
              color: '#FFD700', // Color dorado principal
              animationDuration: '600ms',
              position: 'absolute',
              left: 0,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round', // Bordes redondeados para un look más suave
              },
            }}
            size={40}
            thickness={4}
          />
        </Box>
      </Box>
    );
  }

  if (errorSpecificProduct) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error">{errorSpecificProduct}</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Volver a Productos</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="warning">Producto no encontrado.</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Volver a Productos</Button>
      </Container>
    );
  }

  const isOutOfStock = product.countInStock <= 0;

  const contentSectionStyle = {
    my: 5, p: { xs: 2.5, sm: 3.5 }, bgcolor: 'background.paper', borderRadius: 3,
    boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.grey[100]}`,
    transition: 'box-shadow 0.3s ease-in-out', '&:hover': { boxShadow: theme.shadows[4] }
  };

  const sectionTitleStyle = { fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'left' };

  const genderMap = { 'men': 'Hombre', 'women': 'Mujer', 'unisex': 'Unisex', 'children': 'Niños', 'elderly': 'Ancianos', 'other': 'Otro' };
  const getTranslatedGender = (gender) => genderMap[gender.toLowerCase()] || gender;

const formatProductNameMultiLine = (name, maxLength) => {
  // If the name is already short enough, return it as is.
  if (name.length <= maxLength) {
    return name;
  }

  const lines = [];
  let remainingText = name;

  // Loop as long as the remaining text is longer than the max line length
  while (remainingText.length > maxLength) {
    // Find the last space within the allowed length for the current line.
    let breakPoint = remainingText.substring(0, maxLength).lastIndexOf(' ');
    
    // If no space is found (one very long word), we have to break the word.
    // Otherwise, we break at the last space found.
    let splitIndex = (breakPoint === -1) ? maxLength : breakPoint;

    // Add the new line to our array.
    lines.push(remainingText.substring(0, splitIndex));
    
    // Update the remaining text for the next loop iteration.
    remainingText = remainingText.substring(splitIndex).trim();
  }

  // Add the final, shorter piece of text as the last line.
  lines.push(remainingText);

  // Join all the generated lines with a newline character.
  return lines.join('\n');
};

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} - Look & Smell` : 'Detalle de Producto'}</title>
        <meta name="description" content={product ? `Compra ${product.name}, perfumería fina en Costa Rica. ${product.description.substring(0, 120)}...` : 'Descubre nuestra colección de perfumes y cosméticos.'} />
        {/* Open Graph Tags (para compartir en redes sociales) */}
        <meta property="og:title" content={product ? product.name : 'Look & Smell'} />
        <meta property="og:description" content={product ? product.description.substring(0, 120) : 'Tu tienda de confianza para perfumería.'} />
        <meta property="og:image" content={product?.imageUrls?.[0]?.secure_url} />
      </Helmet>

      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained" color="secondary" startIcon={<ArrowBackIcon />}
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
            Volver a Productos
          </Button>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <ProductImageCarousel imageUrls={product.imageUrls} productName={product.name} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[1] }}>
              <Typography
  variant="h3"
  component="h1"
  gutterBottom
  sx={{
    fontWeight: 700,
    color: 'primary.main',
    fontSize: { xs: '2rem', md: '2.5rem' },
    // 👇 Add this CSS property to respect the newline character
    whiteSpace: 'pre-line',
  }}
>
  {/* Call the function to format the name */}
  {formatProductNameMultiLine(product.name, 22)}
</Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{product.brand || 'Sin descripción disponible.'}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h4" color="secondary" sx={{ mb: 2, fontWeight: 800 }}>{displayPrice !== null ? (formatPrice(displayPrice)) : 'Precio no disponible'}</Typography>
              <Typography variant="body1" color={isOutOfStock ? 'error.main' : 'text.primary'} sx={{ mb: 2, fontWeight: 600 }}>Stock Disponible: {product.countInStock} {isOutOfStock && '(Agotado)'}</Typography>

              <Box display="flex" alignItems="center" mb={3}>
                {isMobile ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || cartLoading || isOutOfStock}><RemoveCircleOutlineIcon /></IconButton>
                    <Typography sx={{ width: '2ch', textAlign: 'center' }}>{quantity}</Typography>
                    <IconButton onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} disabled={quantity >= product.countInStock || cartLoading || isOutOfStock}><AddCircleOutlineIcon /></IconButton>
                  </Box>
                ) : (
                  // <TextField
                  //   type="number" label="Cantidad" value={quantity}
                  //   onChange={(e) => setQuantity(Math.max(1, Math.min(product.countInStock, parseInt(e.target.value) || 1)))}
                  //   inputProps={{ min: 1, max: product.countInStock }}
                  //   size="medium" sx={{ width: 120, mr: 2 }}
                  //   disabled={cartLoading || isOutOfStock}
                  // />
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || cartLoading || isOutOfStock}><RemoveCircleOutlineIcon /></IconButton>
                    <Typography sx={{ width: '2ch', textAlign: 'center' }}>{quantity}</Typography>
                    <IconButton onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} disabled={quantity >= product.countInStock || cartLoading || isOutOfStock}><AddCircleOutlineIcon /></IconButton>
                  </Box>
                )}
                <Button
                  variant="contained" color="primary" startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={cartLoading || isOutOfStock || quantity > product.countInStock || displayPrice <= 0}
                  sx={{
                    borderRadius: 8, textTransform: 'none', px: { xs: 2, sm: 4 }, py: 1.5, ml: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    boxShadow: `0 3px 5px 2px rgba(33, 33, 33, .3)`, color: 'white',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                      boxShadow: `0 3px 8px 3px rgba(33, 33, 33, .4)`, transform: 'translateY(-2px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  Añadir al Carrito
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={contentSectionStyle}>
          <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>Descripción del Producto</Typography>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>{product.description || 'No hay descripción detallada disponible para este producto.'}</Typography>

          {/* --- 4. NUEVA SECCIÓN DE CONSULTA POR WHATSAPP --- */}
        <Card sx={{ ...contentSectionStyle, mt: 5 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
              ¿Tienes alguna consulta?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Escríbenos directamente a WhatsApp y te ayudaremos con gusto.
            </Typography>
            <TextField
              label="Escribe tu pregunta aquí..."
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={customerQuestion}
              onChange={(e) => setCustomerQuestion(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppInquiry}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: '8px',
                bgcolor: '#25D366',
                '&:hover': {
                  bgcolor: '#1EBE57',
                },
              }}
            >
              Consultar por WhatsApp
            </Button>
          </CardContent>
        </Card>
        </Box>
        <Box sx={contentSectionStyle}>
          <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>Especificaciones</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography variant="body1"><Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoría:</Typography> {product.category || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Marca:</Typography> {product.brand || 'N/A'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body1"><Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Código SKU:</Typography> {product.productCode || product.code || 'N/A'}</Typography></Grid>
            {product.gender && (<Grid item xs={12} sm={6}><Typography variant="body1"><Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Género:</Typography> {getTranslatedGender(product.gender)}</Typography></Grid>)}
            {product.volume && (<Grid item xs={12} sm={6}><Typography variant="body1"><Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Volumen:</Typography> {product.volume}</Typography></Grid>)}
          </Grid>
        </Box>

        {product.tags && product.tags.length > 0 && (
          <Box sx={contentSectionStyle}>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>Notas Aromáticas</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {product.tags.map((tagItem, tagIndex) => (
                <Button key={tagIndex} variant="contained" color="secondary" sx={{ borderRadius: 1, fontWeight: 600, cursor: 'default', textTransform: 'none', pointerEvents: 'none', boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: theme.palette.primary.main, }, '&:active': { boxShadow: 'none', bgcolor: theme.palette.primary.main, } }}>
                  {tagItem}
                </Button>
              ))}
            </Box>
          </Box>
        )}

{/* --- 4. NUEVA SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) --- */}
        <Box sx={{ ...contentSectionStyle, mt: 5 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
              Preguntas Frecuentes
            </Typography>
            {faqData.map((faq, index) => (
              <Accordion key={index} sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'text.primary',
                boxShadow: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 'auto 0' }
              }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'secondary.main' }} />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>


{/* --- SECCIÓN DE CALIFICACIONES Y RESEÑAS ACTUALIZADA --- */}
        <Card sx={{ ...contentSectionStyle, mt: 5 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
              Calificaciones y Reseñas
            </Typography>
            {product.numReviews > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ mr: 2, fontWeight: 'bold' }}>
                  {product.averageRating.toFixed(1)}
                </Typography>
                <Box>
                  <Rating value={product.averageRating} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    Basado en {product.numReviews} reseña(s)
                  </Typography>
                </Box>
              </Box>
            )}

            {reviewsLoading ? (
              <CircularProgress />
            ) : reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 2 }}>
                Aún no hay reseñas para este producto. ¡Sé el primero en calificarlo!
              </Typography>
            ) : (
              <List>
                {reviews.map((review, index) => (
                  <React.Fragment key={review._id}>
                    <ListItem alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        {review.user.firstName ? review.user.firstName.charAt(0) : '?'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span" variant="body1" sx={{ fontWeight: 'bold' }}>
                              {review.user.firstName || 'Usuario'} {review.user.lastName || ''}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" sx={{ ml: 1.5, verticalAlign: 'middle' }} />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}>
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString('es-CR')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Formulario para Dejar una Reseña (con lógica condicional) */}
            {user && (
              <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Escribe tu propia reseña</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Tu Calificación</Typography>
                  <Rating
                    name="new-rating"
                    value={newRating}
                    onChange={(event, newValue) => { setNewRating(newValue); }}
                    readOnly={!canReview} // Se deshabilita si no puede reseñar
                  />
                </Box>
                <TextField
                  label={reviewDisabledMessage} // Label dinámico
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!canReview} // Se deshabilita si no puede reseñar
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={!canReview || reviewsLoading}>
                  Enviar Reseña
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>


        {relatedProducts.length > 0 && (
          <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ ...sectionTitleStyle, textAlign: 'center' }}>Productos Relacionados</Typography>
            <Grid container spacing={4} justifyContent="center">
              {relatedProducts.map((p) => (
                <Grid item key={p._id} xs={12} sm={6} md={6} lg={6}>
                  <ProductCard
                    product={p}
                    onAddToCart={(qty) => handleRelatedProductAddToCart(p, 1)}
                    isAdding={addingProductId === p._id}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {relatedProducts.length === 0 && !loadingSpecificProduct && (
          <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">No se encontraron productos relacionados.</Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default ProductDetailsPage;
