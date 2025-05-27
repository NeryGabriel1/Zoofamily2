// src/server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar las rutas
const usuariosRouter = require('./usuarios');
const eventosRoutes = require('./eventos');
const comunidadRoutes = require('./comunidad');
const mascotasRoutes = require('./mascotas');
const notificacionesRoutes = require('./notificaciones');
const informesRouter = require("./informes")

const cron = require('node-cron');
const crearNotificacionesEventos = require('../server/Cron/notificacionesEventos'); 

// Ejecutar todos los días a las 00:00
cron.schedule('0 0 * * *', () => {
    console.log('Ejecutando cron de notificaciones...');
    crearNotificacionesEventos();
});

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); // Solo soporta JSON puro

// Middleware de LOG para ver cabeceras y body en cada petición
app.use((req, res, next) => {
  console.log('Nueva petición:');
  console.log('Método:', req.method);
  console.log('Ruta:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Middleware para asegurar que el Content-Type sea application/json en POST/PUT
// Middleware para aceptar application/json Y multipart/form-data
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (
      contentType.includes('application/json') ||
      contentType.startsWith('multipart/form-data')
    ) {
      next();
    } else {
      console.warn('La petición NO tiene Content-Type JSON o multipart/form-data');
      return res.status(400).json({ error: 'El Content-Type debe ser JSON o multipart/form-data' });
    }
  } else {
    next();
  }
});

// Servir la carpeta /uploads para imágenes estáticas
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rutas API
app.use('/api/usuarios', usuariosRouter);
app.use('/api/eventos', eventosRoutes);
app.use('/api/comunidad', comunidadRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/fotos_mascotas', express.static('fotos_mascotas')); // Para acceder a las imágenes
app.use('/api/informes', informesRouter);

// -------------------------
// Servir React (Vite build)
// -------------------------
const distPath = path.join(process.cwd(), 'dist');

// Servir archivos estáticos de React
app.use(express.static(distPath));

// SPA fallback: SOLO cuando la ruta NO empieza por /api o /uploads
app.get(/^\/(?!api|uploads).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// -------------------------

// Ruta de prueba de la API (opcional)
app.get('/api', (req, res) => {
  res.send('API funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
