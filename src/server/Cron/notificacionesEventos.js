const db = require('../conexion');

async function crearNotificacionesEventos() {
    try {
        const [rows] = await db.execute(
            `SELECT id, usuario_uid, titulo, fecha_inicio
             FROM eventos
             WHERE DATE(fecha_inicio) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
        );

        for (const evento of rows) {
            const hora = new Date(evento.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const mensaje = `¡Tienes el evento "${evento.titulo}" mañana a las ${hora}!`;

            await db.execute(
                `INSERT INTO notificaciones (usuario_uid, evento_id, mensaje)
                 VALUES (?, ?, ?)`,
                [evento.usuario_uid, evento.id, mensaje]
            );

            console.log(`Notificación creada para evento: ${evento.titulo}`);
        }
    } catch (err) {
        console.error('Error al crear notificaciones automáticas:', err);
    }
}

// Exportamos la función para usarla en node-cron o manualmente
module.exports = crearNotificacionesEventos;

//Descomenta esta línea si quieres correrlo manualmente
//crearNotificacionesEventos();
