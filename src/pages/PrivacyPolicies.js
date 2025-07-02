import React from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Helmet } from 'react-helmet-async';
import AuthBranding from '../components/common/AuthBranding'; // Reutilizamos el componente de branding

const PrivacyPolicyPage = () => {
  const theme = useTheme();

  // Estilo para los acordeones que coincide con el tema de lujo
  const accordionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    boxShadow: 'none',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    borderRadius: '8px !important', // !important para asegurar que sobreescriba el default
    mb: 2,
    '&:before': {
      display: 'none', // Elimina la línea divisoria por defecto de MUI
    },
  };

  const accordionSummaryStyle = {
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
    },
    '& .MuiTypography-root': {
      fontWeight: 'bold',
      color: '#FFD700', // Dorado para los títulos
    },
    '& .MuiSvgIcon-root': {
      color: '#FFD700', // Dorado para el icono de expandir
    },
  };

  return (
    <>
      <Helmet>
        <title>Política de Privacidad - Look & Smell</title>
        <meta name="description" content="Conoce cómo Look & Smell protege y gestiona tus datos personales. Nuestra política de privacidad para revendedores en Costa Rica." />
      </Helmet>
      
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #121212 30%, #282828 90%)',
        py: { xs: 4, md: 8 },
        px: 2,
      }}>
        <Container maxWidth="md">
          <Paper sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.5)',
          }}>
            <AuthBranding />
            <Typography variant="h3" component="h1" sx={{ textAlign: 'center', mb: 2, fontWeight: 700, color: 'white' }}>
              Política de Privacidad
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
              Última actualización: 02 de Julio, 2025
            </Typography>

            {/* Sección de Introducción */}
            <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.9)' }}>
              En Look & Smell, valoramos y respetamos tu privacidad. Esta política detalla cómo recopilamos, usamos, protegemos y gestionamos tu información personal cuando utilizas nuestra plataforma. Tu confianza es nuestro activo más importante.
            </Typography>

            {/* Acordeones para cada sección de la política */}
            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>1. Información que Recopilamos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Recopilamos información que nos proporcionas directamente para poder ofrecerte nuestros servicios de manera efectiva:
                  <br /><br />
                  - <strong>Datos de Registro:</strong> Nombre, apellido, correo electrónico, número de teléfono y dirección física.
                  <br />
                  - <strong>Datos de Transacción:</strong> Detalles de los productos que agregas a tu carrito y los pedidos que realizas, incluyendo precios y cantidades.
                  <br />
                  - <strong>Información de Autenticación:</strong> Contraseña encriptada y/o código de revendedor para asegurar el acceso a tu cuenta.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>2. Cómo Usamos tu Información</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Utilizamos tu información exclusivamente para los siguientes propósitos:
                  <br /><br />
                  - <strong>Procesar tus Pedidos:</strong> Para gestionar tu carrito de compras, finalizar tus pedidos y coordinar la logística de entrega.
                  <br />
                  - <strong>Comunicación:</strong> Para contactarte sobre tus pedidos, ofrecerte soporte y notificarte sobre novedades o promociones relevantes para nuestra red de revendedores.
                  <br />
                  - <strong>Personalización:</strong> Para aplicar los precios correctos según tu categoría de revendedor y mejorar tu experiencia en nuestra plataforma.
                  <br />
                  - <strong>Seguridad:</strong> Para proteger tu cuenta y prevenir fraudes.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>3. Cómo Compartimos tu Información</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Tu privacidad es primordial. **No vendemos ni alquilamos tu información personal a terceros.** Solo compartimos tu información en las siguientes circunstancias:
                  <br /><br />
                  - <strong>Proveedores de Servicios:</strong> Con empresas de logística (ej. Correos de Costa Rica) para la entrega de tus pedidos. Solo se comparte la información estrictamente necesaria para el envío.
                  <br />
                  - <strong>Cumplimiento Legal:</strong> Si es requerido por una autoridad legal competente en Costa Rica.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>4. Seguridad de tus Datos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información. Tus contraseñas se almacenan de forma encriptada (hashed) y el acceso a los datos está restringido.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>5. Tus Derechos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Tienes derecho a acceder, corregir o eliminar tu información personal. Puedes gestionar la mayoría de tus datos directamente desde la sección "Mi Cuenta" o contactarnos para solicitar asistencia.
                </Typography>
              </AccordionDetails>
            </Accordion>

          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPolicyPage;