// utils/taxCalculations.js
export const getTaxRate = (ivaValue) => {
    if (!ivaValue) return 13; // Valor por defecto (13%)
    
    // Convertir a número (manejar tanto "13.0000%" como "13")
    const numericValue = parseFloat(ivaValue.toString().replace('%', ''));
    
    // Si no es un número válido, usar el valor por defecto
    if (isNaN(numericValue)) return 13;
    
    return numericValue;
};

export const calculatePriceWithTax = (price, ivaValue) => {
    const taxRate = getTaxRate(ivaValue);
    return price * (1 + taxRate / 100);
};

export const calculateTaxAmount = (price, ivaValue) => {
    const taxRate = getTaxRate(ivaValue);
    return price * (taxRate / 100);
};

export const formatPriceWithTax = (price, ivaValue) => {
    const total = calculatePriceWithTax(price, ivaValue);
    return `₡${total.toFixed(2)}`;
};