import React, { useState, useEffect } from 'react';
import { Box, styled, useTheme, Grid } from '@mui/material';

// Componente estilizado para el contenedor de la imagen principal
const MainImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  // CLAVE: Altura fija para el contenedor principal de la imagen en todos los tamaños de pantalla
  height: { xs: 280, sm: 350, md: 400 }, // Alturas específicas para controlar el tamaño
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease-in-out',
  mb: theme.spacing(2),
  bgcolor: theme.palette.grey[100], // Fondo claro detrás de la imagen
}));

// Estilo para la imagen principal
const StyledMainImage = styled('img')({
  // La imagen se ajustará al contenedor de tamaño fijo
  maxWidth: '50%', // Asegura que la imagen no exceda el ancho del contenedor
  maxHeight: '100%', // Asegura que la imagen no exceda la altura del contenedor
  objectFit: 'contain', // CLAVE: Escala la imagen para que encaje dentro del contenedor sin ser cortada.
                        // El espacio sobrante dentro del contenedor fixed-size será el bgcolor.
});

// Estilo para las miniaturas
const StyledThumbnail = styled(Box)(({ theme, isSelected }) => ({
  width: '80%', 
  // Altura fija para miniaturas
  height: { xs: 70, sm: 85 }, // Ligeramente ajustada la altura de las miniaturas
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  border: isSelected ? `1px solid ${theme.palette.primary.warning}` : `1px solid ${theme.palette.grey[300]}`,
  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
  opacity: isSelected ? 1 : 0.8,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    opacity: 1,
    boxShadow: theme.shadows[1],
  },
}));

// Estilo para la imagen dentro de la miniatura
const StyledThumbnailImage = styled('img')({
  width: '80%',
  height: '80%',
  objectFit: 'cover', // Las miniaturas sí llenan su espacio para una vista previa consistente
});

const ProductImageCarousel = ({ imageUrls = [], productName }) => {
  const theme = useTheme();
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
      {/* Columna de Miniaturas (izquierda en desktop, abajo en mobile) */}
      {imageUrls.length > 1 && (
        <Grid 
          container 
          direction={{ xs: 'row', md: 'column' }}
          spacing={1} 
          sx={{ 
            width: { xs: '80%', md: '80px' }, 
            flexShrink: 0,
            order: { xs: 2, md: 1 },
            justifyContent: { xs: 'center', md: 'flex-start' },
          }}
        >
          {imageUrls.map((img, index) => (
            <Grid item key={index} xs={3} sm={2} md={12}>
              <StyledThumbnail
                component="div"
                isSelected={index === selectedImageIndex}
                onClick={() => setSelectedImageIndex(index)}
              >
                <StyledThumbnailImage src={img.secure_url} alt={`Miniatura ${index + 1}`} />
              </StyledThumbnail>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Contenedor de la Imagen Principal (derecha en desktop, arriba en mobile) */}
      <MainImageContainer sx={{ order: { xs: 1, md: 2 }, flexGrow: 1 }}>
        <StyledMainImage 
          src={imageUrls[selectedImageIndex]?.secure_url || "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image"} 
          alt={productName} 
        />
      </MainImageContainer>
    </Box>
  );
};

export default ProductImageCarousel;