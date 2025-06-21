import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem, Slider,
  Paper, IconButton, Divider, Pagination 
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune'; 
import SortIcon from '@mui/icons-material/Sort'; 
import ProductCard from '../components/product/ProductCard';
import { useProducts } from '../contexts/ProductContext';
import { useTheme } from '@mui/material/styles';
// --- Import contexts needed for local logic ---
import { useOrders } from '../contexts/OrderContext'; 
import { useAuth } from '../contexts/AuthContext'; // We need the user for price calculation
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const theme = useTheme();
  const { products, loading, error, fetchProducts, currentPage, totalPages, totalProducts } = useProducts();
  const { addItemToCart } = useOrders();
  const { user } = useAuth(); // Get user for price logic

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState(''); 
  const [priceRange, setPriceRange] = useState([0, 300000]); 
  const [sortOrder, setSortOrder] = useState('createdAt_desc'); 
  const [page, setPage] = useState(1);
  
  // Local state to track loading for a SINGLE product
  const [addingProductId, setAddingProductId] = useState(null);

  const availableGenders = [
    { value: 'men', label: 'Hombre' },
    { value: 'women', label: 'Mujer' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'children', label: 'Niños' },
    { value: 'elderly', label: 'Ancianos' },
    { value: 'other', label: 'Otro' },
  ];

  // This useEffect remains unchanged
  useEffect(() => {
    const fetchProductsWithFilters = async () => {
      const limit = 18; 
      await fetchProducts(
        page, 
        limit, 
        sortOrder, 
        searchTerm, 
        selectedGender, 
        priceRange[0], 
        priceRange[1]
      );
    };

    fetchProductsWithFilters();
  }, [page, searchTerm, selectedGender, priceRange, sortOrder, fetchProducts]); 


  //   // --- COPIA Y PEGA ESTE BLOQUE ---
  // useEffect(() => {
  //   // 1. Definimos el intervalo de tiempo en milisegundos (30 segundos)
  //   const thirtySeconds = 30000;

  //   // 2. Creamos un intervalo que se ejecutará cada 30 segundos
  //   const intervalId = setInterval(() => {
  //     console.log('Actualizando productos automáticamente...');
      
  //     // 3. Condición de seguridad: No iniciar una nueva carga si ya hay una en curso.
  //     // Esto previene peticiones duplicadas y posibles race conditions.
  //     if (!loading) {
  //       fetchProducts();
  //     }
  //   }, thirtySeconds);

  //   // 4. Función de limpieza: Esto es CRÍTICO.
  //   // Se ejecuta cuando el componente se "desmonta" (ej. el usuario navega a otra página).
  //   // Limpia el intervalo para que no siga ejecutándose en segundo plano.
  //   return () => {
  //     clearInterval(intervalId);
  //     console.log('Intervalo de actualización de productos detenido.');
  //   };
  // }, [loading, fetchProducts]); // 5. Array de dependencias
  // // --- FIN DEL BLOQUE ---
  
  // --- CORRECTED: Local handler now calculates price before adding ---
  const handleAddToCart = useCallback(async (product) => {
    if (typeof addItemToCart !== 'function') {
      toast.error("La funcionalidad para añadir al carrito no está disponible.");
      return;
    }
    
    setAddingProductId(product._id); // Start loading for this card only

    // --- Price Calculation Logic (replicated from original ProductCard) ---
    const getPriceForCart = () => {
        let calculatedPrice = null;
        if (user && user.role === 'Revendedor' && user.resellerCategory && product.resellerPrices) {
            const priceForCategory = product.resellerPrices[user.resellerCategory];
            if (typeof priceForCategory === 'number' && priceForCategory > 0) {
                calculatedPrice = priceForCategory;
            }
        }
        if (calculatedPrice === null && product.resellerPrices && typeof product.resellerPrices.cat1 === 'number' && product.resellerPrices.cat1 > 0) {
            calculatedPrice = product.resellerPrices.cat1;
        }
        return calculatedPrice || 0;
    };

    const priceToPass = getPriceForCart();
    if (priceToPass <= 0) {
        toast.error("No se puede añadir al carrito: precio no disponible o inválido.");
        setAddingProductId(null); // Stop loading if price is invalid
        return;
    }
    // --- End of Price Logic ---

    try {
      // Your original logic passed 3 arguments. We now do the same.
      await addItemToCart(product._id, 1, priceToPass); 
      
    } catch (err) {
      toast.error(err.message || "No se pudo añadir el producto.");
    } finally {
      setAddingProductId(null); // Reset loading state
    }
  }, [addItemToCart, user]);


  // All other handlers remain unchanged
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); 
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
    setPage(1); 
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setPage(1); 
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    setPage(1); 
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const valueLabelFormat = (value) => `₡${value}`;

  const displayedProducts = products; 


  return (
    <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Todos Nuestros Productos
      </Typography>

      {/* Filters section remains unchanged */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.grey[100]}` }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center"> 
            {/* Search Field */}
            <Grid item xs={12} sm={6} md={3}>
                <TextField label="Buscar por Nombre" variant="outlined" fullWidth size="small" value={searchTerm} onChange={handleSearchChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Grid>
            {/* Gender Selector */}
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="gender-select-label">Filtrar por Género</InputLabel>
                <Select labelId="gender-select-label" value={selectedGender} label="Filtrar por Género" onChange={handleGenderChange}>
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {availableGenders.map((gender) => (<MenuItem key={gender.value} value={gender.value}>{gender.label}</MenuItem>))}
                </Select>
                </FormControl>
            </Grid>
            {/* Price Range Slider */}
            <Grid item xs={12} sm={6} md={3}>
                <Typography gutterBottom sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>Rango de Precios: ₡{priceRange[0]} - ₡{priceRange[1]}</Typography>
                <Slider value={priceRange} onChange={handlePriceRangeChange} valueLabelDisplay="auto" getAriaValueText={valueLabelFormat} min={0} max={300000} step={1000} marks={[{ value: 0, label: '₡0' }, { value: 300000, label: '₡300K+' }]} color="primary" />
            </Grid>
            {/* Sort Selector */}
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel id="sort-select-label">Ordenar por</InputLabel>
                <Select labelId="sort-select-label" value={sortOrder} label="Ordenar por" onChange={handleSortChange}>
                    <MenuItem value="createdAt_desc">Más Recientes</MenuItem>
                    <MenuItem value="createdAt_asc">Más Antiguos</MenuItem>
                    <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                    <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                    <MenuItem value="name_asc">Nombre: A-Z</MenuItem>
                    <MenuItem value="name_desc">Nombre: Z-A</MenuItem>
                </Select>
                </FormControl>
            </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress color="primary" />
          <Typography ml={2}>Cargando productos...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : displayedProducts.length === 0 ? (
        <Alert severity="info" sx={{ p: 3 }}>No se encontraron productos con los filtros seleccionados.</Alert>
      ) : (
        <>
          <Grid container spacing={4} justifyContent="center">
            {displayedProducts.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}> 
                {/* --- Pass the local handler and loading state to the card --- */}
                <ProductCard 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                  isAdding={addingProductId === product._id}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination remains unchanged */}
          {totalPages >= 1 && ( 
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                showFirstButton showLastButton 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductsPage;