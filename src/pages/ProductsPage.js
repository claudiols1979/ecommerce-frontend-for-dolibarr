import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem, Slider,
  Paper, IconButton, Divider, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { useProducts } from '../contexts/ProductContext';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const theme = useTheme();
  const { products, loading, error, fetchProducts, currentPage, totalPages } = useProducts();
  const { addItemToCart } = useOrders();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- LÓGICA DE BÚSQUEDA MODIFICADA ---
  // 'searchTerm' ahora solo guarda el valor del input.
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') || '');
  // 'submittedSearchTerm' guarda el valor que realmente se busca.
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') || '');

  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [sortOrder, setSortOrder] = useState('updatedAt_desc');
  const [page, setPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState(null);

  const availableGenders = [
    { value: 'men', label: 'Hombre' }, { value: 'women', label: 'Mujer' },
    { value: 'unisex', label: 'Unisex' }, { value: 'children', label: 'Niños' },
    { value: 'elderly', label: 'Ancianos' }, { value: 'other', label: 'Otro' },
  ];

  // El useEffect principal ahora depende de 'submittedSearchTerm' para la búsqueda.
  useEffect(() => {
    const limit = 20;
    fetchProducts(page, limit, sortOrder, submittedSearchTerm, selectedGender, priceRange[0], priceRange[1]);
  }, [page, sortOrder, submittedSearchTerm, selectedGender, priceRange, fetchProducts]);

  // La lógica del scroll infinito se mantiene intacta.
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 500 || loading) {
      return;
    }
    if (currentPage < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, currentPage, totalPages]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

  // --- HANDLERS DE BÚSQUEDA MODIFICADOS ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1); // Resetea la página para la nueva búsqueda
    setSubmittedSearchTerm(searchTerm); // Fija el término de búsqueda para disparar el useEffect
  };

  const handleGenderChange = (event) => {
    setPage(1);
    setSelectedGender(event.target.value);
  };

  // const handlePriceRangeChange = (event, newValue) => {
  //   setPage(1);
  //   setPriceRange(newValue);
  // };

  const handleSortChange = (event) => {
    setPage(1);
    setSortOrder(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSubmittedSearchTerm('');
    setPage(1);
    navigate('/products', { replace: true });
  };

  const valueLabelFormat = (value) => `₡${value}`;
  const displayedProducts = products;

  return (
    <>
      <Helmet>
        <title>Catálogo de Productos - Look & Smell</title>
        <meta name="description" content="Explora nuestro catálogo completo de perfumes, cosméticos y sets de regalo." />
      </Helmet>

      <Container maxWidth="lg" sx={{ my: 4, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'primary.main' }}>
          Todos Nuestros Productos
        </Typography>

        <Paper
          elevation={8}
          sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(48,48,48,0.95) 60%, rgba(253, 218, 13,0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.5)',
        }}
        >
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Buscar por Nombre"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px', color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    height: '40px', minWidth: '40px', p: 0,
                    borderRadius: '8px', color: 'common.black',
                    backgroundColor: '#FFD700', '&:hover': { backgroundColor: '#FFC700' },
                  }}
                >
                  <SearchIcon />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="gender-select-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}></InputLabel>
                <Select
                  labelId="gender-select-label"
                  value={selectedGender}
                  label="Filtrar por Género"
                  onChange={handleGenderChange}
                  displayEmpty // <-- ESTA ES LA ÚNICA LÍNEA AÑADIDA
                  sx={{
                    borderRadius: '8px',
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 215, 0, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                    '.MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#1E1E1E',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  {availableGenders.map((gender) => (<MenuItem key={gender.value} value={gender.value}>{gender.label}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} sm={6} md={3}><Typography gutterBottom sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>Rango de Precios</Typography><Slider value={priceRange} onChange={handlePriceRangeChange} valueLabelDisplay="auto" getAriaValueText={(value) => `₡${value}`} min={0} max={300000} step={1000} sx={{ color: '#FFD700', '& .MuiSlider-thumb': { backgroundColor: '#FFD700', boxShadow: '0 0 10px rgba(255, 215, 0, 0.7)' }, '& .MuiSlider-track': { border: 'none' }, '& .MuiSlider-rail': { opacity: 0.5, backgroundColor: '#bfbfbf' }, '& .MuiSlider-markLabel': { color: 'rgba(255, 255, 255, 0.5)' } }} /></Grid> */}
            <Grid item xs={12} sm={6} md={3}><FormControl fullWidth size="small"><InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}></InputLabel><Select value={sortOrder} label="Ordenar por" onChange={handleSortChange} sx={{ borderRadius: '8px', color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 215, 0, 0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' }, '.MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }, }} MenuProps={{ PaperProps: { sx: { bgcolor: '#1E1E1E', color: 'white' } } }}><MenuItem value="updatedAt_desc">Más Recientes</MenuItem><MenuItem value="createdAt_asc">Más Antiguos</MenuItem><MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem><MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem><MenuItem value="name_asc">Nombre: A-Z</MenuItem><MenuItem value="name_desc">Nombre: Z-A</MenuItem></Select></FormControl></Grid>
          </Grid>
        </Paper>

        {submittedSearchTerm && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClearSearch}
              sx={{ fontWeight: 'bold',textTransform: 'uppercase' }}
            >
              Mostrar Todos los Productos
            </Button>
          </Box>
        )}

        {loading && products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : products.length === 0 ? (
          <Alert severity="info" sx={{ p: 3 }}>No se encontraron productos con los filtros seleccionados.</Alert>
        ) : (
          <>
            <Grid container spacing={4} justifyContent="center">
              {displayedProducts.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    isAdding={addingProductId === product._id}
                  />
                </Grid>
              ))}
            </Grid>

            {loading && products.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default ProductsPage;
