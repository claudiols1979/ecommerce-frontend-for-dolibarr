import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent, IconButton,
  TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Link as MuiLink, Divider, useTheme 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; 
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const CartPage = () => {
  const theme = useTheme(); 
  const { cartItems, loading, error, updateCartItemQuantity, removeCartItem, clearCart } = useOrders(); 
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [confirmClearCartOpen, setConfirmClearCartOpen] = useState(false); 

  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      toast.info('Tu carrito está vacío. ¡Añade algunos productos!');
    }
  }, [cartItems, loading]);

  const handleQuantityChange = async (item, changeType) => { 
    const productId = item.product?._id; 
    if (!productId) {
      console.error("CartPage: Product ID is missing for quantity change.", item);
      toast.error("No se pudo actualizar la cantidad. ID de producto no encontrado.");
      return;
    }

    let newQuantity;
    if (changeType === 'increment') {
      newQuantity = item.quantity + 1;
    } else if (changeType === 'decrement') {
      newQuantity = item.quantity - 1;
      if (newQuantity < 1) newQuantity = 1; 
    } else {
      newQuantity = parseInt(changeType, 10);
      if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
    }
    await updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (item) => { 
    const productId = item.product?._id; 
    if (productId) {
      console.log("CartPage: Removing item with product ID:", productId);
      await removeCartItem(productId);
    } else {
      console.error("CartPage: Could not remove item, product ID is missing or invalid for item:", item);
      toast.error("No se pudo eliminar el producto. ID no encontrado.");
    }
  };

  const handleClearCart = () => {
    setConfirmClearCartOpen(true);
  };

  const confirmClearCart = async () => {
    setConfirmClearCartOpen(false);
    await clearCart(); 
  };

  const cancelClearCart = () => {
    setConfirmClearCartOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Cargando carrito...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error">{error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Tu Carrito de Compras
      </Typography>

      {cartItems.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderRadius: 3, 
            boxShadow: 2 
          }}
        >
          <Typography variant="h6" sx={{ mb: { xs: 2, sm: 0 } }}>Tu carrito está vacío. ¡Añade algunos productos!</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products')}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Ir a Productos
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={4}> 
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: 5, 
              p: { xs: 2, sm: 3 } 
            }}>
              <CardContent>
                {cartItems.map((item) => (
                  <Box
                    key={item.product?._id || item._id} 
                    sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      alignItems: 'center',
                      mb: 3, 
                      pb: 3, 
                      borderBottom: `1px solid ${theme.palette.divider}`, 
                      '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 },
                      gap: { xs: 2, sm: 3 }, 
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image || 'https://placehold.co/100x100/E0E0E0/FFFFFF?text=No+Image'}
                      alt={item.name}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'contain', 
                        mr: { xs: 0, sm: 2 }, 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.grey[300]}` 
                      }}
                    />
                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Código: {item.code}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Volumen: {item.product?.volume || 'N/A'} 
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Precio Unitario: <Typography component="span" sx={{ fontWeight: 600 }}>₡{item.priceAtSale.toFixed(2)}</Typography>
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, sm: 0 } }}>
                      <IconButton 
                        onClick={() => handleQuantityChange(item, 'decrement')} 
                        color="primary" 
                        size="small"
                        disabled={item.quantity <= 1} 
                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '50%' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, e.target.value)}
                        inputProps={{ min: 1 }}
                        size="small"
                        sx={{ width: 60, mx: 0.5, '& input': { textAlign: 'center' } }}
                      />
                      <IconButton 
                        onClick={() => handleQuantityChange(item, 'increment')} 
                        color="primary" 
                        size="small"
                        sx={{ border: `1px solid ${theme.palette.primary.main}`, borderRadius: '50%' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography 
                      variant="body1" 
                      sx={{ 
                        minWidth: { xs: 'auto', sm: 100 }, 
                        textAlign: { xs: 'center', sm: 'right' }, 
                        fontWeight: 700, 
                        mt: { xs: 2, sm: 0 } 
                      }}
                    >
                      ₡{(item.quantity * item.priceAtSale).toFixed(2)}
                    </Typography>
                    <IconButton 
                      onClick={() => handleRemoveItem(item)} 
                      color="error" 
                      aria-label="remove item"
                      sx={{ mt: { xs: 2, sm: 0 }, ml: { xs: 0, sm: 2 } }} 
                    >
                      <DeleteIcon /> 
                    </IconButton>
                  </Box>
                ))}
                {cartItems.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearCart}
                      disabled={loading}
                    >
                      Vaciar Carrito
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Resumen del Pedido</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Subtotal ({cartItems.length} artículos):</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>₡{totalCartPrice.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1">Envío:</Typography>
                  <Typography variant="body1" color="text.secondary">A calcular en el checkout</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2, mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>₡{totalCartPrice.toFixed(2)}</Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mt: 3, p: 1.5, borderRadius: 2 }}
                  onClick={() => navigate('/checkout')}
                  disabled={cartItems.length === 0 || loading}
                >
                  Proceder al Pago
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialog for Clear Cart */}
      <Dialog open={confirmClearCartOpen} onClose={cancelClearCart}>
        <DialogTitle>Confirmar Vaciar Carrito</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar todos los productos de tu carrito?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelClearCart} color="secondary">
            Cancelar
          </Button>
          <Button onClick={confirmClearCart} color="error" variant="contained">
            Vaciar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;