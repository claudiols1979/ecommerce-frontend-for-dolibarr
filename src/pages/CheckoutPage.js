import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Button, Grid, Card, TextField,
    CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Divider, List, ListItem, ListItemText, Paper, FormControl, Select, MenuItem, useTheme, InputLabel
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatters';
import { calculatePriceWithTax } from '../utils/taxCalculations';
import RateReviewIcon from '@mui/icons-material/RateReview';

const CheckoutPage = () => {
    const { cartItems, loading, initiateTilopayPayment } = useOrders();
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '', // Campo de ciudad añadido
    });

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMessage, setShippingMessage] = useState('');

    // Calcular el total del carrito con IVA incluido
    const totalCartPrice = cartItems.reduce((acc, item) => {
        const priceWithTax = item.product ? 
            calculatePriceWithTax(item.priceAtSale, item.product.iva) : 
            item.priceAtSale;
        return acc + (item.quantity * priceWithTax);
    }, 0);
    
    const finalTotalPrice = totalCartPrice + shippingCost;

    const provinces = ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"];
    const gamProvinces = ["San José", "Alajuela", "Cartago", "Heredia"];

    useEffect(() => {
        if (gamProvinces.includes(selectedProvince)) {
            setShippingCost(3000);
            setShippingMessage('');
        } else if (selectedProvince && !gamProvinces.includes(selectedProvince)) {
            setShippingCost(0);
            setShippingMessage("Pago contra entrega");
        } else {
            setShippingCost(0);
            setShippingMessage('');
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (!loading && cartItems.length === 0 && !orderPlaced) {
            navigate('/products');
        }
    }, [cartItems, loading, navigate, orderPlaced]);

    // Llenar los datos de envío iniciales del perfil del usuario
    useEffect(() => {
        if (user) {
            setShippingDetails(prev => ({
                ...prev,
                name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
                email: user.email || prev.email,
                phone: user.phoneNumber || prev.phone,
                address: user.address || prev.address,
                // No prellenamos 'city', se asume que el usuario la llenará.
            }));
        }
    }, [user]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleInitiatePayment = async () => {
        // Validación de campos
        if (!user) {
            toast.error("Debes iniciar sesión para finalizar el pedido.");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("No puedes procesar el pago con un carrito vacío.");
            return;
        }

        if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.email || !shippingDetails.city || !selectedProvince) {
            toast.error("Por favor, completa toda la información de envío, incluyendo la provincia y la ciudad.");
            return;
        }
        
        // --- Nueva lógica para iniciar el pago ---
        try {
            // Combina los datos de envío y la provincia seleccionada
            const finalShippingDetails = {
                ...shippingDetails,
                province: selectedProvince
            };

            const paymentUrl = await initiateTilopayPayment(finalShippingDetails);

            if (paymentUrl) {
                // Redirige al usuario a la URL de pago de Tilopay
                window.location.href = paymentUrl;
            }
        } catch (err) {
            console.error("Error en la página al iniciar el pago:", err);
            toast.error('Hubo un problema al redirigir al pago. Intente nuevamente.');
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
                        Su pedido ha sido procesado y el pago ha sido iniciado.
                    </Typography>
                    {/* Esta sección puede ser actualizada para mostrar detalles del pago */}
                    {placedOrderDetails && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>ID de Pedido: {placedOrderDetails._id}</Typography>
                            <Typography variant="body1">Total: {formatPrice(placedOrderDetails.totalPrice)}</Typography>
                        </Box>
                    )}
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/profile')} sx={{ mt: 2, ml: { xs: 0, sm: 2 }, px: 4, py: 1.5, borderRadius: 2 }}>
                        Ver Mis Pedidos
                    </Button>
                    {placedOrderDetails && placedOrderDetails.items.length > 0 && (
                        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                ¡Gracias por tu compra! Ayúdanos a mejorar dejando tu opinión:
                            </Typography>
                            <List>
                                {placedOrderDetails.items.map(item => (
                                    <ListItem key={item.product} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
                                        <Typography variant="body1">{item.name}</Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            startIcon={<RateReviewIcon />}
                                            onClick={() => navigate(`/products/${item.product}`)}
                                            sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                        >
                                            Dejar Reseña
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
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
                                <TextField
                                    label="Nombre Completo"
                                    name="name"
                                    value={shippingDetails.name}
                                    onChange={handleShippingChange}
                                    fullWidth required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={shippingDetails.email}
                                    onChange={handleShippingChange}
                                    fullWidth required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Número de Teléfono"
                                    name="phone"
                                    value={shippingDetails.phone}
                                    onChange={handleShippingChange}
                                    fullWidth required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="province-select-label">Provincia</InputLabel>
                                    <Select
                                        labelId="province-select-label"
                                        value={selectedProvince}
                                        label="Provincia"
                                        onChange={(e) => setSelectedProvince(e.target.value)}
                                        displayEmpty
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
                                <TextField
                                    label="Dirección (Calle, número, etc.)"
                                    name="address"
                                    value={shippingDetails.address}
                                    onChange={handleShippingChange}
                                    fullWidth required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Ciudad"
                                    name="city"
                                    value={shippingDetails.city}
                                    onChange={handleShippingChange}
                                    fullWidth required
                                />
                            </Grid>
                        </Grid>
                    </Card>

                    <Card sx={{ p: { xs: 2, sm: 3 }, mt: 4, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Método de Pago</Typography>
                        <Typography variant="h6" color="text.secondary">Será redirigido a una página segura para ingresar los detalles de su tarjeta.</Typography>
                        <Typography variant="body1" color="text.secondary">Costo de Envío: {shippingMessage || formatPrice(shippingCost)}</Typography>
                    </Card>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, boxShadow: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Resumen del Pedido</Typography>
                        <List>
                            {cartItems.map((item) => {
                                // Calcular precio con IVA para este producto
                                const priceWithTax = item.product ? 
                                    calculatePriceWithTax(item.priceAtSale, item.product.iva) : 
                                    item.priceAtSale;
                                
                                return (
                                    <ListItem key={item.product._id} disablePadding sx={{ mb: 1 }}>
                                        <ListItemText
                                            primary={`${item.name} x ${item.quantity}`}
                                            secondary={
                                                <>
                                                    Código: {item.code}
                                                    <br />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatPrice(priceWithTax)} c/u (IVA incluido)
                                                    </Typography>
                                                </>
                                            }
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {formatPrice(item.quantity * priceWithTax)}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
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
                            sx={{ mt: 3, p: 1.5 }}
                            fullWidth
                            onClick={handleInitiatePayment}
                            disabled={
                                cartItems.length === 0 ||
                                loading ||
                                !shippingDetails.name ||
                                !shippingDetails.phone ||
                                !shippingDetails.address ||
                                !shippingDetails.email ||
                                !shippingDetails.city ||
                                !selectedProvince
                            }
                        >
                            Pagar con Tarjeta de Crédito
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CheckoutPage;