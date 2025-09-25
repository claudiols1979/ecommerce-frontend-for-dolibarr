// contexts/DepartmentalContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; 
import { useNavigate } from "react-router-dom";

const DepartmentalContext = createContext();

export const useDepartmental = () => useContext(DepartmentalContext);

export const DepartmentalProvider = ({ children }) => {
  const { api } = useAuth(); 
  const navigate = useNavigate()
  // Estados para productos departamentales
  const [departmentalProducts, setDepartmentalProducts] = useState([]);
  const [departmentalLoading, setDepartmentalLoading] = useState(false);
  const [departmentalError, setDepartmentalError] = useState(null);
  const [departmentalHasMore, setDepartmentalHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // ✅ Nuevo estado para trackear página actual
  const [currentFilters, setCurrentFilters] = useState({});
  
  // Estado para taxonomía
  const [taxonomy, setTaxonomy] = useState({
    departments: [],
    brands: [],
    categories: [],
    subcategories: []
  });
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);

  // Función para obtener taxonomía contextual
  const fetchTaxonomy = useCallback(async (filters = {}) => {
    try {
      setTaxonomyLoading(true);
      console.log('📋 Solicitando taxonomía con filtros:', filters);
      
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

  // Función principal para obtener productos - CORREGIDA
  const fetchDepartmentalProducts = useCallback(async (
    filters = {},
    page = 1,
    limit = 18
  ) => {
    if (departmentalLoading) return;

    setDepartmentalLoading(true);
    setDepartmentalError(null);
    
    try {
      const params = {
        limit: limit.toString(),
        page: page.toString(),
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
      
      // ✅ Manejo correcto de la paginación
      if (page === 1) {
        setDepartmentalProducts(response.data.products);
      } else {
        setDepartmentalProducts(prev => [...prev, ...response.data.products]);
      }
      
      setDepartmentalHasMore(page < response.data.pages);
      setCurrentPage(page); // ✅ Actualizar página actual
      setCurrentFilters(filters);

      console.log(`📊 Página ${page} cargada. Productos: ${response.data.products.length}, ¿Hay más?: ${page < response.data.pages}`);

    } catch (err) {
      console.error('Error al obtener productos departamentales:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar los productos.';
      setDepartmentalError({ message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setDepartmentalLoading(false);
    }
  }, [api, departmentalLoading]);

  // ✅ Función para cargar más productos - CORREGIDA
  const loadMoreProducts = useCallback(() => {
    const nextPage = currentPage + 1;
    console.log(`⬇️ Cargando página ${nextPage}...`);
    fetchDepartmentalProducts(currentFilters, nextPage);
  }, [fetchDepartmentalProducts, currentFilters, currentPage]);

  // ✅ Función para buscar con nuevos filtros - CORREGIDA
  const searchWithFilters = useCallback((filters) => {
    console.log(`🔍 Nueva búsqueda con filtros:`, filters);
    fetchDepartmentalProducts(filters, 1); // ✅ Siempre empezar en página 1
  }, [fetchDepartmentalProducts]);

  // ✅ Función para reiniciar búsqueda
  const resetSearch = useCallback(() => {
    console.log('🔄 Reiniciando búsqueda...');
    setDepartmentalProducts([]);
    setCurrentPage(1);
    setDepartmentalHasMore(false);
    setCurrentFilters({});
  }, []);  

  const value = {
    // Productos departamentales
    departmentalProducts,
    departmentalLoading,
    departmentalError,
    departmentalHasMore,
    currentPage, // ✅ Exportar página actual
    fetchDepartmentalProducts,
    loadMoreProducts,
    searchWithFilters,
    resetSearch, // ✅ Nueva función  
    
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