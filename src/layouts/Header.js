import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, useMediaQuery, useTheme, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NavBranding from '../components/common/NavBranding';
import { amber } from '@mui/material/colors';

const Header = () => {
  const { cartItems } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMenuNavigate = (path) => {
    navigate(path);
    handleMobileMenuClose();
  }
  
  // --- FUNCIÓN DE ESTILO PARA LOS BOTONES DEL MENÚ ---
  const getNavButtonStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      mx: 1,
      fontWeight: isActive ? 900 : 600,
      color: '#36454F',
      borderBottom: isActive ? `3px solid #FFBF00` : '3px solid transparent',
      borderRadius: 0, // Para que el borde sea una línea recta
      paddingBottom: '4px',
      transition: 'border-bottom 0.2s ease-in-out',
      '&:hover': {
        borderBottom: `3px solid ${theme.palette.secondary.light}`,
      }
    };
  };
  
    // --- FUNCIÓN DE ESTILO PARA LOS ITEMS DEL MENÚ MÓVIL ---
  const getMobileNavStyle = (path) => {
    const isActive = location.pathname === path;
    return {
        fontWeight: 700,
        backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
        borderRadius: '8px',
        '& .MuiListItemText-primary': {
            fontWeight: isActive ? 'bold' : 'normal',
        }
    };
  };

  const drawerContent = (
    <Box
      sx={{ width: 225, p: 2 }}
      role="presentation"
      onClick={handleMobileMenuClose}
      onKeyDown={handleMobileMenuClose}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>Menú</Typography>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuNavigate('/')} sx={getMobileNavStyle('/')}>
          <ListItemText primary="Inicio" />
        </ListItem>
        <ListItem button onClick={() => handleMenuNavigate('/products')} sx={getMobileNavStyle('/products')}>
          <ListItemText primary="Perfumes" />
        </ListItem>
        
        {user ? (
          <>
            <ListItem button onClick={() => handleMenuNavigate('/profile')} sx={getMobileNavStyle('/profile')}>
              <ListItemText primary="Mi cuenta" />
            </ListItem>
            <ListItem button onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
              <ExitToAppIcon sx={{mr: 1}}/>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => handleMenuNavigate('/login')} sx={getMobileNavStyle('/login')}>
            <ListItemText primary="Iniciar Sesión" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: 'transparent',
        backgroundImage: `linear-gradient(to bottom, transparent, ${amber[200]})`,
        boxShadow: 0,

        }}> 
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', py: { xs: 1, sm: 0 } }}>
        {/* <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1, textDecoration: 'none', color: 'inherit',
            fontWeight: 700, letterSpacing: '0.05em',
            fontSize: { xs: '1.2rem', sm: '1.5rem' }
          }}
        >
          <AuthBranding />
        </Typography> */}
        <NavBranding />

        {isMobile ? (
          <Box>
            <IconButton
              component={RouterLink} to="/cart" color="inherit" sx={{ mr: 1 }}
              aria-label={`cart with ${cartItemCount} items`}
            >
              <Badge badgeContent={cartItemCount} color="success">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit" aria-label="open drawer" edge="end"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right" open={mobileMenuOpen} onClose={handleMobileMenuClose}
            >
              {drawerContent}
            </Drawer>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/" sx={getNavButtonStyle('/')}>
              Inicio
            </Button>
            <Button color="inherit" component={RouterLink} to="/products" sx={getNavButtonStyle('/products')}>
             Perfumes
            </Button>
            {user ? (
              <>
                <Button color="#36454F" component={RouterLink} to="/profile" sx={getNavButtonStyle('/profile')}>
                  Mi cuenta 
                </Button>
                <Button color="#36454F" onClick={handleLogout} sx={{ mx: 1, fontWeight: 500 }}>
                  <ExitToAppIcon sx={{color: '#36454F'}}/>
                </Button>
              </>
            ) : (
              <Button color="#36454F" component={RouterLink} to="/login" sx={getNavButtonStyle('/login')}>
                Iniciar Sesión
              </Button>
            )}
            <IconButton
              component={RouterLink} to="/cart" color="#36454F"
              sx={{ ml: 2 }} aria-label={`cart with ${cartItemCount} items`}
            >
              <Badge badgeContent={cartItemCount} color="success">
                <ShoppingCartIcon sx={{color: '#36454F'}}/>
              </Badge>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;