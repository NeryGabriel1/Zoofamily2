// src/server/mascotas.js 
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./conexion');

const router = express.Router();

// Configuración de multer para guardar en /uploads/mascotas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/mascotas');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Ruta de prueba
router.get('/prueba', (req, res) => {
  res.send('Ruta /api/mascotas funcionando');
});

// Obtener mascotas por usuario
router.get('/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM mascotas WHERE usuario_id = ?', [usuarioId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
});

// Crear mascota
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { usuario_id, nombre, raza, tipo, anio_nacimiento } = req.body;
    const foto_url = req.file ? `/uploads/mascotas/${req.file.filename}` : null;

    await db.query(
      'INSERT INTO mascotas (usuario_id, nombre, raza, tipo, anio_nacimiento, foto_url) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, nombre, raza, tipo, anio_nacimiento, foto_url]
    );
    res.json({ message: 'Mascota agregada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar mascota' });
  }
});

// Actualizar mascota
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nombre, raza, tipo, anio_nacimiento } = req.body;
  try {
    if (req.file) {
      const foto_url = `/uploads/mascotas/${req.file.filename}`;
      await db.query(
        'UPDATE mascotas SET nombre=?, raza=?, tipo=?, anio_nacimiento=?, foto_url=? WHERE id=?',
        [nombre, raza, tipo, anio_nacimiento, foto_url, id]
      );
    } else {
      await db.query(
        'UPDATE mascotas SET nombre=?, raza=?, tipo=?, anio_nacimiento=? WHERE id=?',
        [nombre, raza, tipo, anio_nacimiento, id]
      );
    }
    res.json({ message: 'Mascota actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

// Eliminar mascota
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT foto_url FROM mascotas WHERE id = ?', [id]);
    const fotoPath = rows[0]?.foto_url ? path.join(process.cwd(), rows[0].foto_url) : null;

    if (fotoPath && fs.existsSync(fotoPath)) {
      fs.unlinkSync(fotoPath);
    }

    await db.query('DELETE FROM mascotas WHERE id = ?', [id]);
    res.json({ message: 'Mascota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

// Obtener estadísticas del usuario
router.get('/estadisticas/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [totalMascotas] = await db.query(
      'SELECT COUNT(*) AS total FROM mascotas WHERE usuario_id = ?',
      [userId]
    );

    const [totalEspecies] = await db.query(
      'SELECT COUNT(DISTINCT tipo) AS especies FROM mascotas WHERE usuario_id = ?',
      [userId]
    );

    const [fechaRegistro] = await db.query(
      'SELECT creado_en FROM usuarios WHERE id = ?',
      [userId]
    );

    res.json({
      totalMascotas: totalMascotas[0].total,
      especies: totalEspecies[0].especies,
      fechaRegistro: fechaRegistro[0]?.creado_en || null,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
