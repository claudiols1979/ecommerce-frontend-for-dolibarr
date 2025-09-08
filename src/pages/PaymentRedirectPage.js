import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Button,
    CircularProgress, Paper, useTheme, List, ListItem, ListItemText, Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useOrders } from '../contexts/OrderContext';
import { formatPrice } from '../utils/formatters';
import axios from 'axios';
import API_URL from '../config';

const PaymentRedirectPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCart, clearCart } = useOrders();
    const theme = useTheme();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Procesando su pago...');
    const [orderInfo, setOrderInfo] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const description = queryParams.get('description');
        const orderNumber = queryParams.get('order');

        if (!code || !orderNumber) {
            setStatus('error');
            setMessage('Parámetros de pago inválidos. Contacte a soporte.');
            return;
        }

        const handleFinalizePayment = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/orders/cart/payment-redirect-handler${location.search}`);
                const data = response.data;

                console.log('data de tilo: ', data);

                if (data.success) {
                    setStatus('success');
                    setMessage('¡Su pedido ha sido procesado con éxito!');
                    setOrderInfo(data.order);
                    clearCart();
                    fetchCart();
                } else {
                    setStatus('error');
                    setMessage(`El pago falló: ${data.message || 'Error desconocido'}`);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Hubo un problema de conexión. Por favor, revise el estado de su pedido en su perfil.');
                console.error('Error al finalizar el pago en el frontend:', err);
            }
        };

        if (code === '1') {
            handleFinalizePayment();
        } else {
            setStatus('error');
            setMessage(`La transacción fue rechazada. Motivo: ${description || 'Desconocido'}. Por favor, intente de nuevo.`);
        }
    }, [location.search, clearCart, fetchCart]);

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>{message}</Typography>
                </Box>
            );
        }

        if (status === 'success') {
            return (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        ¡Pedido Realizado con Éxito!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Su pedido ha sido procesado y el pago ha sido aprobado.
                    </Typography>
                    {orderInfo && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>ID de Pedido: {orderInfo._id}</Typography>
                            <Typography variant="body1">Total: {formatPrice(orderInfo.totalPrice)}</Typography>
                        </Box>
                    )}
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/profile')} sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}>
                        Ver Mis Pedidos
                    </Button>
                    {orderInfo && orderInfo.items.length > 0 && (
                        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                ¡Gracias por tu compra! Ayúdanos a mejorar dejando tu opinión:
                            </Typography>
                            <List>
                                {orderInfo.items.map(item => (
                                    <ListItem key={item.product} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
                                        <Typography variant="body1">{item.name}</Typography>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            startIcon={<RateReviewIcon />}
                                            onClick={() => navigate(`/products/${item.product._id}`)}
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
            );
        }

        if (status === 'error') {
            return (
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                    <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        ¡El Pago Falló!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {message}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/checkout')} sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}>
                        Volver a Intentarlo
                    </Button>
                </Paper>
            );
        }
    };

    return (
        <Container maxWidth="md" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
            {renderContent()}
        </Container>
    );
};

export default PaymentRedirectPage;