import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './VerEvento.css';

function VerEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/eventos/detalle/${id}`);
        setEvento(res.data);
      } catch (err) {
        console.error('Error al cargar el evento:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [id]);

  if (loading) return <p className="loading">Cargando evento...</p>;
  if (!evento) return <p className="no-evento">Evento no encontrado.</p>;

  return (
    <div className="ver-evento-body">
      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>

      <Navbar />

      <div className="ver-evento-container">
        <div className="appointment-card">
          <div className="appointment-header">
            <div className="appointment-icon">🏥</div>
            <h1 className="appointment-title">{evento.titulo}</h1>
          </div>

          <div className="appointment-details">
            <div className="detail-item">
              <div className="detail-icon">📋</div>
              <div className="detail-content">
                <div className="detail-label">Descripción</div>
                <div className="detail-value">{evento.descripcion || 'Sin descripción.'}</div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <div className="detail-label">Ubicación</div>
                <div className="detail-value">{evento.ubicacion || 'No especificada.'}</div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <div className="detail-label">Fecha de Inicio</div>
                <div className="detail-value">{new Date(evento.fecha_inicio).toLocaleString()}</div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">⏰</div>
              <div className="detail-content">
                <div className="detail-label">Fecha de Fin</div>
                <div className="detail-value">{new Date(evento.fecha_fin).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="status-badge">
            <div className="status-dot"></div>
            Cita Confirmada
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerEvento;
