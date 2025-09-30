import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; 

// Crear el contexto
const HeroCarouselVideoContext = createContext();

// Hook personalizado para usar el contexto
export const useHeroCarouselVideo = () => {
  const context = useContext(HeroCarouselVideoContext);
  if (!context) {
    throw new Error('useHeroCarouselVideo debe ser usado dentro de un HeroCarouselVideoProvider');
  }
  return context;
};

// Proveedor del contexto
export const HeroCarouselVideoProvider = ({ children }) => {
  const { api, isAuthenticated } = useAuth(); 
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Video por defecto
  const defaultVideo = {
    video: 'https://res.cloudinary.com/dl4k0gqfv/video/upload/v1758212825/video_promocion_erp_ecommerce_pifbth.mp4',
    title: 'Tu estilo, a un clic de distancia.',
    subtitle: 'Las mejores marcas. El mejor precio. Todo para ti.',
    buttonText: 'Explorar Productos',
    buttonLink: '/products',
  };

  // Fetch video from backend - RUTA PÚBLICA
  const fetchVideo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Para rutas públicas, usar axios directamente sin auth
      const response = await api.get('/api/hero-carousel-video/public');
      
      // Si hay video activo en la base de datos, usarlo; si no, usar el por defecto
      if (response.data && response.data.video) {
        setVideoData(response.data);
      } else {
        setVideoData(defaultVideo);
      }
    } catch (err) {
      console.error('Error al obtener el video:', err);
      // En caso de error, mostrar video por defecto
      setVideoData(defaultVideo);
      setError('Error al cargar el video. Mostrando video por defecto.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch video cuando el componente se monta
  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  // Función para recargar el video
  const refetchVideo = useCallback(() => {
    fetchVideo();
  }, [fetchVideo]);

  const value = {
    // Estado
    videoData,
    loading,
    error,
    
    // Funciones públicas (para ecommerce frontend)
    refetchVideo,
    
    // Video por defecto
    defaultVideo,
  };

  return (
    <HeroCarouselVideoContext.Provider value={value}>
      {children}
    </HeroCarouselVideoContext.Provider>
  );
};