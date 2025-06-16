import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, styled, Typography } from '@mui/material';

// Layout components
import Header from './layouts/Header';
import Footer from './layouts/Footer';

// Page components
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

// NUEVA IMPORTACIÓN: PrivateRoute
import PrivateRoute from './components/auth/PrivateRoute';

// Styled component for overall layout
const AppContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

function App() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Routes>
          {/* Ruta de Login (NO PROTEGIDA) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Grupo de Rutas Protegidas */}
          {/* Si el usuario no está logueado, cualquier intento de acceder a estas rutas
              será redirigido a /login por el PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            {/* Si tienes una página de perfil de usuario, también iría aquí */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Rutas de Fallback o 404 (pueden ser protegidas o no, según la lógica) */}
          {/* Para un sitio donde casi todo está protegido, el 404 también podría estar dentro de PrivateRoute */}
          {/* Por ahora, si no coincide ninguna, redirigimos a la raíz (que está protegida) */}
          <Route path="*" element={<Navigate to="/" replace />} /> 
        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

export default App;