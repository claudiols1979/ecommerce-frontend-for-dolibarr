import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import API_URL from '../config'; // Importa la URL de la API desde el archivo config.js
import authService from '../services/authService'; // IMPORTA EL NUEVO authService

// --- Auth Context ---
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // El estado 'user' ahora almacena el objeto completo del usuario (incluye el token)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      // Intenta parsear el usuario del localStorage. Si falla, retorna null.
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage on init:", error);
      localStorage.removeItem("user"); // Limpia datos corruptos
      return null;
    }
  });

  const navigate = useNavigate();

  // Define la función de cierre de sesión
  const logout = useCallback(() => {
    authService.logout(); // Usa el servicio de autenticación para limpiar localStorage
    setUser(null); // Limpia el estado de React    
    navigate('/login'); // Redirigir a la página de inicio de sesión de la tienda de comercio electrónico
  }, [navigate]);

  // Crea y configura una instancia de Axios memoizada
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Establece el encabezado de autorización usando el token dentro del objeto 'user'
    if (user && user.token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete instance.defaults.headers.common['Authorization'];
    }

    // --- Interceptor de respuesta de Axios para caducidad/invalidación de token ---
    instance.interceptors.response.use(
      response => response,
      error => {
        const errorMessage = error.response?.data?.message;
        
        // Si es 401 y el mensaje específico de expiración, o cualquier 401, forzar logout
        if (error.response && error.response.status === 401 && 
            (errorMessage === 'No autorizado, token fallido o expirado.' || errorMessage === 'jwt expired')) { // Agregamos 'jwt expired' para el error del backend
          console.error("Backend informó que el JWT expiró o no está autorizado. Forzando cierre de sesión.");
          logout();
        } else if (error.response && error.response.status === 401) {
          console.error("Solicitud no autorizada. Forzando cierre de sesión.", errorMessage);
          logout();
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [user, logout]); // Depende de 'user' (para el token) y 'logout'

  // Efecto para validar el token y cargar el usuario al montar/cambiar 'user'
  useEffect(() => {
    // Solo valida si hay un usuario logueado (y por lo tanto un token)
    if (user && user.token) {
      try {
        const decodedToken = jwtDecode(user.token);
        
        // Comprueba si el token ha expirado
        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn("Lado del cliente: JWT detectado como expirado. Forzando cierre de sesión.");
          logout();
        } else {
          // Si el token es válido, y los datos del usuario ya están en el estado 'user',
          // no necesitas hacer nada más aquí, a menos que quieras refrescar los datos del perfil
          // con una llamada a /api/users/me o similar.
          // Por ahora, el objeto 'user' ya tiene los datos de localStorage/login.
        }
      } catch (decodeError) {
        console.error("Error al decodificar JWT o formato de token inválido:", decodeError);
        logout(); // Si el token está malformado, forzar cierre de sesión
      }
    } else if (user === null) {
      // Si user es null (no hay token o logout), asegúrate de que el api no tenga headers de auth
      delete api.defaults.headers.common['Authorization'];
    }
  }, [user, logout]); // Depende de 'user' y 'logout'

  // Esta función maneja la solicitud de inicio de sesión de revendedor
  const login = async (resellerCode) => { 
    try {
      // Usa authService para la lógica de llamada a la API y guardado en localStorage
      const userData = await authService.loginReseller(resellerCode);
      setUser(userData); // Establece el objeto de usuario completo en el estado      
      return true;
    } catch (error) {
      console.error('Login de revendedor fallido:', error.response?.data?.message || error.message);      
      return false;
    }
  };

  // Proporciona la instancia 'api' (axios) configurada y otros valores de contexto
  // 'authToken' ya no es necesario como estado separado, se deriva de user?.token
  const value = { 
    user, 
    api, 
    login, 
    logout, 
    API_URL,
    isAuthenticated: !!user, // Conveniencia para verificar si hay un usuario logueado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
