import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button, Fade, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDepartmental } from '../../contexts/DepartmentalContext';

// Componentes styled correctamente definidos
const PictureGridContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: theme.spacing(6, 0),
  padding: theme.spacing(0, 2),
  boxSizing: 'border-box',
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '12px',
  height: '100%',
  minHeight: '300px',
  cursor: 'pointer',
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  aspectRatio: '1 / 1', // Fuerza relación de aspecto cuadrada
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .image-overlay': {
      opacity: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    '& img': {
      transform: 'scale(1.05)',
    }
  },
  [theme.breakpoints.down('md')]: {
    minHeight: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '200px',
  },
}));

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s ease',
});

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  opacity: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  transition: 'opacity 0.3s ease, background-color 0.3s ease',
  color: 'white',
  textAlign: 'center',
}));

const ShopButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    transform: 'translateY(-2px)',
  },
  transition: 'transform 0.2s ease',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  fontWeight: '700',
  position: 'relative',
  '&:after': {
    content: '""',
    display: 'block',
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.primary.main,
    margin: `${theme.spacing(2)} auto 0`,
    borderRadius: '2px',
  },
}));

// Función para procesar URLs de Cloudinary
const processCloudinaryUrl = (url) => {
  if (url.includes('cloudinary.com')) {
    // Añadir parámetros de transformación para forzar tamaño y recorte consistentes
    const baseUrl = url.split('?')[0];  // Eliminar parámetros existentes si los hay
    return `${baseUrl}?w=600&h=600&c=fill&f=auto`;
  }
  return url;
};

const PictureGrid = ({ 
  images = [], 
  seasonTitles = [],
  onImageClick 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loadedImages, setLoadedImages] = useState({});
  const { fetchDepartmentalProducts } = useDepartmental();
  const navigate = useNavigate();
  
  const defaultImages = [
    {
      url: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1754589040/syed-muhammad-baqir-zaidi-3qNVEa7SN_8-unsplash_jrfvpr.jpg',
      department: 'Fragancias',      
      title: 'Fragancias'
    },
    {
      url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      department: 'Ropa',
      title: 'Ropa'
    },
    {
      url: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758213291/cut-collective-u94ywFnPedw-unsplash_z02shc.jpg',
      department: 'Calzado',
      title: 'Calzado'
    },
    {
      url: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758178128/christopher-gower-_aXa21cf7rY-unsplash_wao9x2.jpg',
      department: 'Electrónicos',
      title: 'Electrónicos'
    },
     {
      url: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758478320/air_conditioner_zers0j.jpg',
      department: 'Aires Acondicionados',
      title: 'Aires Acondicionados'
    },
     {
      url: 'https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758217151/catia-dombaxe-8IlqMcDYKA8-unsplash_jimlbl.jpg',
      department: 'Accesorios',
      title: 'Accesorios'
    }
  ];
  
  // Procesamos todas las URLs para asegurar consistencia
  const imageData = images.length === 4 
    ? images.map((url, index) => ({ 
        url: processCloudinaryUrl(url), 
        ...defaultImages[index]
      }))
    : defaultImages.map(img => ({
        ...img,
        url: processCloudinaryUrl(img.url)
      }));
  
  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  const handleViewProducts = (department) => {
    navigate('/products');
    
    setTimeout(() => {
      fetchDepartmentalProducts(
        { department: department },
        1,
        20
      );
    }, 100);
  };

  return (
    <Fragment>
      <SectionTitle variant="h4" component="h4">
        Departamentos
      </SectionTitle>
      <PictureGridContainer>    
        <Grid container spacing={3} sx={{ 
          maxWidth: '1200px', 
          width: '100%',
          margin: '0 auto',
          justifyContent: 'center',
        }}>
          {imageData.map((imageData, index) => (
            <Grid item xs={12} sm={6} key={index} 
              sx={{ 
                height: { xs: '250px', sm: '300px', md: '350px' },
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Fade in={loadedImages[index]} timeout={800}>
                <ImageContainer>
                  <StyledImage
                    src={imageData.url}
                    alt={imageData.title || seasonTitles[index] || `Oferta ${index + 1}`}
                    onLoad={() => handleImageLoad(index)}
                    onClick={() => handleViewProducts(imageData.department)}
                  />  
                  <Overlay 
                    sx={{ 
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                        mb: 2
                      }}
                    >
                      {imageData.title}
                    </Typography>  
                    <ShopButton 
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProducts(imageData.department);
                      }}
                    >
                      Comprar
                    </ShopButton>
                  </Overlay>                           
                </ImageContainer>                
              </Fade>              
            </Grid>
          ))}
        </Grid>
      </PictureGridContainer>
    </Fragment>
  );
};

export default PictureGrid;