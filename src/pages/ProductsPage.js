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

const ProductsPage = () => {
  const theme = useTheme();
  // Destructuramos `products`, `loading`, `error`, `fetchProducts`, `currentPage`, `totalPages`, `totalProducts` de `useProducts()`.
  // `fetchProducts` ahora es la función modificada en ProductContext que acepta los parámetros de filtro.
  const { products, loading, error, fetchProducts, currentPage, totalPages, totalProducts } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState(''); 
  const [priceRange, setPriceRange] = useState([0, 300000]); 
  const [sortOrder, setSortOrder] = useState('createdAt_desc'); 

  const [page, setPage] = useState(1); // Estado para la paginación

  console.log("products page: ", products)

  // Opciones de género disponibles
  const availableGenders = [
    { value: 'men', label: 'Hombre' },
    { value: 'women', label: 'Mujer' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'children', label: 'Niños' },
    { value: 'elderly', label: 'Ancianos' },
    { value: 'other', label: 'Otro' },
  ];

  // Efecto que se dispara cada vez que cambian los filtros o la página
  useEffect(() => {
    const fetchProductsWithFilters = async () => {
      const limit = 18; // Definimos el límite de productos por página
      
      // Log para depuración: muestra los parámetros que se enviarán
      console.log('Frontend: Parámetros enviados a fetchProducts:', {
        page,
        limit,
        sortOrder,
        searchTerm,
        selectedGender,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });

      // Llamada a la función `fetchProducts` del contexto con todos los parámetros de filtro
      await fetchProducts(
        page, 
        limit, 
        sortOrder, 
        searchTerm, 
        selectedGender, 
        priceRange[0], 
        priceRange[1]
        // Ya no se pasa 'false' para `isActive` aquí, ya que esa lógica
        // (filtrar por `active: true`) se maneja directamente en el nuevo controlador backend.
      );
    };

    fetchProductsWithFilters();
    // Dependencias del useEffect: se vuelve a ejecutar si cualquiera de estos valores cambia
  }, [page, searchTerm, selectedGender, priceRange, sortOrder, fetchProducts]); 


  // Manejadores de cambios para los filtros
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Resetear a la primera página al cambiar el término de búsqueda
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
    setPage(1); // Resetear a la primera página al cambiar el género
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setPage(1); // Resetear a la primera página al cambiar el rango de precios
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    setPage(1); // Resetear a la primera página al cambiar el orden de clasificación
  };

  // Manejador de cambio de página de la paginación
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Función de formato para el valor del Slider de precios
  const valueLabelFormat = (value) => `₡${value}`;

  const displayedProducts = products; // Los productos a mostrar ya vienen filtrados y paginados del contexto


  return (
    <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 700, color: 'primary.main' }}>
        Todos Nuestros Productos
      </Typography>

      {/* Contenedor de Filtros */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.grey[100]}` }}>
        <Grid container spacing={6} alignItems="center" justifyContent="center"> 
          {/* Campo de búsqueda por nombre */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Buscar por Nombre"
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          {/* Selector de Género */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="gender-select-label">Filtrar por Género</InputLabel>
              <Select
                labelId="gender-select-label"
                value={selectedGender}
                label="Filtrar por Género"
                onChange={handleGenderChange}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {availableGenders.map((gender) => (
                  <MenuItem key={gender.value} value={gender.value}>{gender.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Slider de Rango de Precios */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography gutterBottom sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
              Rango de Precios: ₡{priceRange[0]} - ₡{priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              getAriaValueText={valueLabelFormat}
              min={0}
              max={300000} 
              step={1000} 
              marks={[
                { value: 0, label: '₡0' },
                { value: 300000, label: '₡300K+' }, 
              ]}
              color="primary"
            />
          </Grid>

          {/* Selector de Ordenar por */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel id="sort-select-label">Ordenar por</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortOrder}
                label="Ordenar por"
                onChange={handleSortChange}
              >
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
      {/* Fin Contenedor de Filtros */}

      {/* Sección de visualización de productos */}
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
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          {/* Paginación */}
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