import React, { useEffect, useState } from 'react';
import { 
  Container, Box, Typography, Button, Grid, CircularProgress, Alert, 
  Card, CardContent, Divider, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails, useTheme, 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';

// Importaciones de iconos de Material-UI
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn'; 
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAuth(); 
  const { myOrders, loading: ordersLoading, error: ordersError, fetchMyOrders } = useOrders(); 
  const theme = useTheme(); 

  const [localLoading, setLocalLoading] = useState(true);

useEffect(() => {
  // 1. Fetch the user's orders as soon as the page loads.
  if (fetchMyOrders) {
    fetchMyOrders();
  }

  // 2. Set up an interval to call the function again every 30 seconds.
  const intervalId = setInterval(() => {
    if (fetchMyOrders) {
      console.log("Auto-refreshing user's orders on HomePage...");
      fetchMyOrders();
    }
  }, 30000); // 30000 milliseconds = 30 seconds

  // 3. Clean up by stopping the interval when the user navigates away.
  // This is very important to prevent memory leaks.
  return () => clearInterval(intervalId);
}, [fetchMyOrders]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && user) {
      setLocalLoading(false);
      fetchMyOrders(); 
    }
  }, [user, authLoading, navigate, fetchMyOrders]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      if (dateString.includes('/')) { 
        const parts = dateString.split('/');
        date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      } else { 
        date = new Date(dateString);
      }

      if (!isNaN(date.getTime())) { 
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        return date.toLocaleDateString('es-ES', options);
      }
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
    }
    return 'Fecha inválida';
  };

  // Mapa para traducir estados de pedidos a español - AHORA INCLUYE 'expired'
  const orderStatusMap = {
    pending: 'Pendiente',
    placed: 'Realizado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    expired: 'Expirado', // <-- AÑADIDO: Estado 'expired'
  };

  // Función para obtener el estado traducido
  const getTranslatedStatus = (status) => {
    const translated = orderStatusMap[status.toLowerCase()];
    return translated ? translated : status.charAt(0).toUpperCase() + status.slice(1);
  };

  // if (localLoading || authLoading || ordersLoading) {
  //   return (
  //     <Container maxWidth="xl" sx={{ my: 4, textAlign: 'center', flexGrow: 1 }}>
  //       <CircularProgress color="primary" size={60} />
  //       <Typography variant="h5" sx={{ mt: 3, color: 'text.primary' }}>Cargando perfil y pedidos...</Typography>
  //     </Container>
  //   );
  // }

  if (authError || ordersError) {
    return (
      <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="error" sx={{ borderRadius: 2, p: 2, mb: 3 }}>
          {authError?.message || ordersError?.message || "Error al cargar los datos del perfil o pedidos."}
        </Alert>
        <Button onClick={() => window.location.reload()} variant="contained" color="primary" sx={{ px: 4, py: 1.5, borderRadius: 8, fontWeight: 700 }}>
          Reintentar
        </Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
        <Alert severity="warning" sx={{ borderRadius: 2, p: 2, mb: 3 }}>Por favor, inicia sesión para ver tu perfil.</Alert>
        <Button onClick={() => navigate('/login')} variant="contained" color="primary" sx={{ px: 4, py: 1.5, borderRadius: 8, fontWeight: 700 }}>
          Ir a Iniciar Sesión
        </Button>
      </Container>
    );
  }

  const cardStyle = {
    borderRadius: theme.shape.borderRadius * 2, 
    boxShadow: theme.shadows[8], 
    bgcolor: theme.palette.background.paper,
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-6px)', 
      boxShadow: theme.shadows[12],
    },
  };

  const iconStyle = { 
    fontSize: { xs: 20, sm: 22 }, 
    color: theme.palette.primary.main, 
    mr: 1.5, 
    verticalAlign: 'middle' 
  };

  const displayOrders = myOrders.slice(0, 10); 

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 4, sm: 6 }, flexGrow: 1, position: 'relative' }}>
      

      {/* Información del Usuario/Revendedor - Ocupa todo el ancho */}
      <Card sx={{ ...cardStyle, mb: { xs: 3, sm: 4 } }}> 
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}> 
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 3, pb: 1, borderBottom: `2px solid ${theme.palette.primary.light}` }}>
            Información Personal
          </Typography>
          <List disablePadding>
            <ListItem disableGutters sx={{ py: 1 }}> 
              <ListItemText 
                primary={
                  <Typography variant="body1" color="text.secondary">
                        <PersonIcon sx={iconStyle} /> Nombre Completo: <Typography component="span" fontWeight="medium" color="text.primary">{user.firstName} {user.lastName}</Typography>
                  </Typography>
                } 
              />
            </ListItem>
            <ListItem disableGutters sx={{ py: 1 }}>
              <ListItemText 
                primary={
                  <Typography variant="body1" color="text.secondary">
                    <EmailIcon sx={iconStyle} /> Correo Electrónico: <Typography component="span" fontWeight="medium" color="text.primary">{user.email}</Typography>
                  </Typography>
                } 
              />
            </ListItem>
            {user.phoneNumber && (
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText 
                  primary={
                    <Typography variant="body1" color="text.secondary">
                      <PhoneIcon sx={iconStyle} /> Teléfono: <Typography component="span" fontWeight="medium" color="text.primary">{user.phoneNumber}</Typography>
                    </Typography>
                  } 
                />
              </ListItem>
            )}
            {(user.address ) && ( // Muestra la dirección completa si está disponible
              <ListItem disableGutters sx={{ py: 1 }}>
                <ListItemText 
                  primary={
                    <Typography variant="body1" color="text.secondary">
                      <LocationOnIcon sx={iconStyle} /> Dirección: <Typography component="span" fontWeight="medium" color="text.primary">
                          {user.address || 'N/A'}
                      </Typography>
                    </Typography>
                  } 
                />
              </ListItem>
            )}
          </List>
        
          {user.role === 'Revendedor' && (
            <Box sx={{ mt: 4, pt: 4, borderTop: `1px dashed ${theme.palette.grey[300]}` }}> 
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.dark, mb: 2 }}>
                Información de Revendedor
              </Typography>
              <List disablePadding>        
                

                <ListItem disableGutters sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" color="text.secondary">
                        <CodeIcon sx={iconStyle} /> Código de Revendedor: <Typography component="span" fontWeight="medium" color="text.primary">{user.resellerCode || 'N/A'}</Typography>
                      </Typography>
                    } 
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Mis Pedidos Recientes - Ocupa todo el ancho y está centrado */}
      <Card sx={cardStyle}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}> 
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 3, pb: 1, borderBottom: `2px solid ${theme.palette.primary.light}` }}>
            Mis Pedidos Recientes
          </Typography>
          {displayOrders && displayOrders.length > 0 ? (
            <Box>
              {displayOrders.map((order) => ( 
                <Accordion 
                  key={order._id} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2, 
                    boxShadow: theme.shadows[2], 
                    '&:before': { display: 'none' }, 
                    '&.Mui-expanded': { 
                      margin: 'auto', 
                      boxShadow: theme.shadows[4], 
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.dark }} />} 
                    aria-controls={`panel-${order._id}-content`}
                    id={`panel-${order._id}-header`}
                    sx={{ 
                      bgcolor: theme.palette.grey[100], 
                      borderRadius: 'inherit', 
                      '&.Mui-expanded': { 
                        bgcolor: theme.palette.grey[200], 
                        borderBottomLeftRadius: 0, 
                        borderBottomRightRadius: 0 
                      },
                      minHeight: { xs: '68px', sm: '76px' }, 
                      px: { xs: 2, sm: 3 }, 
                      py: { xs: 1.5, sm: 2 }, 
                      transition: 'background-color 0.2s ease-in-out',
                    }}
                  >
                    <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 0 } }}>
                          <ShoppingBagIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} /> ID: 
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="text.primary">
                          {order._id.substring(order._id.length - 8).toUpperCase()} 
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 0 } }}>
                          <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} /> Fecha:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="text.primary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 0 } }}>
                          <AttachMoneyIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} /> Total:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" color="text.primary">
                          ₡{Number(order.totalPrice || 0).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 0 } }}>
                          <InfoIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} /> Estado:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{
                            display: 'inline-block',
                            px: 2, 
                            py: 0.7, 
                            borderRadius: 1.5, 
                            color: 'white',
                            bgcolor: 
                              order.status === 'pending' ? theme.palette.warning.main :
                              order.status === 'placed' ? theme.palette.info.main :
                              order.status === 'processing' ? theme.palette.primary.main : 
                              order.status === 'shipped' ? theme.palette.secondary.main : 
                              order.status === 'delivered' ? theme.palette.success.main :
                              order.status === 'cancelled' ? theme.palette.error.main :
                              order.status === 'expired' ? theme.palette.error.dark : // Color específico para 'Expirado'
                              theme.palette.grey[500],
                            whiteSpace: 'nowrap', 
                            fontSize: { xs: '0.8rem', sm: '0.9rem' }, 
                            boxShadow: theme.shadows[1], 
                          }}
                        >
                          {getTranslatedStatus(order.status)} 
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 2.5, pb: 2.5, px: { xs: 2, sm: 3 }, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2, pb: 1, borderBottom: `1px dashed ${theme.palette.grey[200]}` }}>
                      Detalles del Pedido:
                    </Typography>
                    <List disablePadding>
                      {order.items.map((item, itemIndex) => (
                        <ListItem key={item._id || itemIndex} disableGutters sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          alignItems: 'center', 
                          py: 1.5, 
                          mb: itemIndex < order.items.length - 1 ? 1 : 0, 
                          borderBottom: itemIndex < order.items.length - 1 ? `1px dashed ${theme.palette.grey[100]}` : 'none' ,
                          '&:not(:last-child)': { mb: 1.5 }, 
                        }}>
                           {item.product?.imageUrls && item.product.imageUrls.length > 0 && (
                              <Box sx={{ width: 70, height: 70, mr: { xs: 1.5, sm: 2 }, flexShrink: 0, overflow: 'hidden', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.grey[200]}`, boxShadow: theme.shadows[1] }}>
                                <img 
                                  src={item.product.imageUrls[0].secure_url} 
                                  alt={item.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              </Box>
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: { xs: 'calc(100% - 85px)', sm: 'auto' } }}>
                              <Typography variant="body1" fontWeight="medium" color="text.primary">
                                {item.name} ({item.code})
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Cantidad: {item.quantity} x ₡{Number(item.priceAtSale || 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ ml: { xs: 0, sm: 3 }, mt: { xs: 1, sm: 0 }, minWidth: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'left', sm: 'right' } }}>
                              Subtotal: ₡{(item.quantity * Number(item.priceAtSale || 0)).toFixed(2)}
                            </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                No tienes pedidos realizados aún. ¡Explora nuestros productos para empezar!
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/products')} sx={{ px: 4, py: 1.5, borderRadius: 8, fontWeight: 700, boxShadow: theme.shadows[4] }}>
                Explorar Productos
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProfilePage;