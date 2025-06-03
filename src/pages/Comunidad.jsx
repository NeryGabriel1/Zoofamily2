import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import './Comunidad.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Picker from 'emoji-picker-react';
import defaultProfile from '../assets/default_profile.png';

function Comunidad() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [respondiendoA, setRespondiendoA] = useState(null);
  const { currentUser } = useAuth();
  const scrollRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchMensajes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comunidad/mensajes`);
      const mensajesLimpios = res.data.map(msg => ({
        ...msg,
        imagenes: Array.isArray(msg.imagenes) ? msg.imagenes.flat() : []
      }));
      setMensajes(mensajesLimpios);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
    }
  };

  useEffect(() => {
    fetchMensajes();
    const interval = setInterval(fetchMensajes, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() && imagenes.length === 0) return;

    const formData = new FormData();
    formData.append('uid', currentUser.uid);
    formData.append('texto', nuevoMensaje);
    if (respondiendoA) {
      formData.append('respuesta_a', respondiendoA.id);
    }
    imagenes.forEach((img) => {
      formData.append('imagenes', img);
    });

    try {
      await axios.post(`${API_URL}/api/comunidad/mensaje`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNuevoMensaje('');
      setImagenes([]);
      setRespondiendoA(null);
      await fetchMensajes();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const handleEmojiClick = (emojiObj) => {
    setNuevoMensaje((prev) => prev + emojiObj.emoji);
  };

  const handleImageChange = (e) => {
    setImagenes([...e.target.files]);
  };

  const handleResponder = (msg) => {
    setRespondiendoA(msg);
  };

  return (
    <div className="comunidad-page-container">
      <Navbar />
      <div className="comunidad-content">
        <h2 className="notificaciones-titles">Comunidad</h2>

        {mensajes.map((msg, index) => {
          const perfilUrl = msg.foto_perfil?.startsWith('http') ? msg.foto_perfil : defaultProfile;

          return (
            <div key={msg.id || index} className="mensaje-card">
              <img
                src={perfilUrl}
                alt="perfil"
                className="mensaje-avatar"
                onError={(e) => { e.target.src = defaultProfile; }}
              />
              <div className="mensaje-info">
                <div className="mensaje-header">
                  <Link to={`/perfilDeUsuario/${msg.username}`} className="mensaje-usuario">
                    {msg.nombre}
                  </Link>
                  <span className="mensaje-hora">
                    {new Date(msg.creado_en).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {msg.respuesta_usuario && (
                  <div className="mensaje-respuesta">
                    <strong>Respondiendo a:</strong> {msg.respuesta_usuario} - {msg.respuesta_texto}
                  </div>
                )}

                <div className="mensaje-texto">{msg.texto}</div>

                {msg.imagenes?.length > 0 && (
                  <div className="mensaje-imagenes">
                    {msg.imagenes.map((imgUrl, i) => {
                      if (typeof imgUrl !== 'string') return null;
                      const url = `${API_URL}${imgUrl}`;
                      const isPDF = imgUrl.toLowerCase().endsWith('.pdf');

                      return isPDF ? (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mensaje-pdf-link"
                        >
                          📄 Ver PDF
                        </a>
                      ) : (
                        <img
                          key={i}
                          src={url}
                          alt={`mensaje-img-${i}`}
                          className="mensaje-img"
                          onClick={() => window.open(url, '_blank')}
                        />
                      );
                    })}
                  </div>
                )}

                <button className="responder-btn" onClick={() => handleResponder(msg)}>
                  Responder
                </button>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef}></div>

        <div className="mensaje-input-container">
          {respondiendoA && (
            <div className="respondiendo-a">
              Respondiendo a <strong>{respondiendoA.nombre}</strong>: "{respondiendoA.texto}"
              <button onClick={() => setRespondiendoA(null)}>X</button>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="file-upload" className="custom-file-upload">📎</label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            <input
              type="text"
              placeholder="Enviar mensaje a #comunidad"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              className="mensaje-input"
            />

            <button className="emoji-btn" onClick={() => setMostrarEmojis(!mostrarEmojis)}>
              😃
            </button>

            <button onClick={handleEnviar} className="mensaje-enviar">
              Enviar
            </button>
          </div>

          {mostrarEmojis && (
            <div className="emoji-picker-container">
              <button className="cerrar-picker" onClick={() => setMostrarEmojis(false)}>×</button>
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {imagenes.length > 0 && (
            <div className="preview-imagenes">
              {imagenes.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className="preview-img"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comunidad;
