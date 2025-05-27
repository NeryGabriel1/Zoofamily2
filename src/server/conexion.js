// src/server/conexion.js

// Cargar las variables de entorno desde .env ANTES de todo
require('dotenv').config();

const mysql = require('mysql2/promise');

//  Depuración: muestra las variables de conexión cargadas (útil en desarrollo)
console.log("🧪 DB ENV VALUES:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Creamos un pool de conexiones para manejar múltiples conexiones de forma eficiente
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Zoofamily',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Puedes ajustar según tus necesidades
  queueLimit: 0,
});

// Exportamos el pool para usar en cualquier parte del servidor
module.exports = db;
