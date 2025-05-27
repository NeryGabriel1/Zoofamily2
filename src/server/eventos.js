const express = require('express');
const router = express.Router();
const db = require('../server/conexion');

// Formateo de fecha a formato MySQL
function toMySQLDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
        console.error('Fecha inválida:', dateString);
        return null;
    }
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const adjusted = new Date(date.getTime() - offsetMs);
    return adjusted.toISOString().slice(0, 19).replace('T', ' ');
}

// Obtener eventos por usuario
router.get('/:usuario_uid', async (req, res) => {
    const { usuario_uid } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT id, titulo, descripcion, ubicacion, fecha_inicio, fecha_fin
             FROM eventos
             WHERE usuario_uid = ?`,
            [usuario_uid]
        );

        const mappedRows = rows.map(evt => ({
            id: evt.id,
            title: evt.titulo,
            description: evt.descripcion,
            location: evt.ubicacion,
            start: evt.fecha_inicio ? new Date(evt.fecha_inicio).toISOString() : null,
            end: evt.fecha_fin ? new Date(evt.fecha_fin).toISOString() : null
        }));

        res.json(mappedRows);
    } catch (err) {
        console.error('Error al obtener eventos:', err);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Crear evento + notificación
router.post('/', async (req, res) => {
    const { usuario_uid, titulo, descripcion, ubicacion, fecha_inicio, fecha_fin } = req.body;

    if (!titulo || !fecha_inicio || !fecha_fin || !usuario_uid) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        const fechaInicioMySQL = toMySQLDate(fecha_inicio);
        const fechaFinMySQL = toMySQLDate(fecha_fin);

        if (!fechaInicioMySQL || !fechaFinMySQL) {
            return res.status(400).json({ error: 'Fechas inválidas' });
        }

        const [result] = await db.execute(
            `INSERT INTO eventos 
             (usuario_uid, titulo, descripcion, ubicacion, fecha_inicio, fecha_fin, creado_en)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [usuario_uid, titulo, descripcion || '', ubicacion || '', fechaInicioMySQL, fechaFinMySQL]
        );

        const eventoId = result.insertId;
        const horaEvento = new Date(fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const mensaje = `Nuevo evento creado: "${titulo}" a las ${horaEvento}`;

        const [existeNoti] = await db.execute(
            `SELECT id FROM notificaciones WHERE usuario_uid = ? AND evento_id = ?`,
            [usuario_uid, eventoId]
        );

        if (existeNoti.length === 0) {
            await db.execute(
                `INSERT INTO notificaciones (usuario_uid, evento_id, mensaje)
                 VALUES (?, ?, ?)`,
                [usuario_uid, eventoId, mensaje]
            );
        }

        res.status(201).json({ message: 'Evento y notificación creados', id: eventoId });
    } catch (err) {
        console.error('Error al crear evento:', err);
        res.status(500).json({ error: 'Error al crear evento', details: err.message });
    }
});

// Actualizar evento + notificación
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario_uid, titulo, descripcion, ubicacion, fecha_inicio, fecha_fin } = req.body;

    if (!titulo || !fecha_inicio || !fecha_fin || !usuario_uid) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    try {
        const fechaInicioMySQL = toMySQLDate(fecha_inicio);
        const fechaFinMySQL = toMySQLDate(fecha_fin);

        if (!fechaInicioMySQL || !fechaFinMySQL) {
            return res.status(400).json({ error: 'Fechas inválidas' });
        }

        await db.execute(
            `UPDATE eventos
             SET usuario_uid = ?, titulo = ?, descripcion = ?, ubicacion = ?, fecha_inicio = ?, fecha_fin = ?
             WHERE id = ?`,
            [usuario_uid, titulo, descripcion || '', ubicacion || '', fechaInicioMySQL, fechaFinMySQL, id]
        );

        const horaNueva = new Date(fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const mensaje = `📝 El evento "${titulo}" ha sido modificado. Nueva hora: ${horaNueva}`;

        await db.execute(
            `INSERT INTO notificaciones (usuario_uid, evento_id, mensaje)
             VALUES (?, ?, ?)`,
            [usuario_uid, id, mensaje]
        );

        res.json({ message: 'Evento actualizado y notificación creada' });
    } catch (err) {
        console.error('Error al actualizar evento:', err);
        res.status(500).json({ error: 'Error al actualizar evento', details: err.message });
    }
});

// Eliminar evento + notificación
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [eventoInfo] = await db.execute(
            `SELECT titulo, usuario_uid FROM eventos WHERE id = ?`,
            [id]
        );

        if (eventoInfo.length > 0) {
            const { titulo, usuario_uid } = eventoInfo[0];
            const mensaje = `El evento "${titulo}" ha sido cancelado.`;

            await db.execute(
                `INSERT INTO notificaciones (usuario_uid, evento_id, mensaje)
                 VALUES (?, ?, ?)`,
                [usuario_uid, id, mensaje]
            );
        }

        await db.execute('DELETE FROM eventos WHERE id = ?', [id]);

        res.json({ message: 'Evento eliminado y notificación generada' });
    } catch (err) {
        console.error('Error al eliminar evento:', err);
        res.status(500).json({ error: 'Error al eliminar evento', details: err.message });
    }
});

// Obtener un solo evento por su ID
router.get('/detalle/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT id, titulo, descripcion, ubicacion, fecha_inicio, fecha_fin
             FROM eventos
             WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error al obtener evento:', err);
        res.status(500).json({ error: 'Error al obtener evento' });
    }
});

module.exports = router;
