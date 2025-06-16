import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; 

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { api, user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]); // new
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user || !user.token) {
      setCartItems([]);
      setLoading(false); 
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/orders/cart'); 
      const fetchedCartItems = response.data.cartItems || [];

      const formattedCartItems = fetchedCartItems.map(item => ({
        ...item,
        image: item.product?.imageUrls && item.product.imageUrls.length > 0 
               ? item.product.imageUrls[0].secure_url 
               : 'https://placehold.co/100x100/1E88E5/FFFFFF?text=No+Image'
      }));

      setCartItems(formattedCartItems);
    } catch (err) {
      console.error('Error al obtener el carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al cargar el carrito.' });
      
      setCartItems([]); 
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartItemQuantity = useCallback(async (productId, quantity) => {
    if (!user || !user.token) {
     
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
      
      fetchCart(); 
    } catch (err) {
      console.error('Error al actualizar la cantidad del ítem en el carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al actualizar la cantidad.' });
      
    } finally {
      setLoading(false);
    }
  }, [api, user, fetchCart]);

  const removeCartItem = useCallback(async (productId) => {
    if (!user || !user.token) {
      
      return;
    }
    if (!productId) {
     
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/api/orders/remove-item/${productId}`); 
      
      fetchCart(); 
    } catch (err) {
      console.error('Error al eliminar el ítem del carrito:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al eliminar el ítem del carrito.' });
      
    } finally {
      setLoading(false);
    }
  }, [api, user, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!user || !user.token) {
        
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const response = await api.delete('/api/orders/clear-cart'); 
        
        setCartItems([]); 
    } catch (err) {
        console.error('Error al vaciar el carrito:', err.response?.data || err);
        setError({ message: err.response?.data?.message || 'Error al vaciar el carrito.' });
        
    } finally {
        setLoading(false);
    }
  }, [api, user]);


  const placeOrder = useCallback(async (whatsappAgentNumber) => { // Parámetro correcto
    if (!user || !user.token) {
      
      return null;
    }
    if (cartItems.length === 0) {
      
      return null;
    }
    if (!whatsappAgentNumber) {
      
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
        whatsappAgentPhoneNumber: whatsappAgentNumber, // *** CORRECCIÓN AQUÍ ***
      });

     
      setCartItems([]); 
      return response.data; 
    } catch (err) {
      console.error('Error al finalizar el pedido:', err.response?.data || err);
      setError({ message: err.response?.data?.message || 'Error al realizar el pedido.' });
     
      return null;
    } finally {
      setLoading(false);
    }
  }, [api, user, cartItems]);

  const addItemToCart = useCallback(async (productId, quantity, priceAtSale) => {
    if (!user || !user.token) {
        
        return;
    }
    if (!productId || quantity <= 0 || priceAtSale === undefined || priceAtSale === null || isNaN(priceAtSale) || priceAtSale <= 0) { 
       
        console.error("DEBUG: addItemToCart recibió datos inválidos:", {productId, quantity, priceAtSale});
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const response = await api.post('/api/orders/add-item', { productId, quantity, priceAtSale });
       
        fetchCart(); 
    } catch (err) {
        console.error('Error al añadir producto al carrito:', err.response?.data || err);
        setError({ message: err.response?.data?.message || 'Error al añadir producto al carrito.' });
       
    } finally {
        setLoading(false);
    }
  }, [api, user, fetchCart]);

  const fetchMyOrders = useCallback(async () => {
    if (!user || !user.token) {
      setMyOrders([]);
      setLoading(false); // Podríamos tener un loading específico para myOrders
      setError(null);
      return;
    }

    setLoading(true); // O setMyOrdersLoading(true); si lo tuvieras separado
    setError(null);
    try {
      // Usamos 'api.get'
      const response = await api.get(`/api/orders/my-orders`);
      if (response.data && Array.isArray(response.data.orders)) {
        setMyOrders(response.data.orders);
      } else {
        console.warn(
          "El formato de respuesta de la API para los pedidos del usuario fue inesperado. El array 'orders' falta o no es un array.",
          response.data
        );
        setError({ message: "Formato de respuesta inesperado para tus pedidos." });
        setMyOrders([]);
      }
    } catch (err) {
      console.error("Error al obtener los pedidos del usuario:", err);
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message || "Error al cargar tus pedidos.";
      setError({ message: errorMessage });
      setMyOrders([]);
    } finally {
      setLoading(false); // O setMyOrdersLoading(false);
    }
  }, [api, user]);

  useEffect(() => { 
    if (user && user.token) {
      fetchMyOrders(); 
    } else { 
      setMyOrders([]); 
    } 
  }, [user, fetchMyOrders]); 



  const value = {
    cartItems,
    loading,
    error,
    fetchCart,
    updateCartItemQuantity,
    removeCartItem,
    placeOrder,
    addItemToCart,
    clearCart, 
    myOrders,
    fetchMyOrders
    
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};