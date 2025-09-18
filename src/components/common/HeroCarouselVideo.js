import React from 'react';
import { Box, Typography, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Componente estilizado para el contenedor del slide (se mantiene sin cambios)
const CarouselSlideContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  color: theme.palette.common.white,
  background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))', // Overlay oscuro
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
    alignItems: 'flex-start',
    textAlign: 'left',
    left: '10%',
    right: 'unset',
    width: '80%',
  },
}));

const HeroCarousel = () => {
  const navigate = useNavigate();
  
  // --- CORRECCIÓN CLAVE 1: Se usa la URL directa al archivo .mp4 ---
  // Esto nos permite usar la etiqueta <video> y tener control total sobre el estilo.
  const videoURL = "https://rr4---sn-q4flrnsd.googlevideo.com/videoplayback?expire=1758178102&ei=1lbLaMGIMavKpt8PqbW82Qs&ip=2001%3Aee0%3A4ea2%3A50f0%3A5c59%3A69f1%3Af048%3Aa5cd&id=o-AEOZrGEVRoiliM-3kf5MSdOqUQetX43aoXMQftm2ZfOh&itag=137&aitags=134%2C136%2C137%2C160%2C243&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=ATw7iSWz-iwH4c4bezgw8vY4BGyn9o8PZoeiKj73smokFTUHaegLMCGBN6KmQIRiczs3U8K6QQYs9NrD&vprv=1&svpuc=1&mime=video%2Fmp4&ns=bg9arOBqgpg4Wdp661v2SLcQ&rqh=1&gir=yes&clen=2013605&dur=5.000&lmt=1699437470448096&keepalive=yes&lmw=1&fexp=24350590,24350737,24350827,24351316,24351318,24351528,24352001,24352156,24352540,24352568,24352573,24352805,24352807,24352961,24352981,24352983,24352989,24352991,24353009,24353011,24353056,24353058,24353151,24353168,24353170,51557447,51565115,51565681,51580970,51583705&c=TVHTML5&sefc=1&txp=2219224&n=ZMqKzL02Fzr2BQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhALG613b7jww1ew9MusJ_cywHwnzCNdvc5AKNUUnvjyT5AiAfnYDkgVGsEmLMAN8L5rOUc3J2MUMwVfewqAhQGMxXFA%3D%3D&rm=sn-8qj-2m0z7e&rrc=79,80&req_id=d6f6d136c3c1a3ee&cmsv=e&redirect_counter=2&cm2rm=sn-npo6y7z&cms_redirect=yes&met=1758156532,&mh=Lg&mip=201.191.218.148&mm=34&mn=sn-q4flrnsd&ms=ltu&mt=1758156061&mv=m&mvi=4&pl=24&rms=ltu,au&lsparams=met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRgIhAKBQwrUPCYXkMngdVZt4yie72zplnrNXGLN857TWtQHlAiEAuyRb6_kUCYek-L1-vFTmwPR1kpMI0aa0ADkSWnjU6pM%3D"
  //const videoURL = 'https://res.cloudinary.com/dl4k0gqfv/video/upload/Mother_s_Day_Perfume_Ad_Request_moc2w1.mp4';

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: { xs: 300, sm: 400, md: 550 },
      mb: 4,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 3,
      backgroundColor: 'black',
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        // --- CORRECCIÓN CLAVE 2: Estilos para que el video cubra el contenedor ---
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%', // El video siempre ocupará el 100% del ancho
          height: 'auto', // La altura se ajustará para mantener la proporción
          transform: 'translate(-50%, -50%)', // Centra el video
          zIndex: 1,
        }}
      >
        <source src={videoURL} type="video/mp4" />
        Tu navegador no soporta la etiqueta de video.
      </video>
      
      <CarouselSlideContent sx={{ zIndex: 2 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' } }}>
          Las mejores ofertas
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: { xs: '90%', md: '50%' }, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
          Busca las etiquetas con 50% de descuento.
        </Typography>
        <Button
          variant="contained"         
          size="large"
          onClick={() => navigate('/products')}
          sx={{ 
            px: { xs: 4, sm: 6 }, 
            py: { xs: 1.5, sm: 2 }, 
            borderRadius: 8,
            fontWeight: 'bold',
            backgroundColor: '#bb4343ff',
            '&:hover': { backgroundColor: '#ff0000ff' },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          Explorar Colección
        </Button>
      </CarouselSlideContent>
    </Box>
  );
};

export default HeroCarousel;
