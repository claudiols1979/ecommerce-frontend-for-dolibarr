// src/utils/formatters.js

/**
 * Formatea un número como un precio en colones costarricenses (CRC).
 * Ejemplo: 23000 se convierte en "₡23.000"
 * @param {number} price - El precio a formatear.
 * @returns {string} El precio formateado como un string.
 */
export const formatPrice = (price) => {
  // Si el precio no es un número válido, retorna un texto por defecto.
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Precio no disponible';
  }

  // Redondea el número para eliminar los decimales.
  const roundedPrice = Math.ceil(price / 100) * 100;
  
  // Convierte a string y usa una expresión regular para añadir los puntos como separadores de miles.
  const formattedString = roundedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Añade el símbolo de colón al principio.
  return `₡${formattedString}`;
};