import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent, IconButton,
  TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Link as MuiLink, Divider, List, ListItem, ListItemText, Paper, FormControl, InputLabel, Select, MenuItem, useTheme
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatters'; // Importamos el formateador de precios

const WHATSAPP_AGENT_NUMBER = '50672317420'; 

const CheckoutPage = () => {
  const { cartItems, loading, error, placeOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // --- NUEVOS ESTADOS PARA EL CÁLCULO DE ENVÍO ---
  const [selectedProvince, setSelectedProvince] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMessage, setShippingMessage] = useState('');

  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
  
  // --- El total final ahora es dinámico ---
  const finalTotalPrice = totalCartPrice + shippingCost;
  
  const provinces = ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"];
  const gamProvinces = ["San José", "Alajuela", "Cartago", "Heredia"];

  // --- useEffect para calcular el costo de envío cuando la provincia cambia ---
  useEffect(() => {
    if (gamProvinces.includes(selectedProvince)) {
      setShippingCost(3000);
      setShippingMessage(''); // No hay mensaje si el costo aplica
    } else if (selectedProvince && !gamProvinces.includes(selectedProvince)) {
      setShippingCost(0);
      setShippingMessage("Pago contra entrega");
    } else {
      setShippingCost(0);
      setShippingMessage(''); // Limpia el mensaje si no hay provincia seleccionada
    }
  }, [selectedProvince]);


  useEffect(() => {
    if (!loading && cartItems.length === 0 && !orderPlaced) {      
      navigate('/products');
    }
  }, [cartItems, loading, navigate, orderPlaced]);

  useEffect(() => {
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user) {      
      toast.error("Debes iniciar sesión para finalizar el pedido.");
      return;
    }
    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.email || !selectedProvince) {      
        toast.error("Por favor, completa toda la información de envío, incluyendo la provincia.");
        return;
    }
    if (cartItems.length === 0) {      
      return;
    }

    try {
      const result = await placeOrder(WHATSAPP_AGENT_NUMBER); 
      
      if (result && result.order) { 
        setOrderPlaced(true);
        setPlacedOrderDetails(result.order);

        let message = `¡Hola! Soy *${user.firstName || ''} ${user.lastName || ''}* (${user.email || ''}), tu cliente.\n\n`;
        message += `Me gustaría confirmar mi pedido (#${result.order._id}).\n\n`;
        message += 'Detalles del Cliente:\n';
        message += `  Nombre: ${result.order.customerDetails?.name || 'N/A'}\n`;
        message += `  Teléfono: ${result.order.customerDetails?.phoneNumber || 'N/A'}\n`;
        message += `  Dirección: ${result.order.customerDetails?.address}, ${selectedProvince}\n`;
        message += `\n`;
        message += `Productos en el Pedido:\n`;
        result.order.items.forEach((item, index) => {
          message += `  ${index + 1}. ${item.name} (Código: ${item.code})\n`;
          message += `     Cantidad: ${item.quantity}\n`;
          message += `     Precio Unitario: ${formatPrice(item.priceAtSale)}\n`;
        });
        message += `\nSubtotal: ${formatPrice(totalCartPrice)}\n`;
        message += `Costo de Envío: ${shippingMessage || formatPrice(shippingCost)}\n`;
        message += `Precio Total Final: ${formatPrice(finalTotalPrice)}\n\n`;
        message += `*Por favor, procesar este pedido y coordinar la entrega. ¡Gracias!*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;
        
        window.open(whatsappLink, '_blank');
      } else {
        toast.error('Hubo un problema al procesar su pedido. Intente nuevamente.');
      }
    } catch (err) {
      console.error('Error al finalizar el pedido:', err);
      toast.error('Error al finalizar el pedido. Verifique que WhatsApp o WhatsAppWeb esten instalados en su dispositivo');
    }
  };
  
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
                  <Typography variant="body1">Total: {formatPrice(placedOrderDetails.totalPrice)}</Typography>
                </Box>
              )}
              <Button variant="contained" color="primary" startIcon={<WhatsAppIcon />} onClick={() => {
                  if (placedOrderDetails) {
                      let message = `¡Hola! Soy *${user.firstName || ''} ${user.lastName || ''}* (${user.email || ''}). Estoy siguiendo mi pedido (#${placedOrderDetails._id}) y necesito contactarte.`;
                      const encodedMessage = encodeURIComponent(message);
                      const whatsappLink = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodedMessage}`;
                      window.open(whatsappLink, '_blank');
                  }
              }} sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}>
                Reabrir Chat de WhatsApp
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => navigate('/profile')} sx={{ mt: 2, ml: { xs: 0, sm: 2 }, px: 4, py: 1.5, borderRadius: 2 }}>
                Ver Mis Pedidos
              </Button>
            </Paper>
        </Container>
    );
  }

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
                <TextField label="Nombre Completo" name="name" value={shippingDetails.name} fullWidth required InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Correo Electrónico" name="email" type="email" value={shippingDetails.email} fullWidth required InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Número de Teléfono" name="phone" value={shippingDetails.phone} fullWidth required InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  {/* <InputLabel id="province-select-label">Provincia</InputLabel> */}
                  <Select
                    labelId="province-select-label"
                    value={selectedProvince}
                    label="Provincia"
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    displayEmpty // --- CORRECCIÓN CLAVE ---
                  >
                    <MenuItem value="">
                      <em>Seleccione una provincia...</em>
                    </MenuItem>
                    {provinces.map((prov) => (
                      <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Dirección (Calle, número, etc.)" name="address" value={shippingDetails.address} fullWidth required InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: { xs: 2, sm: 3 }, mt: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Método de Pago</Typography>
            <Typography variant="body1" color="text.secondary">Los detalles de pago y envio se coordinarán a través de WhatsApp. SINPE ó Transferencia</Typography>
            <Typography variant="body1" color="text.secondary">Precio de envio dentro de la GAM ₡3000 Colones, fuera la de la GAM pago contra entrega en Correos de Costa Rica.</Typography>
            <Typography variant="body1" color="text.secondary">***Seleccionar una provincia para calculo del envio.***</Typography>
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
                    {formatPrice(item.quantity * item.priceAtSale)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatPrice(totalCartPrice)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Costo de Envío:</Typography>
              <Typography variant="body1" color={shippingMessage ? "text.secondary" : "inherit"} sx={{ fontWeight: 600 }}>
                {shippingMessage ? shippingMessage : formatPrice(shippingCost)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ borderTop: '1px solid #eee', pt: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Final:</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>{formatPrice(finalTotalPrice)}</Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ mt: 3, p: 1.5, bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#1EBE57' } }}
              fullWidth
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0 || loading || !selectedProvince}
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
