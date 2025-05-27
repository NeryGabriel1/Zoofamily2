const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./conexion');

//Multer configurado para guardar en uploads/imgcomunidad
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'imgcomunidad');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

//Enviar mensaje
router.post('/mensaje', upload.array('imagenes', 5), async (req, res) => {
  let { usuario_id, uid, texto, respuesta_a } = req.body;
  const files = req.files;

  try {
    if (!usuario_id && uid) {
      const [rows] = await db.query('SELECT id FROM usuarios WHERE uid = ?', [uid]);
      if (rows.length === 0) {
        return res.status(400).json({ ok: false, error: 'Usuario no encontrado por UID' });
      }
      usuario_id = rows[0].id;
    }

    if (!usuario_id) {
      return res.status(400).json({ ok: false, error: 'usuario_id es obligatorio' });
    }

    const [result] = await db.query(
      'INSERT INTO mensajes_comunidad (usuario_id, texto, respuesta_a) VALUES (?, ?, ?)',
      [usuario_id, texto, respuesta_a || null]
    );

    const mensajeId = result.insertId;

    // Guardar imágenes en la tabla
    if (files && files.length > 0) {
      const values = files.map(file => [mensajeId, `/uploads/imgcomunidad/${file.filename}`]);
      await db.query('INSERT INTO imagenes_comunidad (mensaje_id, url) VALUES ?', [values]);
    }

    res.json({ ok: true, mensaje_id: mensajeId });

    // Emitir nuevo mensaje por socket
    const [mensajeCompleto] = await db.query(`
      SELECT 
        m.*, u.nombre, u.username,
        CASE 
          WHEN u.foto_perfil IS NULL OR u.foto_perfil = '' OR u.foto_perfil LIKE '%miapp.com%' 
          THEN '/default_profile.png' 
          ELSE u.foto_perfil 
        END AS foto_perfil,
        (SELECT JSON_ARRAYAGG(url) FROM imagenes_comunidad WHERE mensaje_id = m.id) AS imagenes
      FROM mensajes_comunidad m
      JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.id = ?
    `, [mensajeId]);

    mensajeCompleto[0].imagenes = JSON.parse(mensajeCompleto[0].imagenes || '[]');

    const io = req.app.get('socketio');
    io.emit('nuevo_mensaje', mensajeCompleto[0]);
  } catch (err) {
    console.error('Error al guardar mensaje:', err);
    res.status(500).json({ ok: false, error: 'Error al guardar el mensaje' });
  }
});

//Obtener mensajes
router.get('/mensajes', async (req, res) => {
  try {
    const [mensajes] = await db.query(`
      SELECT 
        m.*, 
        u.nombre, 
        u.username,
        CASE 
          WHEN u.foto_perfil IS NULL OR u.foto_perfil = '' OR u.foto_perfil LIKE '%miapp.com%' 
          THEN '/default_profile.png' 
          ELSE u.foto_perfil 
        END AS foto_perfil,
        (SELECT JSON_ARRAYAGG(url) FROM imagenes_comunidad WHERE mensaje_id = m.id) AS imagenes,
        ru.nombre AS respuesta_usuario,
        rm.texto AS respuesta_texto
      FROM mensajes_comunidad m
      JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN mensajes_comunidad rm ON m.respuesta_a = rm.id
      LEFT JOIN usuarios ru ON rm.usuario_id = ru.id
      ORDER BY m.creado_en ASC
    `);

    const parsed = mensajes.map(msg => {
      let imagenes = [];
      try {
        imagenes = msg.imagenes ? JSON.parse(msg.imagenes) : [];
      } catch (err) {
        imagenes = msg.imagenes ? [msg.imagenes] : [];
      }

      return {
        ...msg,
        imagenes,
      };
    });

    res.json(parsed);
  } catch (err) {
    console.error('Error al obtener los mensajes:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener los mensajes' });
  }
});

module.exports = router;
