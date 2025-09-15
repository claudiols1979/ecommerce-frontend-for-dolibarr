// components/DepartmentalFilterBar.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Collapse,
  IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDepartmental } from '../contexts/DepartmentalContext';
import { useNavigate, useLocation } from 'react-router-dom';

const DepartmentalFilterBar = () => {
  const { 
    taxonomy, 
    taxonomyLoading,
    fetchDepartmentalProducts, 
    fetchTaxonomy, 
    currentFilters,
    departmentalLoading 
  } = useDepartmental();
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [uiFilters, setUiFilters] = useState({
    department: '',
    brand: '',
    category: '',
    subcategory: ''
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [initialLoad, setInitialLoad] = useState(true);
  const [expanded, setExpanded] = useState(!isSmallScreen); // Expandido por defecto en pantallas grandes

  // Cargar taxonomía completa solo una vez al montar
  useEffect(() => {
    if (initialLoad) {
      fetchTaxonomy({});
      setInitialLoad(false);
    }
  }, [fetchTaxonomy, initialLoad]);

  // Sincronizar UI filters con currentFilters cuando cambian
  useEffect(() => {
    setUiFilters({
      department: currentFilters.department || '',
      brand: currentFilters.brand || '',
      category: currentFilters.category || '',
      subcategory: currentFilters.subcategory || ''
    });
    setActiveFilters(currentFilters);
  }, [currentFilters]);

  // Ajustar estado expandido cuando cambia el tamaño de pantalla
  useEffect(() => {
    if (!isSmallScreen) {
      setExpanded(true); // Siempre expandido en pantallas grandes
    }
  }, [isSmallScreen]);

  const handleFilterChange = async (filterType, value) => {
    const newValue = value.toString().trim();
    
    const newFilters = { 
      ...uiFilters, 
      [filterType]: newValue 
    };
    
    // Resetear filtros dependientes
    if (filterType === 'department') {
      newFilters.brand = '';
      newFilters.category = '';
      newFilters.subcategory = '';
    } else if (filterType === 'brand') {
      newFilters.category = '';
      newFilters.subcategory = '';
    } else if (filterType === 'category') {
      newFilters.subcategory = '';
    }
    
    setUiFilters(newFilters);
    
    // Actualizar taxonomía basada en los nuevos filtros (solo si hay cambios reales)
    if (newValue !== uiFilters[filterType]) {
      await fetchTaxonomy(newFilters);
    }
  };

  const applyFilters = useCallback(async (filtersToApply) => {
    // Limpiar filtros
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(filtersToApply)
        .filter(([_, value]) => value && value.toString().trim() !== '')
        .map(([key, value]) => [key, value.toString().trim()])
    );

    setActiveFilters(nonEmptyFilters);

    if (Object.keys(nonEmptyFilters).length > 0 && location.pathname !== '/products') {
      navigate('/products');
    }

    // Aplicar filtros a los productos
    await fetchDepartmentalProducts(nonEmptyFilters, 1, 20);
  }, [fetchDepartmentalProducts, navigate, location.pathname]);

  const handleSearch = useCallback(() => {
    applyFilters(uiFilters);
    if (isSmallScreen) {
      setExpanded(false); // Colapsar después de buscar en móviles
    }
  }, [applyFilters, uiFilters, isSmallScreen]);

  const clearFilter = useCallback((filterType) => {
    const newFilters = { ...uiFilters, [filterType]: '' };
    setUiFilters(newFilters);
    
    // Actualizar taxonomía con los filtros restantes
    fetchTaxonomy(newFilters);
    applyFilters(newFilters);
  }, [uiFilters, fetchTaxonomy, applyFilters]);

  const clearAllFilters = useCallback(() => {
    const emptyFilters = {
      department: '',
      brand: '',
      category: '',
      subcategory: ''
    };
    setUiFilters(emptyFilters);
    fetchTaxonomy({});
    applyFilters(emptyFilters);
  }, [fetchTaxonomy, applyFilters]);

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  // Filtrar opciones basado en selecciones actuales
  const filteredOptions = useMemo(() => {
    return {
      departments: taxonomy.departments || [],
      brands: taxonomy.brands || [],
      categories: taxonomy.categories || [],
      subcategories: taxonomy.subcategories || []
    };
  }, [taxonomy]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={0}        
      sx={{ 
        p: isSmallScreen ? 2 : 3,
        borderRadius: 0,
        backgroundColor: 'transparent',
        background: 'linear-gradient(135deg, rgba(38,60,92,0.95) 0%, rgba(233, 229, 209, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        mb: 3, 
        position: 'sticky',
        top: 50,
        zIndex: 900,
      }}
    >     
      {/* Encabezado del acordeón para pantallas pequeñas */}
      {isSmallScreen && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: expanded ? 2 : 0
          }}
          onClick={toggleExpanded}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 1 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
              Filtros
            </Typography>
            {hasActiveFilters && (
              <Chip 
                label={Object.keys(activeFilters).length} 
                size="small" 
                sx={{ 
                  ml: 1, 
                  backgroundColor: '#bb4343', 
                  color: 'white',
                  height: 20,
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
            )}
          </Box>
          <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      )}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container spacing={2} alignItems="flex-end">
          {/* Departamento */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">            
              <Select
                value={uiFilters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                label="Departamento"
                disabled={taxonomyLoading}
                displayEmpty
                sx={{                
                  color: 'white',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },                
                }}
                renderValue={(value) => {
                  if (!value) {
                  return <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Departamento</span>;
                  }
                  return value;
              }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#2a3e5f',
                      color: 'white',
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Todos los departamentos</MenuItem>
                {filteredOptions.departments.map(dept => (
                  <MenuItem key={dept} value={dept} sx={{ color: 'white' }}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Marca */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={taxonomyLoading}>            
              <Select
                value={uiFilters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                label="Marca"
                displayEmpty
                sx={{
                  color: 'white',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
                renderValue={(value) => {
                  if (!value) {
                  return <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Marca</span>;
                  }
                  return value;
              }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#2a3e5f',
                      color: 'white',
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Todas las marcas</MenuItem>
                {filteredOptions.brands.map(brand => (
                  <MenuItem key={brand} value={brand} sx={{ color: 'white' }}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Categoría */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={taxonomyLoading}>           
              <Select
                value={uiFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Categoría"
                displayEmpty
                sx={{
                  color: 'white',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
                renderValue={(value) => {
                  if (!value) {
                  return <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Categoría</span>;
                  }
                  return value;
              }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#2a3e5f',
                      color: 'white',
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Todas las categorías</MenuItem>
                {filteredOptions.categories.map(cat => (
                  <MenuItem key={cat} value={cat} sx={{ color: 'white' }}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subcategoría */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" disabled={taxonomyLoading}>            
              <Select
                value={uiFilters.subcategory}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                label="Subcategoría"
                displayEmpty
                sx={{
                  color: 'white',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
                renderValue={(value) => {
                  if (!value) {
                  return <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Subcategoría</span>;
                  }
                  return value;
              }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#2a3e5f',
                      color: 'white',
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '& .MuiMenuItem-root': {
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Todas las subcategorías</MenuItem>
                {filteredOptions.subcategories.map(sub => (
                  <MenuItem key={sub} value={sub} sx={{ color: 'white' }}>{sub}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón de búsqueda */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              disabled={departmentalLoading || taxonomyLoading}
              startIcon={departmentalLoading ? <CircularProgress size={16} /> : <SearchIcon />}
              sx={{ 
                height: '40px',
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(45deg, #bb4343 30%, #d32f2f 90%)',
                boxShadow: '0 3px 5px 2px rgba(187, 67, 67, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
                  boxShadow: '0 4px 8px 2px rgba(187, 67, 67, .4)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              {departmentalLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>

        {/* Chips de Filtros Activos */}
        {hasActiveFilters && (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              Filtros activos:
            </Typography>
            {Object.entries(activeFilters).map(([key, value]) => {
              const labelMap = {
                department: 'Departamento',
                brand: 'Marca', 
                category: 'Categoría',
                subcategory: 'Subcategoría'
              };

              return (
                <Chip
                  key={key}
                  label={`${labelMap[key]}: ${value}`}
                  onDelete={() => clearFilter(key)}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiChip-deleteIcon': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        color: 'white'
                      }
                    }
                  }}
                />
              );
            })}
            <Button
              size="small"
              onClick={clearAllFilters}
              startIcon={<CheckIcon />}
              sx={{ 
                fontSize: 18,
                fontWeight: 500,
                color: '#ffffffff',
                '&:hover': {
                  backgroundColor: 'rgba(93, 43, 202, 0.1)'
                }
              }}
            >
              Ver todos los productos
            </Button>
          </Box>
        )}

        {/* Indicador de carga de taxonomía */}
        {taxonomyLoading && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <CircularProgress size={16} sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Actualizando opciones...
            </Typography>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default React.memo(DepartmentalFilterBar);