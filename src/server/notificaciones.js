const express = require('express');
const router = express.Router();
const db = require('../server/conexion');

// Obtener notificaciones por usuario
router.get('/:usuario_uid', async (req, res) => {
    const { usuario_uid } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT n.id, n.mensaje, n.fecha_creada, n.leida, n.evento_id, e.titulo AS evento_titulo
             FROM notificaciones n
             LEFT JOIN eventos e ON n.evento_id = e.id
             WHERE n.usuario_uid = ?
             ORDER BY n.fecha_creada DESC`,
            [usuario_uid]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener notificaciones:', err);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

// Crear una nueva notificación
router.post('/', async (req, res) => {
    const { usuario_uid, evento_id, mensaje } = req.body;
    if (!usuario_uid || !mensaje) {
        return res.status(400).json({ error: 'Faltan datos' });
    }
    try {
        const [result] = await db.execute(
            `INSERT INTO notificaciones (usuario_uid, evento_id, mensaje)
             VALUES (?, ?, ?)`,
            [usuario_uid, evento_id || null, mensaje]
        );
        res.status(201).json({ message: 'Notificación creada', id: result.insertId });
    } catch (err) {
        console.error('Error al crear notificación:', err);
        res.status(500).json({ error: 'Error al crear notificación' });
    }
});

module.exports = router;
