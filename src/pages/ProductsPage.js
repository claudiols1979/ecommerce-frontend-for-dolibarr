// components/ProductsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Box, Typography, Button, Grid, CircularProgress, Alert,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { useProducts } from '../contexts/ProductContext';
import { useDepartmental } from '../contexts/DepartmentalContext';
import { useTheme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- CONTEXTOS EXISTENTES Y NUEVOS ---
  const { products: standardProducts, loading: standardLoading, error: standardError, 
          fetchProducts, currentPage, totalPages } = useProducts();
  
  const { departmentalProducts, departmentalLoading, departmentalError, 
          departmentalHasMore, fetchDepartmentalProducts, currentFilters } = useDepartmental();

  const { addItemToCart } = useOrders();
  const { user } = useAuth();

  // --- ESTADOS Y DETECCIÓN DE MODO ---
  const hasDepartmentalFilters = Object.keys(currentFilters).length > 0;
  const isDepartmentalMode = hasDepartmentalFilters;
  
  // Decidir qué productos y estados usar
  const products = isDepartmentalMode ? departmentalProducts : standardProducts;
  const loading = isDepartmentalMode ? departmentalLoading : standardLoading;
  const error = isDepartmentalMode ? departmentalError : standardError;
  const hasMore = isDepartmentalMode ? departmentalHasMore : (currentPage < totalPages);

  // --- LÓGICA DE BÚSQUEDA EXISTENTE ---
  const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') || '');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState(() => new URLSearchParams(location.search).get('search') || '');
  const [selectedGender, setSelectedGender] = useState('');
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [sortOrder, setSortOrder] = useState('updatedAt_desc');
  const [page, setPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState(null);
  const [groupedProducts, setGroupedProducts] = useState([]);

  const availableGenders = [
    { value: 'men', label: 'Hombre' }, { value: 'women', label: 'Mujer' },
    { value: 'unisex', label: 'Unisex' }, { value: 'children', label: 'Niños' },
    { value: 'elderly', label: 'Ancianos' }, { value: 'other', label: 'Otro' },
  ];

  // --- FUNCIONES DE AGRUPAMIENTO ---
  const getBaseCode = (code) => {
    const firstUnderscoreIndex = code.indexOf('_');
    return firstUnderscoreIndex === -1 ? code : code.substring(0, firstUnderscoreIndex);
  };

  const getAttributes = (code) => {
    const firstUnderscoreIndex = code.indexOf('_');
    if (firstUnderscoreIndex === -1) return [];
    
    const attributesPart = code.substring(firstUnderscoreIndex + 1);
    return attributesPart.split('_');
  };

  const extractBaseNameFromAttributes = (productName, productCode) => {
    const attributeCount = (productCode.match(/_/g) || []).length;
    
    if (attributeCount === 0) {
      return productName;
    }
    
    const words = productName.split(' ');
    
    if (words.length > attributeCount) {
      return words.slice(0, words.length - attributeCount).join(' ');
    }
    
    return productName;
  };

  const groupProductsByBase = (products) => {
    const groups = {};
    
    products.forEach(product => {
      const baseCode = getBaseCode(product.code);
      
      if (!groups[baseCode]) {
        groups[baseCode] = [];
      }
      
      groups[baseCode].push({
        ...product,
        attributes: getAttributes(product.code)
      });
    });
    
    return groups;
  };

  const selectRandomVariantFromEachGroup = (groupedProducts) => {
    const displayProducts = [];
    
    for (const baseCode in groupedProducts) {
      const variants = groupedProducts[baseCode];
      
      if (variants.length === 1) {
        const baseName = extractBaseNameFromAttributes(variants[0].name, variants[0].code);
        displayProducts.push({
          ...variants[0],
          baseCode: baseCode,
          baseName: baseName,
          variantCount: 1
        });
      } else {
        const randomIndex = Math.floor(Math.random() * variants.length);
        const selectedVariant = variants[randomIndex];
        
        const baseName = extractBaseNameFromAttributes(selectedVariant.name, selectedVariant.code);
        
        displayProducts.push({
          ...selectedVariant,
          baseCode: baseCode,
          baseName: baseName,
          variantCount: variants.length
        });
      }
    }
    
    return displayProducts;
  };

  // En tu ProductsPage.js, agrega este useEffect después de los otros useEffects
useEffect(() => {
  // Este efecto se ejecuta cuando cambia location.search (parámetros de URL)
  const searchParams = new URLSearchParams(location.search);
  const searchTermFromUrl = searchParams.get('search') || '';
  
  console.log('🔍 URL search parameter changed:', searchTermFromUrl);
  
  // Solo procesar si estamos en modo estándar (no departamental)
  if (!isDepartmentalMode && searchTermFromUrl !== submittedSearchTerm) {
    console.log('🔄 Actualizando búsqueda desde URL');
    setSearchTerm(searchTermFromUrl);
    setSubmittedSearchTerm(searchTermFromUrl);
    
    // Forzar recarga de productos con el nuevo término de búsqueda
    fetchProducts(
      1, // Siempre empezar desde página 1
      20,
      sortOrder,
      searchTermFromUrl,
      selectedGender,
      priceRange[0],
      priceRange[1]
    );
  }
}, [location.search, isDepartmentalMode]); // Se ejecuta cuando cambian los parámetros de URL

  // --- EFFECT PARA MODO DEPARTAMENTAL ---
  useEffect(() => {
    if (isDepartmentalMode) {
      console.log('🔄 Modo departamental activado con filtros:', currentFilters);
      setPage(1); // Resetear a página 1 cuando cambian los filtros
    }
  }, [isDepartmentalMode, currentFilters]);

  // --- EFFECT PRINCIPAL SEPARADO POR MODO ---
  useEffect(() => {
    const limit = 20;
    
    if (isDepartmentalMode) {
      // Modo departamental
      console.log('📦 Fetching productos departamentales, página:', page);
      fetchDepartmentalProducts(currentFilters, page, limit);
    } else {
      // Modo estándar
      console.log('📦 Fetching productos estándar, página:', page);
      fetchProducts(page, limit, sortOrder, submittedSearchTerm, selectedGender, priceRange[0], priceRange[1]);
    }
  }, [page, isDepartmentalMode]); // Solo dependencias esenciales

  // --- EFFECT SEPARADO PARA BÚSQUEDA ESTÁNDAR ---
  useEffect(() => {
    if (!isDepartmentalMode) {
      console.log('🔍 Actualizando búsqueda estándar');
      setPage(1);
      fetchProducts(1, 20, sortOrder, submittedSearchTerm, selectedGender, priceRange[0], priceRange[1]);
    }
  }, [sortOrder, submittedSearchTerm, selectedGender, priceRange, isDepartmentalMode, fetchProducts]);

  // --- EFFECT PARA AGRUPAMIENTO ---
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('📊 Agrupando productos:', products.length);
      const grouped = groupProductsByBase(products);
      const displayProducts = selectRandomVariantFromEachGroup(grouped);
      setGroupedProducts(displayProducts);
    } else {
      setGroupedProducts([]);
    }
  }, [products]);

  // --- SCROLL INFINITO MEJORADO ---
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 500 || loading) {
      return;
    }
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // --- HANDLERS EXISTENTES ---
  const handleAddToCart = useCallback(async (product) => {
    if (typeof addItemToCart !== 'function') {
      toast.error("La funcionalidad para añadir al carrito no está disponible.");
      return;
    }

    setAddingProductId(product._id);

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
      setAddingProductId(null);
      return;
    }

    try {
      await addItemToCart(product._id, 1, priceToPass);
    } catch (err) {
      toast.error(err.message || "No se pudo añadir el producto.");
    } finally {
      setAddingProductId(null);
    }
  }, [addItemToCart, user]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSubmittedSearchTerm(searchTerm);
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSubmittedSearchTerm('');
    setSelectedGender('');
    navigate('/products', { replace: true });
  };

  const handleClearDepartmentalFilters = () => {
    navigate('/products', { replace: true });
    setPage(1);
  };

  // --- LÓGICA DE VISUALIZACIÓN MEJORADA ---
  const shouldShowNoProductsMessage = !loading && products.length === 0 && 
    (isDepartmentalMode || submittedSearchTerm || selectedGender);

  const getNoProductsMessage = () => {
    if (isDepartmentalMode) {
      const activeFilters = Object.entries(currentFilters)
        .map(([key, value]) => {
          const labels = {
            department: 'Departamento',
            brand: 'Marca',
            category: 'Categoría',
            subcategory: 'Subcategoría'
          };
          return `${labels[key]}: ${value}`;
        })
        .join(', ');
      
      return `No se encontraron productos con los filtros: ${activeFilters}`;
    }
    if (submittedSearchTerm && selectedGender) {
      return `No se encontraron productos con el término "${submittedSearchTerm}" y para el género "${availableGenders.find(g => g.value === selectedGender)?.label}"`;
    }
    if (submittedSearchTerm) {
      return `No se encontraron productos con el término "${submittedSearchTerm}"`;
    }
    if (selectedGender) {
      return `No se encontraron productos para el género "${availableGenders.find(g => g.value === selectedGender)?.label}"`;
    }
    return 'No hay productos disponibles en este momento.';
  };

  return (
    <>
      <Helmet>
        <title>Catálogo de Productos - Software Factory ERP</title>
        <meta name="description" content="Explora nuestro catálogo completo de perfumes, cosméticos y sets de regalo." />
      </Helmet>

      <Container maxWidth="xl" sx={{ my: 1, flexGrow: 1 }}>
        {/* <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(38,60,92,0.95) 60%, rgba(233, 229, 209, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
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
                      '& fieldset': { borderColor: 'rgba(232, 229, 214, 0.3)' },
                      '&:hover fieldset': { borderColor: '#ffffffff' },
                      '&.Mui-focused fieldset': { borderColor: '#ffffffff' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffffff' },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    height: '40px', minWidth: '40px', p: 0,
                    borderRadius: '8px', color: 'common.black',
                    backgroundColor: '#ffffffff', '&:hover': { backgroundColor: '#c85813ff' },
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
                  displayEmpty
                  sx={{
                    borderRadius: '8px',
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(240, 230, 230, 1)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffffff' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffffff' },
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}></InputLabel>
                <Select 
                  value={sortOrder} 
                  label="Ordenar por" 
                  onChange={handleSortChange} 
                  sx={{ 
                    borderRadius: '8px', 
                    color: 'white', 
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 1)' }, 
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffffff' }, 
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffffffff' }, 
                    '.MuiSvgIcon-root': { color: 'rgba(255, 255, 255, 0.7)' }, 
                  }} 
                  MenuProps={{ 
                    PaperProps: { 
                      sx: { 
                        bgcolor: '#1E1E1E', 
                        color: 'white' 
                      } 
                    } 
                  }}
                >
                  <MenuItem value="updatedAt_desc">Más Recientes</MenuItem>
                  <MenuItem value="createdAt_asc">Más Antiguos</MenuItem>
                  <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                  <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                  <MenuItem value="name_asc">Nombre: A-Z</MenuItem>
                  <MenuItem value="name_desc">Nombre: Z-A</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper> */}

        {/* MOSTRAR BOTÓN DE LIMPIAR FILTROS DEPARTAMENTALES SI ESTÁN ACTIVOS */}
        {/* {isDepartmentalMode && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleClearDepartmentalFilters}
              sx={{ 
                fontWeight: 'bold',
                backgroundColor: '#bb4343ff', 
                '&:hover': { backgroundColor: '#ff0000ff' } 
              }}
            >
              Limpiar Filtros Departamentales
            </Button>
          </Box>
        )} */}

        {submittedSearchTerm && !isDepartmentalMode && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"              
              onClick={handleClearSearch}
              sx={{ fontWeight: 'bold',backgroundColor: '#bb4343ff', '&:hover': { backgroundColor: '#ff0000ff' } }}
            >
              Mostrar Todos los Productos
            </Button>
          </Box>
        )}

        {loading && products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : shouldShowNoProductsMessage ? (
          <Alert severity="info" sx={{ p: 3 }}>
            {getNoProductsMessage()}
          </Alert>
        ) : groupedProducts.length === 0 ? (
          <Alert severity="info" sx={{ p: 3 }}>No hay productos disponibles en este momento.</Alert>
        ) : (
          <>
            <Grid container spacing={4} justifyContent="center">
              {groupedProducts.map((product) => (
                <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard
                    product={{
                      ...product,
                      name: product.baseName,
                      variantCount: product.variantCount
                    }}
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