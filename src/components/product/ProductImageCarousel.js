import React, { useState, useEffect } from 'react';
// ✅ 1. Se importa useMediaQuery para detectar el tamaño de la pantalla
import { Box, styled, useTheme, Grid, useMediaQuery } from '@mui/material';

// --- Contenedor Principal (SIN CAMBIOS) ---
const MainImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px', 
  height: { xs: 280, sm: 350, md: 400 }, 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease-in-out',
  mb: theme.spacing(2),
  bgcolor: theme.palette.grey[100],
}));

// --- Imagen Principal (SIN CAMBIOS) ---
const StyledMainImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain', 
});


// --- ESTILOS DE MINIATURAS (CORREGIDOS) ---

const StyledThumbnail = styled(Box)(({ theme, isSelected }) => ({
  // ✅ El ancho ahora es 100% para que el Grid lo controle en la vista de escritorio.
  // En móvil, se sobreescribe con un tamaño fijo usando la prop `sx`.
  width: '100%', 
  height: { xs: 70, sm: 85 },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  border: isSelected ? `2.px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[300]}`,
  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
  opacity: isSelected ? 1 : 0.8,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    opacity: 1,
    boxShadow: theme.shadows[1],
  },
}));

const StyledThumbnailImage = styled('img')({
  // ✅ La imagen ahora llena el contenedor de la miniatura.
  width: '100%',
  height: '100%',
  // ✅ Se usa 'contain' para asegurar que toda la imagen sea visible.
  objectFit: 'contain',
});


// --- COMPONENTE PRINCIPAL (CON LÓGICA DE LAYOUT CONDICIONAL) ---

const ProductImageCarousel = ({ imageUrls = [], productName }) => {
  const theme = useTheme();
  // ✅ 2. Se detecta si la pantalla es mediana o más grande
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (imageUrls.length > 0 && selectedImageIndex >= imageUrls.length) {
      setSelectedImageIndex(0);
    } else if (imageUrls.length === 0) {
      setSelectedImageIndex(0);
    }
  }, [imageUrls, selectedImageIndex]);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <MainImageContainer>
        <StyledMainImage src="https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image" alt="No disponible" />
      </MainImageContainer>
    );
  }

  // Función para renderizar las miniaturas y evitar duplicar código
  const renderThumbnails = (isMobile = false) => imageUrls.map((img, index) => (
    <Grid item key={index}>
      <StyledThumbnail
        component="div"
        isSelected={index === selectedImageIndex}
        onClick={() => setSelectedImageIndex(index)}
        // ✅ Se aplica un tamaño fijo y cuadrado solo en la vista móvil
        sx={isMobile ? { width: 70, height: 70, flexShrink: 0 } : {}}
      >
        <StyledThumbnailImage src={img.secure_url} alt={`Miniatura ${index + 1}`} />
      </StyledThumbnail>
    </Grid>
  ));

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 4, 
      boxShadow: theme.shadows[2], 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: theme.spacing(2),
      alignItems: 'flex-start',
    }}>
      {/* Columna de Miniaturas (Renderizado Condicional) */}
      {imageUrls.length > 1 && (
        isLargeScreen ? (
          // --- LAYOUT PARA PANTALLAS GRANDES (Tu Grid Original) ---
          <Grid 
            container 
            direction="column"
            spacing={1} 
            sx={{ 
              width: '80px', 
              flexShrink: 0,
              order: { xs: 2, md: 1 },
            }}
          >
            {renderThumbnails(false)}
          </Grid>
        ) : (
          // --- LAYOUT PARA PANTALLAS PEQUEÑAS (Fila con Scroll) ---
          <Box sx={{ width: '100%', order: 2, overflowX: 'auto' }}>
            <Grid container direction="row" spacing={1} wrap="nowrap">
              {renderThumbnails(true)}
            </Grid>
          </Box>
        )
      )}

      {/* Contenedor de la Imagen Principal (SIN CAMBIOS) */}
      <MainImageContainer sx={{ order: { xs: 1, md: 2 }, flexGrow: 1, alignSelf: 'center' }}>
        <StyledMainImage 
          src={imageUrls[selectedImageIndex]?.secure_url || "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image"} 
          alt={productName} 
        />
      </MainImageContainer>
    </Box>
  );
};

export default ProductImageCarousel;