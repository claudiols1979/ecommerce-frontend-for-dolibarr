import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, styled } from '@mui/material';

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
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';

// PrivateRoute component
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

// --- NUEVO COMPONENTE DE LAYOUT PARA RUTAS PROTEGIDAS ---
// Este componente simple envuelve las páginas que SÍ deben tener Header y Footer.
const ProtectedPagesLayout = () => {
  return (
    <AppContainer>
        <Header />
        <MainContent>
            {/* Outlet renderizará la página protegida correspondiente (HomePage, ProductsPage, etc.) */}
            <Outlet /> 
        </MainContent>
        <Footer />
    </AppContainer>
  )
}

function App() {
  return (
    <Routes>
      {/* --- GRUPO 1: RUTAS PÚBLICAS --- */}
      {/* Estas rutas se renderizan por sí mismas, sin el layout principal (Header/Footer). */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<NewPasswordPage />} />

      {/* --- GRUPO 2: RUTAS PROTEGIDAS --- */}
      {/* Todas las demás rutas son verificadas por PrivateRoute primero. */}
      <Route element={<PrivateRoute />}>
        {/* Si la autenticación es exitosa, se renderizará el layout con las páginas anidadas. */}
        <Route element={<ProtectedPagesLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* La ruta "catch-all" ahora está DENTRO de la sección protegida. */}
          {/* Cualquier ruta desconocida para un usuario logueado lo llevará al inicio. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
