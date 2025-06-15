// frontend/src/services/authService.js

import axios from 'axios';
import API_URL from '../config'; // Asegúrate de que esta ruta sea correcta para tu config.js

const API_AUTH_URL = `${API_URL}/api/auth`; // Base URL para las rutas de autenticación

// Función para el login de revendedor (solo con resellerCode)
const loginReseller = async (resellerCode) => {
  const response = await axios.post(`${API_AUTH_URL}/reseller-login`, { resellerCode });
  
  // Si el login es exitoso y se recibe un token, guarda el OBJETO DE USUARIO COMPLETO
  // tal como lo devuelve el backend (que incluye el token)
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data; // Devuelve los datos de la respuesta (incluyendo el token)
};

// Función para cerrar sesión
const logout = () => {
  localStorage.removeItem("user"); // Elimina el objeto de usuario completo
};

const authService = {
  loginReseller, // Exporta la función de login específica para revendedores
  logout,
  // Podrías añadir otras funciones de autenticación aquí si las necesitas
  // por ejemplo, register (si permites a los revendedores registrarse), etc.
};

export default authService;