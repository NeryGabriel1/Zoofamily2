// src/server/informes.js
const express = require('express');
const router = express.Router();
const db = require('./conexion');

// Obtener informe médico y alergias por mascota_id
router.get('/informe/:mascota_id', async (req, res) => {
  const { mascota_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT informe, alergias FROM informes_mascotas WHERE mascota_id = ?',
      [mascota_id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({ informe: '', alergias: '' });
    }
  } catch (error) {
    console.error('Error al obtener informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear o actualizar informe médico y alergias
router.post('/informe', async (req, res) => {
  const { mascota_id, informe, alergias } = req.body;

  if (!mascota_id) {
    return res.status(400).json({ message: 'ID de mascota requerido' });
  }

  try {
    const [existe] = await db.query(
      'SELECT id FROM informes_mascotas WHERE mascota_id = ?',
      [mascota_id]
    );

    if (existe.length > 0) {
      await db.query(
        'UPDATE informes_mascotas SET informe = ?, alergias = ? WHERE mascota_id = ?',
        [informe, alergias, mascota_id]
      );
    } else {
      await db.query(
        'INSERT INTO informes_mascotas (mascota_id, informe, alergias) VALUES (?, ?, ?)',
        [mascota_id, informe, alergias]
      );
    }

    res.json({ message: 'Informe guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar informe:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener vacunas por mascota_id
router.get('/vacunas/:mascota_id', async (req, res) => {
  const { mascota_id } = req.params;

  try {
    const [vacunas] = await db.query(
      'SELECT nombre, fecha FROM vacunas WHERE mascota_id = ? ORDER BY fecha DESC',
      [mascota_id]
    );

    res.json(vacunas);
  } catch (error) {
    console.error('Error al obtener vacunas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Agregar vacuna
router.post('/vacunas', async (req, res) => {
  const { mascota_id, nombre, fecha } = req.body;

  if (!mascota_id || !nombre || !fecha) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    await db.query(
      'INSERT INTO vacunas (mascota_id, nombre, fecha) VALUES (?, ?, ?)',
      [mascota_id, nombre, fecha]
    );
    res.json({ message: 'Vacuna registrada' });
  } catch (error) {
    console.error('Error al registrar vacuna:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar vacuna
router.delete('/vacunas', async (req, res) => {
  const { mascota_id, nombre } = req.body;

  if (!mascota_id || !nombre) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    await db.query(
      'DELETE FROM vacunas WHERE mascota_id = ? AND nombre = ?',
      [mascota_id, nombre]
    );
    res.json({ message: 'Vacuna eliminada' });
  } catch (error) {
    console.error('Error al eliminar vacuna:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
