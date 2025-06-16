import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent,
  TextField, CircularProgress, Alert, // Eliminadas referencias a Dialog, DialogTitle, etc.
  Link as MuiLink, Divider, List, ListItem, ListItemText, Paper
} from '@mui/material';
// Añadidas las importaciones para los iconos que se usarán en la pantalla de éxito
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Número de WhatsApp del agente hardcodeado
const WHATSAPP_AGENT_NUMBER = '50672317420'; 

const CheckoutPage = () => {
  // Ahora usamos 'error' directamente de useOrders, no 'orderError'
  const { cartItems, loading, error, placeOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    country: user?.country || 'Costa Rica',
  });

  // Estados para la pantalla de éxito después de colocar la orden
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
  const shippingCost = 0; 
  const finalTotalPrice = totalCartPrice + shippingCost;

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (!loading && cartItems.length === 0 && !orderPlaced) {      
      navigate('/products');
    }
  }, [cartItems, loading, navigate, orderPlaced]);

  // Pre-fill shipping details if user object is available
  useEffect(() => {
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
        postalCode: user.postalCode || prev.postalCode,
        country: user.country || prev.country,
      }));
    }
  }, [user]);

  // Esta función ahora FINALIZA EL PEDIDO y ABRE WHATSAPP DIRECTAMENTE
  const handlePlaceOrder = async () => {
    if (!user) {      
      return;
    }
    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.email) {     
      return;
    }
    if (cartItems.length === 0) {     
      return;
    }

    // El loading del OrderContext se activará con placeOrder
    try {
      // Llama a la función placeOrder de tu OrderContext, pasando el número hardcodeado
      const result = await placeOrder(WHATSAPP_AGENT_NUMBER); 
      
      if (result && result.order) { // Si placeOrder fue exitoso y devolvió la orden creada
        setOrderPlaced(true);
        setPlacedOrderDetails(result.order); // Guarda los detalles de la orden para el mensaje de WhatsApp

        // --- Generación del mensaje de WhatsApp y apertura del enlace (AHORA EN EL FRONTEND) ---
        let message = `¡Hola! Soy *${user.firstName || ''} ${user.lastName || ''}* (${user.email || ''}), tu cliente.\n\n`;
        message += `Me gustaría confirmar mi pedido (#${result.order._id}).\n\n`; // Usa el ID de la orden creada
        message += 'Detalles del Cliente:\n';
        message += `  Nombre: ${result.order.customerDetails?.name || 'N/A'}\n`;
        message += `  Teléfono: ${result.order.customerDetails?.phoneNumber || 'N/A'}\n`;
        message += `  Dirección: ${result.order.customerDetails?.address || 'N/A'}\n`;
        if (result.order.customerDetails?.city && result.order.customerDetails.city !== 'N/A') message += `  Ciudad: ${result.order.customerDetails.city}\n`;
        if (result.order.customerDetails?.postalCode && result.order.customerDetails.postalCode !== 'N/A') message += `  Código Postal: ${result.order.customerDetails.postalCode}\n`;
        if (result.order.customerDetails?.country && result.order.customerDetails.country !== 'N/A') message += `  País: ${result.order.customerDetails.country}\n`;
        message += `\n`;

        message += `Productos en el Pedido:\n`;
        result.order.items.forEach((item, index) => {
          message += `  ${index + 1}. ${item.name} (Código: ${item.code})\n`;
          message += `    Cantidad: ${item.quantity}\n`;
          message += `    Precio Unitario: ₡${item.priceAtSale.toFixed(2)}\n`;
          message += `    Subtotal: ₡${(item.quantity * item.priceAtSale).toFixed(2)}\n`;
        });

        message += `\nPrecio Total del Pedido: ₡${result.order.totalPrice.toFixed(2)}\n`;
        message += `ID del Pedido: ${result.order._id}\n\n`;
        message += `*Por favor, procesar este pedido y coordinar la entrega. ¡Gracias!*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;
        
        window.open(whatsappLink, '_blank'); // Abre el enlace en una nueva pestaña inmediatamente

       
      } else {
        // placeOrder en OrderContext ya debería mostrar errores con toast, pero por si acaso.
        toast.error('Hubo un problema al procesar su pedido. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error al finalizar el pedido:', err);
      toast.error('Error al finalizar el pedido. Verifique que WhatsApp o WhatsAppWeb esten instalados en su dispositivo');
    }
  };

  // Renderizado condicional basado en el estado de carga y error del contexto
  if (loading) { // Usamos el 'loading' del contexto directamente
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Preparando checkout...</Typography>
      </Container>
    );
  }

  if (error) { // Usamos el 'error' del contexto directamente
    return (
      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error">{error.message}</Alert>
      </Container>
    );
  }

  // Redirigir si el carrito está vacío después de la carga inicial
  if (cartItems.length === 0 && !loading && !orderPlaced) {
    // Ya se maneja con el useEffect, esto es un fallback visual si el redirect tarda un poco
      return (
          <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
              <Alert severity="info">Tu carrito está vacío. ¡Redirigiendo a productos!</Alert>
          </Container>
      );
  }

  // Si la orden ya fue colocada, muestra la pantalla de confirmación (estos son tus estilos)
  if (orderPlaced) {
    return (
      <Container maxWidth="md" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            ¡Pedido Realizado con Éxito!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Su pedido ha sido procesado. Se ha abierto una ventana de WhatsApp para que finalice la comunicación con nuestro agente.
          </Typography>
          {placedOrderDetails && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>ID de Pedido: {placedOrderDetails._id}</Typography>
              <Typography variant="body1">Total: ₡{placedOrderDetails.totalPrice.toFixed(2)}</Typography>
            </Box>
          )}
          {/* Botón para reabrir el chat de WhatsApp si se cierra accidentalmente */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<WhatsAppIcon />}
            onClick={() => {
                if (placedOrderDetails) {
                    // Re-generar el enlace de WhatsApp con un mensaje más conciso para reabrir
                    let message = `¡Hola! Soy *${user.firstName || ''} ${user.lastName || ''}* (${user.email || ''}). Estoy siguiendo mi pedido (#${placedOrderDetails._id}) y necesito contactarte.`;
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;
                    window.open(whatsappLink, '_blank');
                }
            }}
            sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}
          >
            Reabrir Chat de WhatsApp
          </Button>
          {/* Botones de navegación adicionales */}
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/profile')} // Asumiendo que tienes una ruta /myorders
            sx={{ mt: 2, ml: { xs: 0, sm: 2 }, px: 4, py: 1.5, borderRadius: 2 }}
          >
            Ver Mis Pedidos
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            sx={{ mt: 2, ml: { xs: 0, sm: 2 }, px: 4, py: 1.5, borderRadius: 2 }}
          >
            Seguir Comprando
          </Button>
        </Paper>
      </Container>
    );
  }

  // Vista normal de la página de checkout antes de colocar la orden (tus estilos)
  return (
    <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Shipping Details Form */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Información de Envío</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre Completo"
                  name="name"
                  value={shippingDetails.name}
                  fullWidth
                  required
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={shippingDetails.email}
                  fullWidth
                  required
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Teléfono"
                  name="phone"
                  value={shippingDetails.phone}
                  fullWidth
                  required
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="País"
                  name="country"
                  value={shippingDetails.country}
                  fullWidth
                  required
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección (Calle, número, apartamento)"
                  name="address"
                  value={shippingDetails.address}
                  fullWidth
                  required
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: { xs: 2, sm: 3 }, mt: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Método de Pago</Typography>
            <Typography variant="body1" color="text.secondary">      
              Los detalles de pago se coordinarán a través de WhatsApp. Da click en "Finalizar Pedido y Coordinar por Whatsapp"
            </Typography>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Resumen del Pedido</Typography>
            <List>
              {cartItems.map((item) => (
                <ListItem key={item.product._id} disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={`${item.name} x ${item.quantity}`}
                    secondary={`Código: ${item.code}`}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₡{(item.quantity * item.priceAtSale).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">₡{totalCartPrice.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Costo de Envío:</Typography>
              <Typography variant="body1">₡{shippingCost.toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ borderTop: '1px solid #eee', pt: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Final:</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>₡{finalTotalPrice.toFixed(2)}</Typography>
            </Box>
            <Button
              variant="contained"
              // Estilos de WhatsApp directos
              sx={{ 
                mt: 3, 
                p: 1.5,
                bgcolor: '#25D366', // Verde WhatsApp
                color: 'white', // Texto blanco
                '&:hover': {
                  bgcolor: '#1EBE57', // Un verde un poco más oscuro al pasar el ratón
                },
              }}
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0 || loading} // 'loading' viene de useOrders
            >
              Finalizar Pedido y Coordinar por WhatsApp
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;