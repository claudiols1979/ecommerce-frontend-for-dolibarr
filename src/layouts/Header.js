import React, { useState } from 'react'; // Import useState
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, 
  useMediaQuery, useTheme, Drawer, List, ListItem, ListItemText, Divider 
} from '@mui/material'; // Import Drawer and List components
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';


const Header = () => {
  const { cartItems } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate(); // Use navigate for mobile menu actions

  // --- NEW: State to manage the mobile menu drawer ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
  };

  // --- NEW: Handlers to open and close the mobile menu ---
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // --- NEW: Function to handle navigation from the mobile menu ---
  const handleMenuNavigate = (path) => {
    navigate(path);
    handleMobileMenuClose(); // Close menu after navigation
  }

  // --- NEW: JSX for the content of the slide-out mobile menu ---
  const drawerContent = (
    <Box
      sx={{ width: 250, p: 2 }}
      role="presentation"
      onClick={handleMobileMenuClose}
      onKeyDown={handleMobileMenuClose}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>Menú</Typography>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuNavigate('/')}>
          <ListItemText primary="Inicio" />
        </ListItem>
        <ListItem button onClick={() => handleMenuNavigate('/products')}>
          <ListItemText primary="Fragancias" />
        </ListItem>
        
        {user ? (
          <>
            <ListItem button onClick={() => handleMenuNavigate('/profile')}>
              <ListItemText primary="Mi cuenta" />
            </ListItem>
            <ListItem button onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
              <ExitToAppIcon />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => handleMenuNavigate('/login')}>
            <ListItemText primary="Iniciar Sesión" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}> 
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
            {/* --- MODIFIED: The hamburger icon now opens the drawer --- */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
            {/* --- NEW: The Drawer component for the mobile menu --- */}
            <Drawer
              anchor="right"
              open={mobileMenuOpen}
              onClose={handleMobileMenuClose}
            >
              {drawerContent}
            </Drawer>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/" sx={{ mx: 1, fontWeight: 700 }}>
              Inicio
            </Button>
            <Button color="inherit" component={RouterLink} to="/products" sx={{ mx: 1, fontWeight: 700  }}>
              Fragancias
            </Button>
            {user ? (
              <>
                <Button color="inherit" component={RouterLink} to="/profile" sx={{ mx: 1, fontWeight: 700 }}>
                  Mi cuenta 
                </Button>
                <Button color="inherit" onClick={handleLogout} sx={{ mx: 1, fontWeight: 700 }}>
                  <ExitToAppIcon />
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
