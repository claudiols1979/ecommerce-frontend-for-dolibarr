import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useOrders } from 'contexts/OrderContext';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'react-toastify'; // Importamos toast para el caso de que el precio no esté disponible

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // Mantenemos los hooks porque el Card es autosuficiente
  const { addItemToCart, loading: cartLoading } = useOrders();
  const { user } = useAuth();

  // --- Lógica para calcular el precio (idéntica a la de ProductDetailsPage) ---
  const getPriceForProduct = (prod) => {
    if (!prod) return null;

    if (user && user.role === 'Revendedor' && prod.resellerPrices && prod.resellerPrices[user.resellerCategory]) {
      return prod.resellerPrices[user.resellerCategory];
    }
    // Fallback para no-revendedores o si su categoría no tiene precio
    if (prod.resellerPrices && prod.resellerPrices.cat1) {
      return prod.resellerPrices.cat1;
    }
    return null; // No hay precio disponible
  };

  const displayPrice = getPriceForProduct(product);
  const isOutOfStock = product.countInStock <= 0;

  // --- El manejador de clic corregido ---
  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Por favor, inicia sesión para añadir productos al carrito.');
      return;
    }
    
    // 1. Calculamos el precio de venta en el momento del clic
    const priceToPass = getPriceForProduct(product);

    // 2. Validamos que el precio exista
    if (priceToPass === null || priceToPass <= 0) {
      toast.error('Este producto no tiene un precio válido y no se puede añadir al carrito.');
      return;
    }

    // 3. Llamamos a addItemToCart con la "firma" completa de 3 argumentos
    await addItemToCart(product._id, 1, priceToPass);
    // El toast de éxito ya lo muestra el contexto, como bien indicaste.
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="180"
        image={product.imageUrls?.[0]?.secure_url || 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image'}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 2 }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
          {product.shortDescription || (product.description ? product.description.substring(0, 70) + '...' : 'No description available.')}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2, fontWeight: 700 }}>
          {displayPrice !== null ? `{formatPrice(displayPrice)}` : 'Precio no disponible'}
        </Typography>
        {isOutOfStock && (
          <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 600 }}>
            Sin Stock
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button size="small" onClick={() => navigate(`/products/${product._id}`)} variant="outlined">
          Ver Detalles
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleAddToCart}
          startIcon={cartLoading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
          disabled={cartLoading || isOutOfStock || displayPrice === null}
          sx={{ ml: 1 }}
        >
          {isOutOfStock ? 'Sin Stock' : 'Añadir'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;