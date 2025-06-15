import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, Grid, Card, CardContent,
  TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Link as MuiLink, Divider, List, ListItem, ListItemText,
} from '@mui/material';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const CheckoutPage = () => {
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappAgentNumber, setWhatsappAgentNumber] = useState(''); // State for agent number in dialog
  const [dialogLoading, setDialogLoading] = useState(false); // Loading for the dialog action

  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
  const shippingCost = 0; // Placeholder for now, can be dynamic later
  const finalTotalPrice = totalCartPrice + shippingCost;

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      toast.info('Tu carrito está vacío. ¡Redirigiendo a productos para añadir algo antes de checkout!');
      navigate('/products');
    }
  }, [cartItems, loading, navigate]);

  // Pre-fill shipping details if user object is available (e.g., after login or initial load)
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

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Por favor, inicia sesión para finalizar el pedido.');
      return;
    }
    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.email) {
      toast.error('Tu información de envío está incompleta en tu perfil. Por favor, actualízala.');
      return;
    }

    setDialogMessage('Por favor, introduce el número de WhatsApp del agente al que enviar el pedido.');
    setDialogOpen(true);
  };

  const handleWhatsappDialogClose = () => {
    setDialogOpen(false);
    setWhatsappLink('');
    setDialogLoading(false);
    setWhatsappAgentNumber(''); 
  };

  const handleConfirmWhatsappPlaceOrder = async () => {
    setDialogLoading(true);
    try {
      if (!whatsappAgentNumber) {
        toast.error('El número de WhatsApp del agente es obligatorio.');
        setDialogLoading(false);
        return;
      }
      const link = await placeOrder(whatsappAgentNumber); 
      if (link) {
        setWhatsappLink(link);
        setDialogMessage(
          <>
            ¡Pedido realizado con éxito! <br/>
            Puedes abrir el chat de WhatsApp con el siguiente enlace: <br/>
            <MuiLink href={link} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 'bold', mt: 1, display: 'block' }}>
              Abrir WhatsApp
            </MuiLink>
          </>
        );
      }
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Preparando checkout...</Typography>
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

  if (cartItems.length === 0 && !loading) {
      return (
          <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
              <Alert severity="info">Tu carrito está vacío. ¡Redirigiendo a productos!</Alert>
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
                <TextField
                  label="Nombre Completo"
                  name="name"
                  value={shippingDetails.name}
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true, 
                  }}
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
                  InputProps={{
                    readOnly: true, 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Teléfono"
                  name="phone"
                  value={shippingDetails.phone}
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true, 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="País"
                  name="country"
                  value={shippingDetails.country}
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true, 
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección (Calle, número, apartamento)"
                  name="address"
                  value={shippingDetails.address}
                  fullWidth
                  required
                  InputProps={{
                    readOnly: true, 
                  }}
                />
              </Grid>
               {/* <Grid item xs={12} sm={6}>
                <TextField
                  label="Ciudad"
                  name="city"
                  value={shippingDetails.city}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Código Postal"
                  name="postalCode"
                  value={shippingDetails.postalCode}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid> */}
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
              // CLAVE: Estilos de WhatsApp
              sx={{ 
                mt: 3, 
                p: 1.5,
                bgcolor: '#25D366', // Verde WhatsApp
                color: 'white', // Texto blanco
                '&:hover': {
                  bgcolor: '#1EBE57', // Un verde un poco más oscuro al pasar el ratón
                },
                // Asegúrate de que el 'color="primary"' o 'color="secondary"' se elimine si usas bgcolor directo
              }}
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0 || loading || dialogLoading}
            >
              Finalizar Pedido y Coordinar por WhatsApp
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* WhatsApp Agent Number Dialog */}
      <Dialog open={dialogOpen} onClose={handleWhatsappDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Coordinar Pedido por WhatsApp</DialogTitle>
        <DialogContent dividers>
          {whatsappLink ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                ¡Pedido procesado con éxito!
              </Alert>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Haz clic en el enlace para abrir WhatsApp y enviar los detalles del pedido al agente.
              </Typography>
              <MuiLink href={whatsappLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 'bold', display: 'block', wordBreak: 'break-all' }}>
                {whatsappLink}
              </MuiLink>
            </Box>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Por favor, introduce el número de WhatsApp del agente para enviar los detalles del pedido.
              </Typography>
              <TextField
                label="Número de WhatsApp del Agente"
                variant="outlined"
                fullWidth
                value={whatsappAgentNumber}
                onChange={(e) => setWhatsappAgentNumber(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Ej: +50688887777"
                helperText="Formato: Código de país + número (sin espacios ni guiones)"
              />
              {dialogLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} color="primary" />
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWhatsappDialogClose} color="secondary" disabled={dialogLoading}>
            Cerrar
          </Button>
          {!whatsappLink && ( // Only show confirm button if link is not yet generated
            <Button onClick={handleConfirmWhatsappPlaceOrder} color="primary" variant="contained" disabled={!whatsappAgentNumber || dialogLoading}>
              {dialogLoading ? 'Enviando...' : 'Confirmar y Enviar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;