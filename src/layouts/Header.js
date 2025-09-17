import React, { Fragment, useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, 
  useMediaQuery, useTheme, Drawer, List, ListItem, ListItemText, 
  Divider, InputBase, Paper, alpha 
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NavBranding from '../components/common/NavBranding';
import { amber } from '@mui/material/colors';
import PromotionalBanner from '../components/common/PromotionBanner';

const Header = () => {
  const { cartItems } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
  };

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (searchTerm.trim()) {
  //     navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  //     setSearchTerm('');
  //     setSearchOpen(false);
  //   }
  // };

  const handleSearch = (e) => {
  e.preventDefault();
  if (searchTerm.trim()) {
    // Si ya estamos en /products, forzar recarga con replace
    if (location.pathname === '/products') {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`, { 
        replace: true 
      });
    } else {
      // Si estamos en otra página, navegar normalmente
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
    setSearchTerm('');
    setSearchOpen(false);
  }
};

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchTerm('');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // --- FUNCIÓN DE ESTILO PARA LOS BOTONES DEL MENÚ ---
  const getNavButtonStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      mx: 1,
      fontWeight: isActive ? 900 : 600,
      color: '#Fff',
      borderBottom: isActive ? `3px solid #fff` : '3px solid transparent',
      borderRadius: 0,
      paddingBottom: '4px',
      transition: 'border-bottom 0.2s ease-in-out',
      '&:hover': {
        borderBottom: `3px solid #fff`,
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
      sx={{ width: 225, height: '100%', p: 2, backgroundColor: 'rgba(38, 60, 92, 0.9)' }}
      role="presentation"
      onClick={handleMobileMenuClose}
      onKeyDown={handleMobileMenuClose}
    >
      <Typography variant="h6" sx={{ mb: 6 }}></Typography>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuNavigate('/')} sx={getMobileNavStyle('/')}>
          <ListItemText primary="Inicio" sx={{ mr: 1, color: '#fff' }}/>
        </ListItem>
        <ListItem button onClick={() => handleMenuNavigate('/products')} sx={getMobileNavStyle('/products')}>
          <ListItemText primary="Productos" sx={{ mr: 1, color: '#fff' }}/>
        </ListItem>
        
        {user ? (
          <>
            <ListItem button onClick={() => handleMenuNavigate('/profile')} sx={getMobileNavStyle('/profile')}>
              <ListItemText primary="Mi cuenta" sx={{ mr: 1, color: '#fff' }}/>
            </ListItem>
            <ListItem button onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
              <ExitToAppIcon sx={{mr: 1, color: '#fff'}}/>
              <ListItemText primary="Cerrar Sesión" sx={{ mr: 1, color: '#fff' }}/>
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
    <Fragment>
    < PromotionalBanner />
    <AppBar position="sticky" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: 'rgba(38, 60, 92, 0.9)', 
        backgroundImage: `linear-gradient(to bottom, transparent, ${amber[0]})`,
        boxShadow: 0,
      }}> 
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', py: { xs: 1, sm: 0 } }}>
        <NavBranding />

        {/* Search Bar para desktop */}
        {!isMobile && !searchOpen && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: 1, 
            maxWidth: 400, 
            mx: 3,
            transition: 'all 0.3s ease'
          }}>
            <Paper
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.25),
                },
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <InputBase
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  ml: 2,
                  flex: 1,
                  color: 'white',
                  '&::placeholder': {
                    color: alpha(theme.palette.common.white, 0.7),
                  },
                }}
                inputProps={{ 'aria-label': 'buscar productos' }}
              />
              {searchTerm && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ color: 'white' }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                type="submit"
                sx={{ p: 1, color: 'white' }}
                aria-label="buscar"
              >
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>
        )}

        {isMobile ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Botón de búsqueda para móviles */}
            <IconButton
              color="inherit"
              onClick={handleSearchToggle}
              sx={{ mr: 1, color: '#fff' }}
              aria-label="buscar"
            >
              <SearchIcon />
            </IconButton>

            <IconButton
              component={RouterLink} to="/cart" color="inherit" sx={{ mr: 1, color: '#fff' }}
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
              <MenuIcon sx={{ color: '#fff' }}/>
            </IconButton>
            <Drawer
              anchor="right" 
              open={mobileMenuOpen} 
              onClose={handleMobileMenuClose} 
             
              ModalProps={{
                BackdropProps: {
                  sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente suave
                    backdropFilter: 'blur(2px)', // Blur muy sutil en el fondo
                  }
                }
              }}
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 2,
                // Estilos para el papel del drawer (el panel lateral)
                '& .MuiDrawer-paper': {
                  backgroundColor: 'rgba(38, 60, 92, 0.92)', // Más opaco para mejor legibilidad
                  backdropFilter: 'blur(12px)', // Efecto de vidrio esmerilado
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  width: 230,
                  // Posicionamiento para que no cubra el header
                  top: '70px', // Ajusta según la altura de tu header
                  height: 'calc(100% - 100px)', // Altura que no cubre el header
                  borderTopLeftRadius: '16px',
                  borderBottomLeftRadius: '18px',
                  border: '0.5px solid rgba(255, 255, 255, 0.1)',
                  // Asegurar que el contenido sea visible
                  color: 'white',
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: 400,
                  },
                  '& .MuiDivider-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }
                }
              }}
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
             Productos
            </Button>
            {user ? (
              <>
                <Button color="#36454F" component={RouterLink} to="/profile" sx={getNavButtonStyle('/profile')}>
                  Mi cuenta 
                </Button>
                <Button color="#36454F" onClick={handleLogout} sx={{ mx: 1, fontWeight: 500 }}>
                  <ExitToAppIcon sx={{color: '#fff'}}/>
                </Button>
              </>
            ) : (
              <Button color="#fff" component={RouterLink} to="/login" sx={getNavButtonStyle('/login')}>
                Iniciar Sesión
              </Button>
            )}
            <IconButton
              component={RouterLink} to="/cart" color="#fff"
              sx={{ ml: 2 }} aria-label={`cart with ${cartItemCount} items`}
            >
              <Badge badgeContent={cartItemCount} color="success">
                <ShoppingCartIcon sx={{color: '#fff'}}/>
              </Badge>
            </IconButton>
          </Box>
        )}
      </Toolbar>

      {/* Search Bar expandible para móviles */}
      {isMobile && searchOpen && (
        <Box sx={{ p: 2, backgroundColor: '#263C5C' }}>
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <InputBase
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              sx={{
                ml: 2,
                flex: 1,
                color: 'white',
                '&::placeholder': {
                  color: alpha(theme.palette.common.white, 0.7),
                },
              }}
              inputProps={{ 'aria-label': 'buscar productos' }}
            />
            {searchTerm && (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                sx={{ color: 'white' }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              type="submit"
              sx={{ p: 1, color: 'white' }}
              aria-label="buscar"
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              onClick={handleSearchToggle}
              sx={{ p: 1, color: 'white' }}
              aria-label="cerrar búsqueda"
            >
              <ClearIcon />
            </IconButton>
          </Paper>
        </Box>
      )}
    </AppBar>
    </Fragment>
  );
};

export default Header;