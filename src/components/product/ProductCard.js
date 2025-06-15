import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Tooltip, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../contexts/OrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItemToCart, loading: cartLoading } = useOrders();
  const { user } = useAuth();
  const theme = useTheme();

  const handleAddToCart = async () => {
    if (!user || !user.token) {
      toast.info("Por favor, inicia sesión para añadir al carrito.");
      return;
    }
    if (product.countInStock <= 0) {
      toast.error('Este producto está agotado.');
      return;
    }
    const success = await addItemToCart(product._id, 1);
  };

  let displayPrice;
  if (user && user.role === 'Revendedor' && product.resellerPrices && product.resellerPrices[user.resellerCategory]) {
    displayPrice = product.resellerPrices[user.resellerCategory];
  } else if (product.resellerPrices && product.resellerPrices.cat1) {
    displayPrice = product.resellerPrices.cat1;
  } else {
    displayPrice = null;
  }

  const isOutOfStock = product.countInStock <= 0;

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: 4, 
      boxShadow: theme.shadows[4], 
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)', 
        boxShadow: theme.shadows[8], 
      },
      bgcolor: 'background.default', // Usa el color de fondo general de la página
      border: `1px solid ${theme.palette.grey[200]}`, // Borde sutil para definirla
    }}>
      <CardMedia
        component="img"
        height="140" 
        image={product.imageUrls?.[0]?.secure_url || 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image'}
        alt={product.name}
        sx={{ 
          objectFit: 'contain', 
          p: 1, 
          bgcolor: 'background.default', // También el fondo de la imagen
          borderRadius: '12px 12px 0 0', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      />
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 1.5, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
      }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            minHeight: 40, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: '-webkit-box',
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            fontSize: '0.95rem', 
            color: theme.palette.primary.main, 
          }}
        >
          {product.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            minHeight: 30, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            display: '-webkit-box',
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            mb: 1, 
            fontSize: '0.8rem', 
          }}
        >
          {product.shortDescription || (product.description ? product.description.substring(0, 60) + '...' : 'No description available.')}
        </Typography>
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}> 
            {displayPrice !== null ? `₡${displayPrice.toFixed(2)}` : 'Precio no disponible'}
          </Typography>
          {isOutOfStock && (
            <Typography variant="body2" color="error" sx={{ fontWeight: 700, ml: 1 }}>
              Sin Stock
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ 
        p: 1.5, 
        pt: 0, 
        justifyContent: 'space-between', 
        borderTop: `1px solid ${theme.palette.grey[100]}`, 
      }}>
        <Button
          size="small"
          onClick={() => navigate(`/products/${product._id}`)}
          variant="outlined"
          color="secondary" 
          startIcon={<VisibilityIcon />}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none',
            fontSize: '0.75rem', 
            py: 0.5, 
            '&:hover': {
              backgroundColor: theme.palette.secondary.light, 
              color: theme.palette.secondary.contrastText, 
            }
          }}
        >
          Ver
        </Button>
        <Tooltip title={isOutOfStock ? "Producto agotado" : "Añadir al carrito"}>
          <span>
            <Button
              size="small"
              variant="contained"
              color="primary" 
              onClick={handleAddToCart}
              startIcon={cartLoading ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
              disabled={cartLoading || isOutOfStock}
              sx={{ 
                ml: 1, 
                borderRadius: 2, 
                textTransform: 'none',
                fontSize: '0.75rem', 
                py: 0.5, 
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
              {isOutOfStock ? 'Agotado' : 'Añadir'}
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ProductCard;