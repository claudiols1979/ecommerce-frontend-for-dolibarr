import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Tooltip, useTheme, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/formatters';

const ProductCard = ({ product, onAddToCart, isAdding }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();

  const displayPrice = React.useMemo(() => {
    if (!product || !product.resellerPrices) return null;
    if (isAuthenticated && user?.role === 'Revendedor') {
      return product.resellerPrices[user.resellerCategory] || product.resellerPrices.cat1;
    }
    return product.resellerPrices.cat1;
  }, [product, user, isAuthenticated]);

  // --- LÓGICA DE PRECIO TACHADO RESTAURADA ---
  const originalPrice = React.useMemo(() => {
    if (!displayPrice || !product.promotionalLabels || product.promotionalLabels.length === 0) {
      return null;
    }
    
    // La lógica busca la etiqueta original que contiene '% OFF'
    const discountLabel = product.promotionalLabels.find(label => label.name.includes('% OFF'));
    
    if (discountLabel) {
      const percentageMatch = discountLabel.name.match(/\d+/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[0]);
        if (!isNaN(percentage)) {
          return displayPrice / (1 - (percentage / 100));
        }
      }
    }
    
    return null;
  }, [displayPrice, product.promotionalLabels]);

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      toast.info("Por favor, inicia sesión para añadir productos al carrito.");
      navigate('/login');
      return;
    }
    if (product.countInStock <= 0) {
      toast.error('Este producto está agotado.');
      return;
    }
    if (!displayPrice || displayPrice <= 0) {
      toast.error('No se puede añadir al carrito: Precio no disponible.');
      return;
    }
    if (onAddToCart) {
      onAddToCart(product, 1);
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
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {product.promotionalLabels && product.promotionalLabels.length > 0 && (
        <Box
          sx={{
            position: 'absolute', top: '18px', left: '-35px',
            transform: 'rotate(-45deg)', zIndex: 1, width: '150px',
            py: 0.5, background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, #FFD700 90%)`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)', textAlign: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'common.black', 
              textTransform: 'uppercase',
              fontSize: ['Últimas Unidades', 'Nuevo Ingreso', '10% OFF', '15% OFF', '20% OFF'].includes(product.promotionalLabels[0].name) ? '0.55rem' : '0.7rem'
            }}
          >
            {product.promotionalLabels[0].name.replace('OFF', 'Descuento')}
          </Typography>
        </Box>
      )}

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
        onClick={() => navigate(`/products/${product._id}`)}
      />
      <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography 
          gutterBottom variant="h6" component={RouterLink} to={`/products/${product._id}`}
          sx={{ 
            fontWeight: 700, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            fontSize: '0.95rem', color: 'primary.main', textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {product.name}
        </Typography>

        {product.promotionalLabels && product.promotionalLabels.length > 1 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
            {product.promotionalLabels.slice(1).map((label) => (
              <Chip
                key={label._id}
                label={label.name.replace('OFF', 'Descuento')}
                size="small"
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  height: '20px'
                }}
              />
            ))}
          </Box>
        )}

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
        
        {/* --- JSX DE PRECIOS RESTAURADO --- */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800, lineHeight: 1.2 }}> 
                    {displayPrice !== null ? (formatPrice(displayPrice)) : 'Precio no disponible'}
                </Typography>
                {originalPrice && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through', lineHeight: 1.1 }}>
                        {formatPrice(originalPrice)}
                    </Typography>
                )}
            </Box>
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
          onClick={() => navigate(`/products/${product._id}`)}
          variant="outlined"
          color="secondary" 
          startIcon={<VisibilityIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
        >
          Ver
        </Button>
        <Tooltip title={isOutOfStock ? "Producto agotado" : (isAuthenticated ? "Añadir al carrito" : "Inicia sesión para comprar")}>
          <span>
            <Button
              size="small"
              variant="contained"
              color="primary" 
              onClick={handleAddToCartClick}
              startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : (isAuthenticated ? <ShoppingCartIcon sx={{ fontSize: '1rem' }} /> : <LoginIcon sx={{ fontSize: '1rem' }} />)}
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