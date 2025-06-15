import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, useMediaQuery, useTheme } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';


const Header = () => {
  const { cartItems } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    toast.info('Sesión cerrada.');
  };

  return (
    // CAMBIO CLAVE AQUÍ: position="sticky"
    // sx={{ zIndex: theme.zIndex.appBar + 1 }} asegura que siempre esté por encima del contenido.
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}> 
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', py: { xs: 1, sm: 0 } }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }}
        >
          Look & Smell
        </Typography>

        {isMobile ? (
          <Box>
            <IconButton
              component={RouterLink}
              to="/cart"
              color="inherit"
              sx={{ mr: 1 }}
              aria-label={`cart with ${cartItemCount} items`}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 1 }}>
              Inicio
            </Button>
            <Button color="inherit" component={RouterLink} to="/products" sx={{ mx: 1 }}>
              Productos
            </Button>
            {user ? (
              <>
                <Button color="inherit" component={RouterLink} to="/profile" sx={{ mx: 1 }}>
                  Hola, {user.firstName || 'Usuario'} 
                </Button>
                <Button color="inherit" onClick={handleLogout} sx={{ mx: 1 }}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Button color="inherit" component={RouterLink} to="/login" sx={{ mx: 1 }}>
                Iniciar Sesión
              </Button>
            )}
            <IconButton
              component={RouterLink}
              to="/cart"
              color="inherit"
              sx={{ ml: 2 }}
              aria-label={`cart with ${cartItemCount} items`}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;