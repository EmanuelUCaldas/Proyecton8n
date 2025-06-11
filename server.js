const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { registrarEnZoom } = require('./zoom-bot'); // archivo separado
const { descargarUsuarios } = require('./userDown'); // archivo separado
const { chromium } = require('playwright'); // Necesario para lanzar navegador
const { descargarAsistentes } = require('./descargarAsistentes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Endpoint para registrar inasistentes
app.post('/registrar-inasistentes', async (req, res) => {
  const { inasistentes, url_zoom } = req.body;

  if (!inasistentes || !Array.isArray(inasistentes)) {
    return res.status(400).json({ error: '❗ Se espera un array llamado "inasistentes".' });
  }

  // Tomar solo los primeros 5 (ajustado para pruebas)
  const usuariosProcesar = inasistentes.slice(5, 10);
  console.log(`🟣 Procesando ${usuariosProcesar.length} usuarios...`);

  try {
    const navegador = await chromium.launch({ headless: false, slowMo: 50 });

    for (const usuario of usuariosProcesar) {
      const nombreCompleto = usuario.nombre_completo?.trim();

      if (!nombreCompleto) {
        console.log('⚠️ Nombre vacío. Usuario omitido.');
        continue;
      }

      try {
        const contextoIndividual = await navegador.newContext(); // ✔️ Contexto aislado por usuario
        await registrarEnZoom(nombreCompleto, url_zoom, contextoIndividual);
        await contextoIndividual.close(); // Cierra solo esa "ventana"
        console.log(`✅ Usuario procesado: ${nombreCompleto}`);
      } catch (errorUsuario) {
        console.error(`❌ Error procesando a ${nombreCompleto}:`, errorUsuario.message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeña pausa entre usuarios
    }

    await navegador.close();
    res.json({ mensaje: `✅ Se procesaron ${usuariosProcesar.length} usuarios.` });
  } catch (error) {
    console.error('❌ Error general al procesar usuarios:', error);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

// Puerto de escucha
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en http://27.171.8.14:${PORT}/`);
});

// 📥 Endpoint /descargar para obtener Excel de los campistas registrados
app.post('/descargar', async (req, res) => {
  const { usuario, contrasena, url } = req.body;

  if (!usuario || !contrasena || !url) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const ruta = await descargarUsuarios({ usuario, contrasena, url });

    if (!fs.existsSync(ruta)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.download(ruta, 'descarga_usuarios.xlsx');
  } catch (error) {
    console.error('❌ Error al generar el archivo:', error);
    res.status(500).json({ error: 'Error interno al generar el archivo' });
  }
});

//Endpoint descargar asistentes reales de la sesión en zoom
app.post('/descargar-asistentes', async (req, res) => {
  const { usuario, contrasena, reunion_id } = req.body;

  if (!usuario || !contrasena || !reunion_id) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  try {
    const resultado = await descargarAsistentes({
      usuario,
      contrasena,
      reunionId: reunion_id
    });

    res.download(resultado);
  } catch (error) {
    console.error('❌ Error al ejecutar descarga:', error);
    res.status(500).json({ error: '❌ Falló la descarga de asistentes.', detalles: error.message });
  }
});

	module.exports = { descargarAsistentes };
