import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,
  TextField, Link as MuiLink, IconButton, useTheme, Divider, Paper, Chip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext'; // Importa useProducts del contexto
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProductImageCarousel from '../components/product/ProductImageCarousel';
import ProductCard from '../components/product/ProductCard';


const ProductDetailsPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const theme = useTheme();

  const { fetchProducts, products: allProductsFromContext, loading: productsLoading, error: productsError } = useProducts(); 
  const { addItemToCart, loading: cartLoading } = useOrders();
  const { user } = useAuth();

  const [product, setProduct] = useState(null); 
  const [loadingSpecificProduct, setLoadingSpecificProduct] = useState(true); 
  const [errorSpecificProduct, setErrorSpecificProduct] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  /**
   * Determina el precio de venta del producto para el usuario actual.
   * Prioriza la categoría de revendedor del usuario, luego cat1 como fallback.
   * Retorna 0 si no se puede determinar un precio válido y positivo.
   */
  const getPriceAtSale = useCallback((productData) => {
    if (!productData) return 0;

    let calculatedPrice = 0;

    if (user && user.role === 'Revendedor' && user.resellerCategory && productData.resellerPrices) {
      const resellerCategory = user.resellerCategory;
      const priceForCategory = productData.resellerPrices[resellerCategory];
      if (typeof priceForCategory === 'number' && priceForCategory > 0) {
        calculatedPrice = priceForCategory;
      } else {
        console.warn(`ProductDetails: Precio para categoría '${resellerCategory}' no válido o no positivo en el producto '${productData.name}'. Intentando otras opciones.`);
      }
    } 
    
    if (calculatedPrice <= 0 && productData.resellerPrices && typeof productData.resellerPrices.cat1 === 'number' && productData.resellerPrices.cat1 > 0) {
      calculatedPrice = productData.resellerPrices.cat1;
    }

    if (isNaN(calculatedPrice) || calculatedPrice <= 0) {
      console.error(`ProductDetails: No se pudo determinar un precio válido y positivo para el producto "${productData.name}". Verifique 'resellerPrices' en la base de datos y la categoría del usuario. Producto:`, productData, 'Usuario:', user);
      return 0; 
    }
    return calculatedPrice;
  }, [user]); 

  // Función para obtener y establecer productos relacionados aleatorios (excluyendo el actual)
  const fetchAndSetRelatedProducts = useCallback(async () => {
    let productsToFilter = allProductsFromContext;
    if (!productsToFilter || productsToFilter.length === 0) {
        const response = await fetchProducts(1, 20); 
        productsToFilter = response?.products || [];
    }
    
    if (productsToFilter.length > 0) {
      const filteredProducts = productsToFilter.filter(p => p._id !== id);
      
      if (filteredProducts.length > 0) {
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random()); 
        setRelatedProducts(shuffled.slice(0, 2)); 
        console.log("Productos relacionados cargados:", shuffled.slice(0, 2)); 
      } else {
        setRelatedProducts([]);
        console.log("No se encontraron productos relacionados después de filtrar el actual."); 
      }
    } else {
      setRelatedProducts([]);
      console.log("No se pudieron cargar productos o no hay suficientes para relacionados."); 
    }
  }, [allProductsFromContext, fetchProducts, id]);


  useEffect(() => {
    const findProductInContext = () => {
      if (id && allProductsFromContext && allProductsFromContext.length > 0) {
        const foundProduct = allProductsFromContext.find(p => p._id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setLoadingSpecificProduct(false);
          setErrorSpecificProduct(null);
          fetchAndSetRelatedProducts(); 
        } else {
          setErrorSpecificProduct('Producto no encontrado en la lista principal. Refresca la página o busca directamente.');
          setLoadingSpecificProduct(false);
        }
      } else if (!id) {
          setErrorSpecificProduct('ID de producto no encontrado en la URL. Por favor, vuelva a la página de productos.');
          setLoadingSpecificProduct(false);
      }
    };

    if (allProductsFromContext.length > 0 || !productsLoading) {
        findProductInContext();
    } else {
        setLoadingSpecificProduct(true);
    }
    
    setQuantity(1); 
  }, [id, allProductsFromContext, productsLoading, fetchAndSetRelatedProducts]); 

  // Calcula el displayPrice usando la misma lógica que getPriceAtSale, pero para mostrarlo
  const displayPrice = getPriceAtSale(product);

  // *** DEFINICIÓN DE handleAddToCart ***
  // Asegúrate de que esta función esté DENTRO del componente ProductDetailsPage
  // y ANTES de que se use en el JSX.
  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Por favor, inicia sesión para añadir al carrito.");
      return;
    }
    if (!product) { 
        toast.error('Producto no cargado aún.');
        return;
    }
    if (quantity <= 0) {
      toast.error('La cantidad debe ser al menos 1.');
      return;
    }
    if (quantity > product.countInStock) { 
        toast.error(`No hay suficiente stock. Disponible: ${product.countInStock}.`);
        return;
    }

    const priceToPass = getPriceAtSale(product);
    if (priceToPass <= 0) {
        toast.error('No se puede añadir al carrito: Precio de venta no disponible o inválido.');
        console.error('ProductDetails: Intento de añadir producto con precio de venta no válido (0 o menos).', { product, priceToPass, quantity });
        return;
    }

    await addItemToCart(product._id, quantity, priceToPass); 
    toast.success(`"${product.name}" añadido al carrito.`);
  };
  // *** FIN DEFINICIÓN DE handleAddToCart ***


  // Renderizado condicional basado en el estado de carga y error del producto
  if (loadingSpecificProduct || productsLoading) { 
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Cargando producto...</Typography>
      </Container>
    );
  }

  if (errorSpecificProduct || productsError) { 
    const errorMessage = errorSpecificProduct?.message || productsError?.message || 'Error desconocido al cargar el producto.';
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error">{errorMessage}</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Volver a Productos</Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="warning">Producto no encontrado.</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2}}>Volver a Productos</Button>
      </Container>
    );
  }

  const isOutOfStock = product.countInStock <= 0;

  // Estilo común para las secciones de contenido (desde tu código)
  const contentSectionStyle = { 
    my: 5, 
    p: { xs: 2.5, sm: 3.5 }, 
    bgcolor: 'background.paper', 
    borderRadius: 3, 
    boxShadow: theme.shadows[2], 
    border: `1px solid ${theme.palette.grey[100]}`, 
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows[4], 
    }
  };

  const sectionTitleStyle = { 
    fontWeight: 700, 
    color: 'primary.main', 
    mb: 3, 
    textAlign: 'left' 
  };

  // Mapeo para traducir el género
  const genderMap = {
    'men': 'Hombre',
    'women': 'Mujer',
    'unisex': 'Unisex',
    'children': 'Niños',
    'elderly': 'Ancianos',
    'other': 'Otro',
  };

  // Función para obtener el género traducido
  const getTranslatedGender = (gender) => {
    return genderMap[gender.toLowerCase()] || gender; 
  };


  return (
    <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
      {/* Botón Volver a Productos */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ borderRadius: 8, textTransform: 'none' }}
        >
          Volver a Productos
        </Button>
      </Box>

      <Grid container spacing={5}> 
        {/* Columna de Galería de Imágenes */}
        <Grid item xs={12} md={6}>
          {/* Se pasa imageUrls desde el producto cargado */}
          <ProductImageCarousel imageUrls={product.imageUrls} productName={product.name} />
        </Grid>

        {/* Columna de Detalles del Producto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, boxShadow: theme.shadows[1] }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {product.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
              {product.brand || 'Sin descripción disponible.'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Muestra el precio calculado por getPriceAtSale */}
            <Typography variant="h4" color="secondary" sx={{ mb: 2, fontWeight: 800 }}>
              {displayPrice !== null ? `₡${displayPrice.toFixed(2)}` : 'Precio no disponible'}
            </Typography>

            <Typography variant="body1" color={isOutOfStock ? 'error.main' : 'text.primary'} sx={{ mb: 2, fontWeight: 600 }}>
              Stock Disponible: {product.countInStock} {isOutOfStock && '(Agotado)'}
            </Typography>

            {/* Selector de Cantidad y Botón Añadir al Carrito */}
            <Box display="flex" alignItems="center" mb={3}>
              <TextField
                type="number"
                label="Cantidad"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.countInStock, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: product.countInStock }}
                size="medium"
                sx={{ width: 120, mr: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                onClick={handleAddToCart} // Aquí se utiliza handleAddToCart
                disabled={cartLoading || isOutOfStock || quantity > product.countInStock || displayPrice <= 0}
                sx={{
                  borderRadius: 8,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  boxShadow: `0 3px 5px 2px rgba(33, 33, 33, .3)`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                    boxShadow: `0 3px 8px 3px rgba(33, 33, 33, .4)`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Sección de Descripción Detallada - Estilo Mejorado */}
      <Box sx={contentSectionStyle}>
        <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
          Descripción del Producto
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
          {product.description || 'No hay descripción detallada disponible para este producto.'}
        </Typography>
      </Box>

      {/* Sección de Especificaciones - Estilo Mejorado */}
      <Box sx={contentSectionStyle}>
        <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
          Especificaciones
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Categoría:</Typography> {product.category || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Marca:</Typography> {product.brand || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Código SKU:</Typography> {product.productCode || product.code || 'N/A'}
            </Typography>
          </Grid>
          {product.gender && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Género:</Typography> {getTranslatedGender(product.gender)}
              </Typography>
            </Grid>
          )}
          {product.volume && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <Typography component="span" sx={{ fontWeight: 600, color: 'text.secondary' }}>Volumen:</Typography> {product.volume}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Sección de Notas Aromáticas / Etiquetas - Estilo Mejorado */}
      {product.tags && product.tags.length > 0 && (
        <Box sx={contentSectionStyle}>
          <Typography variant="h5" component="h2" gutterBottom sx={sectionTitleStyle}>
            Notas Aromáticas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {product.tags.map((tag, index) => (
              <Chip key={index} label={tag} variant="outlined" color="primary" sx={{ borderRadius: 1, fontWeight: 600 }} />
            ))}
          </Box>
        </Box>
      )}

      {/* Sección de Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ ...sectionTitleStyle, textAlign: 'center' }}>
            Productos Relacionados
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {relatedProducts.map((p) => (
              <Grid item key={p._id} xs={12} sm={6} md={6} lg={6}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {relatedProducts.length === 0 && !loadingSpecificProduct && (
        <Box sx={{ ...contentSectionStyle, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron productos relacionados.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailsPage;