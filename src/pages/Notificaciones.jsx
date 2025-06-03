import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './Notificaciones.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Notificaciones() {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser) return;
      try {
        const res = await axios.get(`${API_URL}/api/notificaciones/${currentUser.uid}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Error al cargar notificaciones:', err);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const getIcon = (mensaje) => {
    if (mensaje.includes('Nuevo evento')) return '📌';
    if (mensaje.includes('modificado')) return '📝';
    if (mensaje.includes('cancelado')) return '❌';
    if (mensaje.includes('mañana')) return '⏰';
    return '🔔';
  };

  return (
    <div className="notificaciones-page-container">
      <Navbar />
      <div className="notificaciones-contents">
        <h2 className="notificaciones-titles">Notificaciones</h2>
        <div className="notificaciones-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="notificacion-card">
                <p className="notificacion-text">
                  <span className="notificacion-icon">{getIcon(notif.mensaje)}</span>{' '}
                  {notif.mensaje}
                </p>
                {notif.evento_id && (
                  <Link to={`/evento/${notif.evento_id}`} className="notificacion-link">
                    Ver evento: {notif.evento_titulo}
                  </Link>
                )}
                <div className="notificacion-footer">
                  <span className="notificacion-date">
                    {new Date(notif.fecha_creada).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-notificaciones">No hay notificaciones.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notificaciones;
