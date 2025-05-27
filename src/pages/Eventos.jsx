import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Eventos.css';
import { useAuth } from '../context/AuthContext';
import { useLayoutEffect } from 'react';
const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    id: null,
    titulo: '',
    descripcion: '',
    ubicacion: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const { currentUser } = useAuth();

  // Cargar eventos del usuario al iniciar
  useEffect(() => {
    if (!currentUser) return;
    axios.get(`http://localhost:3001/api/eventos/${currentUser.uid}`)
      .then((res) => {
        const eventosFormateados = res.data.map(evt => ({
          id: evt.id,
          title: evt.title,
          start: evt.start ? new Date(evt.start) : null,
          end: evt.end ? new Date(evt.end) : null,
          description: evt.description,
          location: evt.location,
        })).filter(evt => evt.start && evt.end);
        setEventos(eventosFormateados);
      })
      .catch((err) => console.error('Error al cargar eventos', err));
  }, [currentUser]);

  // Crear evento (clic en fecha)
  const handleDateClick = (arg) => {
    const startDate = arg.dateStr;
    const endDate = new Date(new Date(startDate).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);

    setNuevoEvento({
      id: null,
      titulo: '',
      descripcion: '',
      ubicacion: '',
      fecha_inicio: startDate.slice(0, 16),
      fecha_fin: endDate,
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Ver detalles de evento
  const handleEventClick = (info) => {
    const evt = info.event;

    if (!evt.start || !evt.end) {
      console.warn('Evento inválido:', evt);
      return;
    }

    setNuevoEvento({
      id: evt.id,
      titulo: evt.title,
      descripcion: evt.extendedProps.description || '',
      ubicacion: evt.extendedProps.location || '',
      fecha_inicio: new Date(evt.start).toISOString().slice(0, 16),
      fecha_fin: new Date(evt.end).toISOString().slice(0, 16),
    });
    setShowDetailsModal(true);
  };

  // Cambios en inputs
  const handleChange = (e) => {
    setNuevoEvento({ ...nuevoEvento, [e.target.name]: e.target.value });
  };

  // Guardar evento (nuevo o edición)
  const handleSave = async () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha_inicio || !nuevoEvento.fecha_fin) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const eventoData = {
      usuario_uid: currentUser.uid,
      titulo: nuevoEvento.titulo,
      descripcion: nuevoEvento.descripcion,
      ubicacion: nuevoEvento.ubicacion,
      fecha_inicio: nuevoEvento.fecha_inicio.replace('T', ' '),
      fecha_fin: nuevoEvento.fecha_fin.replace('T', ' ')
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/api/eventos/${nuevoEvento.id}`, eventoData);
        setEventos(prev => prev.map(e =>
          e.id === nuevoEvento.id
            ? {
              ...e,
              title: nuevoEvento.titulo,
              description: nuevoEvento.descripcion,
              location: nuevoEvento.ubicacion,
              start: new Date(nuevoEvento.fecha_inicio),
              end: new Date(nuevoEvento.fecha_fin),
            }
            : e
        ));
      } else {
        const res = await axios.post('http://localhost:3001/api/eventos', eventoData);
        const nuevoId = res.data.id || Date.now();
        setEventos(prev => [...prev, {
          id: nuevoId,
          title: nuevoEvento.titulo,
          start: new Date(nuevoEvento.fecha_inicio),
          end: new Date(nuevoEvento.fecha_fin),
          description: nuevoEvento.descripcion,
          location: nuevoEvento.ubicacion,
        }]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar evento:', error);
      alert('Hubo un error al guardar el evento.');
    }
  };

  // Borrar evento
  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que deseas borrar este evento?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/eventos/${nuevoEvento.id}`);
      setEventos(prev => prev.filter(e => e.id !== nuevoEvento.id));
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error al borrar evento:', error);
      alert('Hubo un error al borrar el evento.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowModal(true);
    setShowDetailsModal(false);
  };
  // Dentro del componente Eventos:
  useLayoutEffect(() => {
    const body = document.body;
    if (showModal || showDetailsModal) {
      body.classList.add('no-scroll');
    } else {
      body.classList.remove('no-scroll');
    }
    return () => body.classList.remove('no-scroll');
  }, [showModal, showDetailsModal]);

  return (
  
  <>
    <Navbar />
    <div className="eventos-container">
      
      <div className="eventos-content">
        <h2>Mi Calendario</h2>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          selectable={true}
          height="auto"
        />

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{isEditing ? 'Editar Evento' : 'Crear Evento'}</h3>
              <label>Título *</label>
              <input type="text" name="titulo" value={nuevoEvento.titulo} onChange={handleChange} />
              <label>Ubicación</label>
              <input type="text" name="ubicacion" value={nuevoEvento.ubicacion} onChange={handleChange} />
              <label>Fecha y hora de Inicio *</label>
              <input type="datetime-local" name="fecha_inicio" value={nuevoEvento.fecha_inicio} onChange={handleChange} />
              <label>Fecha y hora de Fin *</label>
              <input type="datetime-local" name="fecha_fin" value={nuevoEvento.fecha_fin} onChange={handleChange} />
              <label>Descripción</label>
              <textarea name="descripcion" value={nuevoEvento.descripcion} onChange={handleChange} rows="3"></textarea>
              <div className="modal-buttons">
                <button onClick={handleSave}>{isEditing ? 'Guardar Cambios' : 'Crear'}</button>
                <button className="cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{nuevoEvento.titulo}</h3>
              {nuevoEvento.ubicacion && <p><strong>Ubicación:</strong> {nuevoEvento.ubicacion}</p>}
              {nuevoEvento.descripcion && <p><strong>Descripción:</strong> {nuevoEvento.descripcion}</p>}
              <p><strong>Inicio:</strong> {new Date(nuevoEvento.fecha_inicio).toLocaleString([], { timeZoneName: 'short' })}</p>
              <p><strong>Fin:</strong> {new Date(nuevoEvento.fecha_fin).toLocaleString([], { timeZoneName: 'short' })}</p>
              <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#666' }}>
                (Tu zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone})
              </p>
              <div className="modal-buttons">
                <button onClick={handleEdit}>Editar</button>
                <button className="cancel" onClick={handleDelete}>Borrar</button>
                <button onClick={() => setShowDetailsModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Eventos;
