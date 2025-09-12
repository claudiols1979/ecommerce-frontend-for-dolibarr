import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // ¡Importa CssBaseline!
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { ProductProvider } from './contexts/ProductContext';
import { ReviewProvider } from './contexts/ReviewContext';
import { DepartmentalProvider } from './contexts/DepartmentalContext';
import { SearchProvider } from './contexts/searchContext';
import { UpdateInfoProvider } from './contexts/UpdateInfoContext';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ¡Añade CssBaseline aquí! */}
      <Router>
        <HelmetProvider>
        <AuthProvider>
          <ProductProvider>
            <OrderProvider>
              <ReviewProvider>
                  <DepartmentalProvider>
                    <SearchProvider>
                      <UpdateInfoProvider>
                    <App />
                    </UpdateInfoProvider>
                    </SearchProvider>
                  </DepartmentalProvider>
              </ReviewProvider>
              <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </OrderProvider>
          </ProductProvider>
        </AuthProvider>
        </HelmetProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);