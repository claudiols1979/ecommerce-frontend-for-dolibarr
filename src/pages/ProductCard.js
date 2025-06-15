import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useOrders } from 'contexts/OrderContext';
import { useAuth } from 'contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItemToCart, loading: cartLoading } = useOrders();
  const { user } = useAuth(); // Get user from AuthContext

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Por favor, inicia sesión para añadir al carrito.");
      return;
    }
    const success = await addItemToCart(product._id, 1);
    // addItemToCart already shows toast
  };

  // Determine price based on user role
  let displayPrice;
  if (user && user.role === 'Revendedor' && product.resellerPrices && product.resellerPrices[user.resellerCategory]) {
    displayPrice = product.resellerPrices[user.resellerCategory];
  } else if (product.resellerPrices && product.resellerPrices.cat1) { // Fallback for non-resellers (e.g., public/admin/editor)
    displayPrice = product.resellerPrices.cat1;
  } else {
    displayPrice = null; // Or a default public price if it exists
  }

  const isOutOfStock = product.countInStock <= 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="180" // Increased height for better product visibility
        image={product.imageUrls?.[0]?.secure_url || 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image'}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 2 }} // Added padding for image
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}> {/* Added minHeight for consistent layout */}
          {product.shortDescription || (product.description ? product.description.substring(0, 70) + '...' : 'No description available.')}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 2, fontWeight: 700 }}>
          {displayPrice !== null ? `₡${displayPrice.toFixed(2)}` : 'Precio no disponible'}
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
          disabled={cartLoading || isOutOfStock}
          sx={{ ml: 1 }}
        >
          {isOutOfStock ? 'Sin Stock' : 'Añadir'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
