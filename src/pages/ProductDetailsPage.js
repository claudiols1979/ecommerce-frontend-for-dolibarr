import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,
  TextField, Link as MuiLink, IconButton, useTheme, Divider, Paper, Chip, useMediaQuery
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProductImageCarousel from '../components/product/ProductImageCarousel';
import ProductCard from '../components/product/ProductCard';
import axios from 'axios'; // Import axios for direct API calls if needed
import API_URL from '../config'; // Import API_URL


const ProductDetailsPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { products: allProductsFromContext } = useProducts(); 
  const { addItemToCart, loading: cartLoading } = useOrders();
  const { user } = useAuth();

  const [product, setProduct] = useState(null); 
  const [loadingSpecificProduct, setLoadingSpecificProduct] = useState(true); 
  const [errorSpecificProduct, setErrorSpecificProduct] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const [addingProductId, setAddingProductId] = useState(null);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    const findProduct = async () => {
        setLoadingSpecificProduct(true);
        let foundProduct = allProductsFromContext.find(p => p._id === id);

        if (!foundProduct) {
            try {
                const { data } = await axios.get(`${API_URL}/api/products/${id}`);
                foundProduct = data;
            } catch (err) {
                setErrorSpecificProduct('Producto no encontrado o error al cargar.');
                setLoadingSpecificProduct(false);
                return;
            }
        }
        
        setProduct(foundProduct);

        if (allProductsFromContext.length > 1) {
            const filtered = allProductsFromContext.filter(p => p._id !== id);
            const shuffled = [...filtered].sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 2));
        }

        setLoadingSpecificProduct(false);
    };

    if (id) {
        findProduct();
    }
    setQuantity(1);
  }, [id, allProductsFromContext]);


  const displayPrice = getPriceAtSale(product);

  const handleAddToCart = async () => {
    if (!user) { return; }
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
      toast.error(err.message || "No se pudo añadir el producto.");
    } finally {
      setAddingProductId(null);
    }
  }, [addItemToCart, getPriceAtSale]);


  if (loadingSpecificProduct) { 
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Cargando producto...</Typography>
      </Container>
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
        <Button onClick={() => navigate('/products')} sx={{ mt: 2}}>Volver a Productos</Button>
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

  console.log("relatedProducts: ", relatedProducts)

  return (
    <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined" color="primary" startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ borderRadius: 8, textTransform: 'none' }}
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
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '2rem', md: '2.5rem' } }}>{product.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{product.brand || 'Sin descripción disponible.'}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h4" color="secondary" sx={{ mb: 2, fontWeight: 800 }}>{displayPrice !== null ? `₡${displayPrice.toFixed(2)}` : 'Precio no disponible'}</Typography>
            <Typography variant="body1" color={isOutOfStock ? 'error.main' : 'text.primary'} sx={{ mb: 2, fontWeight: 600 }}>Stock Disponible: {product.countInStock} {isOutOfStock && '(Agotado)'}</Typography>
            
            <Box display="flex" alignItems="center" mb={3}>
              {isMobile ? (
                  <Box display="flex" alignItems="center" gap={1}>
                      <IconButton onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || cartLoading || isOutOfStock}><RemoveCircleOutlineIcon /></IconButton>
                      <Typography sx={{ width: '2ch', textAlign: 'center' }}>{quantity}</Typography>
                      <IconButton onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} disabled={quantity >= product.countInStock || cartLoading || isOutOfStock}><AddCircleOutlineIcon /></IconButton>
                  </Box>
              ) : (
                <TextField
                  type="number" label="Cantidad" value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.countInStock, parseInt(e.target.value) || 1)))}
                  inputProps={{ min: 1, max: product.countInStock }}
                  size="medium" sx={{ width: 120, mr: 2 }}
                  disabled={cartLoading || isOutOfStock}
                />
              )}
              <Button
                variant="contained" color="primary" startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={cartLoading || isOutOfStock || quantity > product.countInStock || displayPrice <= 0}
                sx={{
                  borderRadius: 8, textTransform: 'none', px: {xs: 2, sm: 4}, py: 1.5, ml: 1,
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
  );
};

export default ProductDetailsPage;