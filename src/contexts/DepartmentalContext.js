// contexts/DepartmentalContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; 

const DepartmentalContext = createContext();

export const useDepartmental = () => useContext(DepartmentalContext);

export const DepartmentalProvider = ({ children }) => {
  const { api } = useAuth(); 
  
  // Estados para productos departamentales
  const [departmentalProducts, setDepartmentalProducts] = useState([]);
  const [departmentalLoading, setDepartmentalLoading] = useState(false);
  const [departmentalError, setDepartmentalError] = useState(null);
  const [departmentalHasMore, setDepartmentalHasMore] = useState(false);
  const [departmentalLastId, setDepartmentalLastId] = useState(null);
  
  // Estado para taxonomía
  const [taxonomy, setTaxonomy] = useState({
    departments: [],
    brands: [],
    categories: [],
    subcategories: []
  });

  const [currentFilters, setCurrentFilters] = useState({});
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);

  // Función para obtener taxonomía contextual
  const fetchTaxonomy = useCallback(async (filters = {}) => {
    try {
      setTaxonomyLoading(true);
      console.log('📋 Solicitando taxonomía con filtros:', filters);
      
      // Construir parámetros de consulta
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.brand) params.brand = filters.brand;
      if (filters.category) params.category = filters.category;
      if (filters.subcategory) params.subcategory = filters.subcategory;
      
      const response = await api.get('/api/products/public/taxonomy', { 
        params: Object.keys(params).length > 0 ? params : undefined 
      });
      
      console.log('📦 Respuesta de taxonomía:', response.data);
      setTaxonomy(response.data.data);
      
    } catch (err) {
      console.error('❌ Error al obtener taxonomía:', err);
      // Cargar taxonomía vacía para evitar errores
      setTaxonomy({
        departments: [],
        brands: [],
        categories: [],
        subcategories: []
      });
    } finally {
      setTaxonomyLoading(false);
    }
  }, [api]);

  // Función para obtener productos con filtros departamentales
  const fetchDepartmentalProducts = useCallback(async (
    filters = {},
    page = 1,
    limit = 20
  ) => {
    if (departmentalLoading) return;

    setDepartmentalLoading(true);
    setDepartmentalError(null);
    
    try {
      const params = {
        limit: limit.toString(),
        lastId: page > 1 ? departmentalLastId : null,
        ...filters
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      console.log('🚀 Fetching products with params:', params);
      const response = await api.get('/api/products/public/filtered', { params });
      
      if (page === 1) {
        setDepartmentalProducts(response.data.data.products);
      } else {
        setDepartmentalProducts(prev => [...prev, ...response.data.data.products]);
      }
      
      setDepartmentalHasMore(response.data.data.hasMore);
      setDepartmentalLastId(response.data.data.lastId);
      setCurrentFilters(filters);

    } catch (err) {
      console.error('Error al obtener productos departamentales:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar los productos.';
      setDepartmentalError({ message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setDepartmentalLoading(false);
    }
  }, [api, departmentalLoading, departmentalLastId]);

  const value = {
    // Productos departamentales
    departmentalProducts,
    departmentalLoading,
    departmentalError,
    departmentalHasMore,
    fetchDepartmentalProducts,
    
    // Taxonomía contextual
    taxonomy,
    taxonomyLoading,
    fetchTaxonomy,
    currentFilters
  };

  return (
    <DepartmentalContext.Provider value={value}>
      {children}
    </DepartmentalContext.Provider>
  );
};

DepartmentalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};