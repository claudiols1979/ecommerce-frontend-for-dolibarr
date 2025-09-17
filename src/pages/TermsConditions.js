import React from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Helmet } from 'react-helmet-async';
import AuthBranding from '../components/common/AuthBranding';

const TermsAndConditionsPage = () => {
  const theme = useTheme();

  // Estilo para los acordeones que coincide con el tema de la Política de Privacidad
  const accordionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    color: 'black',
    boxShadow: 'none',
    border: '1px solid rgba(148, 145, 145, 1)',
    borderRadius: '8px !important',
    mb: 2,
    '&:before': {
      display: 'none',
    },
  };

  const accordionSummaryStyle = {
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
    },
    '& .MuiTypography-root': {
      fontWeight: 'bold',
      color: '#263C5C',
    },
    '& .MuiSvgIcon-root': {
      color: '#263C5C',
    },
  };

  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - Software Factory ERP</title>
        <meta name="description" content="Lee los términos y condiciones para el uso de la plataforma. Reglas sobre cuentas, pedidos, precios y envíos." />
      </Helmet>
      
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'white',
        py: { xs: 4, md: 8 },
        px: 2,
      }}>
        <Container maxWidth="md">
          <Paper sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 1)',
            boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.1)',
          }}>
            <AuthBranding />
            <Typography variant="h3" component="h1" sx={{ textAlign: 'center', mb: 2, fontWeight: 700, color: '#263C5C' }}>
              Términos y Condiciones
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 5, color: '#263C5C' }}>
              Última actualización: 02 de Julio, 2025
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, color: '#263C5C' }}>
              Bienvenido/a a Tienda en linea (demo). Al acceder y utilizar nuestra plataforma, usted acepta cumplir y estar sujeto/a a los siguientes términos y condiciones de uso. Por favor, léalos cuidadosamente.
            </Typography>

            <Accordion sx={accordionStyle} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>1. Aceptación de los Términos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  Al registrarse ó utilizar esta plataforma, usted confirma que ha leído, entendido y aceptado estar legalmente vinculado a estos Términos y Condiciones y a nuestra Política de Privacidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>2. Cuentas</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  - <strong>Elegibilidad:</strong> Para registrarse, debe proporcionar información veraz, precisa y completa. Nos reservamos el derecho de aprobar o rechazar cualquier solicitud de registro.
                  <br /><br />
                  - <strong>Seguridad de la Cuenta:</strong> Usted es el único responsable de mantener la confidencialidad de su contraseña y/o código de acceso. Cualquier actividad que ocurra bajo su cuenta es su responsabilidad.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>3. Proceso de Pedido y Precios</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  - <strong>Precios:</strong> Los precios mostrados en la plataforma son exclusivos y varían según la categoría asignada (`cat1`, `cat2`, etc.). El precio final es el que se muestra al momento de agregar los productos al carrito.
                  <br /><br />                 
                  - <strong>Confirmación:</strong> Un pedido se considera "colocado" únicamente después de que usted finalice el proceso de checkout y pago.
                </Typography>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>4. Política de Envío</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  - <strong>GAM (Gran Área Metropolitana):</strong> Para las provincias de San José, Alajuela, Cartago y Heredia, se aplicará un costo de envío fijo de ₡3,000 + iva, el cual se sumará al total de su orden.
                  <br /><br />
                  - <strong>Fuera de la GAM:</strong> Para las provincias de Guanacaste, Puntarenas y Limón, el envío se realizará mediante la modalidad de "pago contra entrega" a través de Correos de Costa Rica. El costo del envío no se incluirá en el total de la orden y deberá ser cancelado directamente al servicio de mensajería.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>5. Propiedad Intelectual</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  Todo el contenido presente en esta plataforma, incluyendo imágenes, textos, logos y diseño, es propiedad de Software Factory CR. Queda prohibida su reproducción, distribución o uso no autorizado sin nuestro consentimiento explícito por escrito.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={accordionStyle}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryStyle}>
                <Typography>6. Modificaciones a los Términos</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#263C5C' }}>
                  Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Cualquier cambio será efectivo inmediatamente después de su publicación en esta página. Es su responsabilidad revisar periódicamente estos términos para estar al tanto de las actualizaciones.
                </Typography>
              </AccordionDetails>
            </Accordion>

          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default TermsAndConditionsPage;