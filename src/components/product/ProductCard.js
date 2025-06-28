import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Tooltip, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoginIcon from '@mui/icons-material/Login'; // Se añade un icono para la acción de login
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/formatters';

// El componente recibe 'onAddToCart' y 'isAdding' del componente padre.
const ProductCard = ({ product, onAddToCart, isAdding }) => {
  const navigate = useNavigate();
  // --- CORRECCIÓN CLAVE: Usamos 'isAuthenticated' para una comprobación clara ---
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();

  // La lógica de precios se mantiene, pero ahora es más robusta.
  const displayPrice = React.useMemo(() => {
    if (!product || !product.resellerPrices) return null;
    // Si el usuario está autenticado y es un revendedor, muestra su precio específico.
    if (isAuthenticated && user?.role === 'Revendedor') {
      return product.resellerPrices[user.resellerCategory] || product.resellerPrices.cat1;
    }
    // Para todos los demás (visitantes, admin, etc.), siempre muestra el precio cat1.
    return product.resellerPrices.cat1;
  }, [product, user, isAuthenticated]);

  const handleAddToCartClick = () => {
    // Si no hay un usuario autenticado, redirige a la página de login.
    if (!isAuthenticated) {
      toast.info("Por favor, inicia sesión para añadir productos al carrito.");
      navigate('/login');
      return;
    }

    // Si el usuario está autenticado, procede con la lógica existente.
    if (product.countInStock <= 0) {
      toast.error('Este producto está agotado.');
      return;
    }
    if (!displayPrice || displayPrice <= 0) {
      toast.error('No se puede añadir al carrito: Precio no disponible.');
      return;
    }
    
    // Llama a la función que viene del padre (HomePage o ProductsPage).
    if (onAddToCart) {
      onAddToCart(product, 1); // Asumimos que se añade 1 unidad desde la tarjeta
    }
  };

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
      bgcolor: 'background.default', 
      border: `1px solid ${theme.palette.grey[200]}`, 
    }}>
      <CardMedia
        component="img"
        height="140" 
        image={product.imageUrls?.[0]?.secure_url || 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image'}
        alt={product.name}
        sx={{ 
          objectFit: 'contain', p: 1, bgcolor: 'background.default', 
          borderRadius: '12px 12px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/products/${product._id}`)} // Esta navegación siempre funciona
      />
      <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography 
          gutterBottom variant="h6" component="div" 
          sx={{ 
            fontWeight: 700, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            fontSize: '0.95rem', color: 'primary.main', 
          }}
        >
          {product.name}
        </Typography>
        <Typography 
          variant="body2" color="text.secondary" 
          sx={{ 
            minHeight: 30, overflow: 'hidden', textOverflow: 'ellipsis', 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            mb: 1, fontSize: '0.8rem', 
          }}
        >
          {product.shortDescription || (product.description ? product.description.substring(0, 60) + '...' : 'No description available.')}
        </Typography>
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}> 
            {displayPrice !== null ? (formatPrice(displayPrice)) : 'Precio no disponible'}
          </Typography>
          {isOutOfStock && (
            <Typography variant="body2" color="error" sx={{ fontWeight: 700, ml: 1 }}>
              Sin Stock
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 1.5, pt: 1, justifyContent: 'space-between', borderTop: `1px solid ${theme.palette.grey[100]}` }}>
        <Button
          size="small"
          onClick={() => navigate(`/products/${product._id}`)} // Esta navegación siempre funciona
          variant="outlined"
          color="secondary" 
          startIcon={<VisibilityIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
        >
          Ver
        </Button>
        <Tooltip title={isOutOfStock ? "Producto agotado" : "Añadir al carrito"}>
          <span>
            <Button
              size="small"
              variant="contained"
              color="primary" 
              onClick={handleAddToCartClick} // Se usa el nuevo handler inteligente
              startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon sx={{ fontSize: '1rem' }} />}
              disabled={isAdding || isOutOfStock || !displayPrice || displayPrice <= 0}
              sx={{ 
                ml: 1, borderRadius: 2, textTransform: 'none',
                fontSize: '0.75rem', py: 0.5, 
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
