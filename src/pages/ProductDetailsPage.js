import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Grid, Paper, IconButton, TextField, useTheme } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext'; // Asegúrate de que la ruta sea correcta
import { useOrders } from '../contexts/OrderContext'; // Asegúrate de que la ruta sea correcta
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { api, user } = useAuth(); // Obtener usuario y API de AuthContext
  const { addItemToCart } = useOrders(); // Obtener addItemToCart de OrderContext

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Función para determinar el `priceAtSale`
  const getPriceAtSale = useCallback(() => {
    if (!product) return 0; // Si los datos del producto no están cargados, devuelve 0

    let finalPrice = product.price; // Precio público por defecto

    // Lógica para usuarios con rol 'Revendedor'
    if (user && user.role === 'Revendedor' && user.resellerCategory && product.resellerPrices) {
      const resellerCategory = user.resellerCategory;
      // Verifica si existe un precio para la categoría específica del revendedor y es un número válido
      if (typeof product.resellerPrices[resellerCategory] === 'number' && product.resellerPrices[resellerCategory] > 0) {
        finalPrice = product.resellerPrices[resellerCategory];
      } else {
        // Advertencia si la categoría de revendedor no tiene un precio válido asignado en el producto
        console.warn(`ProductDetails: El producto '${product.name}' no tiene un precio válido para la categoría de revendedor '${resellerCategory}'. Usando el precio público.`, { resellerCategory, productResellerPrices: product.resellerPrices });
      }
    } else if (user && (user.role === 'Administrador' || user.role === 'Editor') && product.resellerPrices && typeof product.resellerPrices.cat1 === 'number' && product.resellerPrices.cat1 > 0) {
        // Para administradores/editores, usar cat1 si está disponible y es válido, si no, usa el precio público.
        finalPrice = product.resellerPrices.cat1;
    }

    // Asegura que el precio final sea un número válido y positivo.
    // Si no lo es, devuelve 0 para deshabilitar la acción de añadir al carrito.
    if (isNaN(finalPrice) || finalPrice <= 0) {
      console.error(`ProductDetails: Precio final inválido o ausente para el producto "${product.name}". Calculado: ${finalPrice}.`, { product, user });
      return 0; 
    }
    return finalPrice;
  }, [product, user]); // Dependencias para useCallback: product y user

  const currentPriceAtSale = getPriceAtSale(); // Obtener el precio actual de venta

  // Efecto para cargar los detalles del producto cuando cambia el `productId` o la instancia `api`
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Asume que tienes una ruta /api/products/:productId para obtener un solo producto
        const response = await api.get(`/api/products/${productId}`); 
        setProduct(response.data);
      } catch (err) {
        console.error('Error al obtener los detalles del producto:', err);
        setError('No se pudo cargar los detalles del producto.');
        toast.error('Error al cargar los detalles del producto.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, api]);

  // Manejador para añadir el producto al carrito
  const handleAddToCart = async () => {
    if (quantity <= 0) {
      toast.error('La cantidad debe ser al menos 1.');
      return;
    }
    if (currentPriceAtSale <= 0) {
      toast.error('No se puede añadir al carrito: Precio de venta inválido.');
      console.error('ProductDetails: Intento de añadir producto con precio de venta no válido (0 o menos).', { product, currentPriceAtSale, quantity });
      return;
    }

    setAddingToCart(true); // Activa el indicador de carga
    try {
      // Llama a la función addItemToCart del OrderContext
      await addItemToCart(product._id, quantity, currentPriceAtSale);
    } catch (error) {
      console.error('Error al añadir al carrito desde ProductDetails:', error);
      toast.error('Error al añadir el producto al carrito.');
    } finally {
      setAddingToCart(false); // Desactiva el indicador de carga
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Volver a Productos
        </Button>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Producto no encontrado.</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Volver a Productos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)} // Volver a la página anterior
        sx={{ mb: 3 }}
      >
        Volver
      </Button>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          {/* Columna de la Imagen del Producto */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 400,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0].secure_url : 'https://placehold.co/400x400/E0E0E0/FFFFFF?text=No+Image'}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/E0E0E0/FFFFFF?text=No+Image'; }}
              />
            </Box>
          </Grid>

          {/* Columna de Detalles del Producto */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Código: {product.code}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Descripción: {product.description || 'No hay descripción disponible.'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Volumen: {product.volume || 'N/A'}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              Precio: ₡{currentPriceAtSale.toFixed(2)} {/* Muestra el precio calculado */}
            </Typography>

            {/* Controles de Cantidad */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                size="large"
                sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '50%', mr: 1 }}
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) || val < 1 ? 1 : val);
                }}
                type="number"
                inputProps={{ min: 1, style: { textAlign: 'center', fontSize: '1.2rem' } }}
                sx={{ width: 80 }}
                size="medium"
              />
              <IconButton
                onClick={() => setQuantity(prev => prev + 1)}
                size="large"
                sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '50%', ml: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Botón Añadir al Carrito */}
            <Button
              variant="contained"
              fullWidth
              startIcon={addingToCart ? <CircularProgress size={20} color="inherit" /> : <AddShoppingCartIcon />}
              sx={{
                py: 1.5,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              onClick={handleAddToCart}
              disabled={addingToCart || currentPriceAtSale <= 0} // Deshabilita si está cargando o si el precio es inválido
            >
              {addingToCart ? 'Añadiendo...' : 'Añadir al Carrito'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductDetails;