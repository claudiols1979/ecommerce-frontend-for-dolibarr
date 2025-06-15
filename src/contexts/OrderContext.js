import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides 'api' and 'user'

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { api, user } = useAuth(); // Assuming api and user are available from AuthContext
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Esta función ahora llama a la NUEVA ruta dedicada para obtener el carrito pendiente
  const fetchCart = useCallback(async () => {
    if (!user || !user.token) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // **IMPORTANTE:** Ahora llama a la nueva ruta /api/orders/cart que creamos en backend/routes/cartRoutes.js
      const response = await api.get('/api/orders/cart'); 
      const fetchedCartItems = response.data.cartItems || [];

      const formattedCartItems = fetchedCartItems.map(item => ({
        ...item,
        image: item.product?.imageUrls && item.product.imageUrls.length > 0 
               ? item.product.imageUrls[0].secure_url 
               : 'https://placehold.co/100x100/E0E0E0/FFFFFF?text=No+Image'
      }));

      setCartItems(formattedCartItems);
    } catch (err) {
      console.error('Error al obtener el carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al cargar el carrito.' });
      toast.error(err.response?.data?.message || 'Error al cargar el carrito.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Las siguientes funciones (updateCartItemQuantity, removeCartItem, placeOrder, addItemToCart)
  // DEBEN seguir usando tus rutas ORIGINALES en backend/routes/orderRoutes.js
  // (e.g., /api/orders/add-item, /api/orders/update-item-quantity, /api/orders/remove-item/:productId, /api/orders/place-order)
  // ya que esas son las que te restauré y están en tu orderController.

  const updateCartItemQuantity = useCallback(async (productId, quantity) => {
    if (!user || !user.token) {
      toast.info('Por favor, inicia sesión para actualizar el carrito.');
      return;
    }
    if (!productId || quantity < 0) { 
      toast.error('Cantidad inválida.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/api/orders/update-item-quantity', { productId, quantity });
      toast.success(response.data.message || 'Cantidad actualizada.');
      fetchCart(); 
    } catch (err) {
      console.error('Error al actualizar la cantidad del ítem en el carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al actualizar la cantidad.' });
      toast.error(err.response?.data?.message || 'Error al actualizar la cantidad.');
    } finally {
      setLoading(false);
    }
  }, [api, user, fetchCart]);

  const removeCartItem = useCallback(async (productId) => {
    if (!user || !user.token) {
      toast.info('Por favor, inicia sesión para eliminar ítems del carrito.');
      return;
    }
    if (!productId) {
      toast.error('No se pudo eliminar el ítem: ID de producto no encontrado.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/api/orders/remove-item/${productId}`); 
      toast.success(response.data.message || 'Ítem eliminado del carrito.');
      fetchCart(); 
    } catch (err) {
      console.error('Error al eliminar el ítem del carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al eliminar el ítem del carrito.' });
      toast.error(err.response?.data?.message || 'Error al eliminar el ítem del carrito.');
    } finally {
      setLoading(false);
    }
  }, [api, user, fetchCart]);

  const placeOrder = useCallback(async (whatsappAgentNumber) => {
    if (!user || !user.token) {
      toast.info('Por favor, inicia sesión para finalizar el pedido.');
      return null;
    }
    if (cartItems.length === 0) {
      toast.error('No hay productos en el carrito para realizar un pedido.');
      return null;
    }
    if (!whatsappAgentNumber) {
      toast.error('El número de WhatsApp del agente es obligatorio.');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const orderItemsToSend = cartItems.map(item => ({
        product: item.product._id, 
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        priceAtSale: item.priceAtSale,
      }));

      const response = await api.post('/api/orders/place-order', { 
        items: orderItemsToSend,
        whatsappAgentPhoneNumber,
      });

      toast.success(response.data.message || 'Pedido realizado con éxito.');
      setCartItems([]); 
      return null; 
    } catch (err) {
      console.error('Error al finalizar el pedido:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al realizar el pedido.' });
      toast.error(err.response?.data?.message || 'Error al realizar el pedido.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [api, user, cartItems]);

  const addItemToCart = useCallback(async (productId, quantity, priceAtSale) => {
    if (!user || !user.token) {
        toast.info('Por favor, inicia sesión para añadir productos al carrito.');
        return;
    }
    if (!productId || quantity <= 0 || !priceAtSale) {
        toast.error('Datos de producto inválidos para añadir al carrito.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const response = await api.post('/api/orders/add-item', { productId, quantity, priceAtSale });
        toast.success(response.data.message || 'Producto añadido al carrito.');
        fetchCart(); 
    } catch (err) {
        console.error('Error al añadir producto al carrito:', err.response?.data || err);
        setError({ message: err.response?.data?.message || 'Error al añadir producto al carrito.' });
        toast.error(err.response?.data?.message || 'Error al añadir producto al carrito.');
    } finally {
        setLoading(false);
    }
  }, [api, user, fetchCart]);


  const value = {
    cartItems,
    loading,
    error,
    fetchCart,
    updateCartItemQuantity,
    removeCartItem,
    placeOrder,
    addItemToCart,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
