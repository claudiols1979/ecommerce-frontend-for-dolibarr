import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Asumiendo que AuthContext proporciona 'api'

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const { api } = useAuth(); // Obtener la instancia de `api` de tu AuthContext
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  /**
   * @desc    Función para obtener productos con filtros, búsqueda, ordenamiento y paginación.
   * Ahora envía los parámetros a la NUEVA ruta /api/products-filtered.
   * @param {number} page - Número de página actual.
   * @param {number} limit - Cantidad de productos por página.
   * @param {string} sortOrder - Orden de clasificación (ej., 'createdAt_desc', 'price_asc').
   * @param {string} searchTerm - Término de búsqueda por nombre o código.
   * @param {string} selectedGender - Género del producto (ej., 'men', 'women').
   * @param {number} minPrice - Precio mínimo del rango.
   * @param {number} maxPrice - Precio máximo del rango.
   */
  const fetchProducts = useCallback(async (
    page = 1,
    limit = 18,
    sortOrder = 'createdAt_desc', // Valor por defecto
    searchTerm = '',
    selectedGender = '',
    minPrice = 0,
    maxPrice = 300000 // Valor por defecto
  ) => {
    setLoading(true);
    setError(null); // Limpiar errores anteriores
    try {
      // Construir los parámetros de la URL para la NUEVA ruta de filtrado
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortOrder,
        searchTerm,
        selectedGender,
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
      }).toString();

      // Realizar la llamada a la NUEVA ruta del backend para productos filtrados
      const response = await api.get(`/api/products-filtered?${queryParams}`);
      
      setProducts(response.data.products);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalProducts(response.data.totalProducts);

    } catch (err) {
      console.error('ProductContext: Error al obtener productos filtrados:', err.response?.data || err);
      // Ajustar el mensaje de error para que sea más informativo
      setError({ message: err.response?.data?.message || 'Error al cargar los productos filtrados. Verifica la conexión o el servidor.' });
      toast.error(err.response?.data?.message || 'Error al cargar los productos filtrados.');
    } finally {
      setLoading(false);
    }
  }, [api]); // `api` es una dependencia para useCallback

  // Efecto para cargar productos cuando el componente de contexto se monta
  useEffect(() => {
    fetchProducts(); // Realiza una carga inicial de productos
  }, [fetchProducts]);

  const value = {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    fetchProducts, // Exportar la función fetchProducts para que los componentes puedan usarla
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
