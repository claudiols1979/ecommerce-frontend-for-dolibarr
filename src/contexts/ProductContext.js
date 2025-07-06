import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'; // Se añade useRef y useEffect
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import PropTypes from 'prop-types';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // --- CORRECCIÓN: Usar una referencia para evitar bucles infinitos ---
  // Guardamos los valores que cambian en una ref para que fetchProducts no se regenere
  const stateRef = useRef({ loading, totalPages });
  useEffect(() => {
    stateRef.current = { loading, totalPages };
  }, [loading, totalPages]);

  const fetchProducts = useCallback(async (
    page = 1,
    limit = 18,
    sortOrder = 'createdAt_desc',
    searchTerm = '',
    selectedGender = '',
    minPrice = 0,
    maxPrice = 300000
  ) => {
    // Leemos los valores actuales desde la referencia
    const currentState = stateRef.current;

    // Previene una nueva carga si ya hay una en curso o si se han cargado todas las páginas
    if (currentState.loading || (page > currentState.totalPages && currentState.totalPages > 1)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortOrder,
        searchTerm,
        selectedGender,
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
      }).toString();

      const response = await api.get(`/api/products-filtered?${queryParams}`);

      if (page === 1) {
        setProducts(response.data.products);
      } else {
        setProducts(prevProducts => [...prevProducts, ...response.data.products]);
      }

      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalProducts(response.data.totalProducts);

    } catch (err) {
      console.error('ProductContext: Error al obtener productos filtrados:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 'Error al cargar los productos filtrados. Verifica la conexión o el servidor.';
      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
    // --- CORRECCIÓN: El array de dependencias ahora es estable ---
  }, [api]);

  const value = {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    fetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};