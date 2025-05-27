import React, { useState, useEffect } from "react";
import "./Perfil.css";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import defaultProfile from '../assets/default_profile.png';
import axios from "axios";

const Perfil = () => {
  const { currentUser, userData, setUserData } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [foto, setFoto] = useState(defaultProfile);
  const [imagenFile, setImagenFile] = useState(null);
  const [errorUsername, setErrorUsername] = useState("");

  const [estadisticas, setEstadisticas] = useState({
    totalMascotas: 0,
    especies: 0,
    fechaRegistro: ""
  });

  useEffect(() => {
    if (userData) {
      setNombre(userData.nombre || "");
      setUsername(userData.username || "");
      setFoto(userData.foto_perfil || defaultProfile);
      obtenerEstadisticas(userData.id);
    }
  }, [userData]);

  const obtenerEstadisticas = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/mascotas/estadisticas/${userId}`);
      setEstadisticas(res.data);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };

  const calcularAniosActivos = () => {
    if (!estadisticas.fechaRegistro) return 0;
    const fechaRegistro = new Date(estadisticas.fechaRegistro);
    const hoy = new Date();
    return hoy.getFullYear() - fechaRegistro.getFullYear();
  };

  const handleImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
        setImagenFile(archivo);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const validarUsername = (value) => {
    const regex = /^[a-zA-Z0-9_-]{1,30}$/;
    if (!regex.test(value)) {
      setErrorUsername("Username inválido: solo letras, números, guiones y guiones bajos. Máx. 30 caracteres.");
    } else {
      setErrorUsername("");
    }
    setUsername(value);
  };

  const handleGuardar = async () => {
    if (errorUsername) return;

    try {
      const formData = new FormData();
      formData.append("id", userData.id);
      formData.append("nombre", nombre);
      formData.append("username", username);
      if (imagenFile) formData.append("foto", imagenFile);

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/usuarios/actualizar`, formData);

      if (res.data.success) {
        setUserData(prev => ({
          ...prev,
          nombre,
          username,
          foto_perfil: res.data.foto_perfil || prev.foto_perfil,
        }));
        alert("Perfil actualizado correctamente");
        setEditando(false);
      } else {
        alert(res.data.message || "Error al guardar");
      }
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      alert("Error al guardar los cambios");
    }
  };

  return (
    <>
      <Navbar />
      <div className="perfil-page-container">
        {/* Partículas animadas */}
        <div className="bg-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        {/* Tarjeta de perfil */}
        <div className="profile-card">
          <div className="avatar-container">
            <input type="file" accept="image/*" onChange={handleImagen} id="fotoInput" hidden />
            <label htmlFor="fotoInput">
              <img className="perfil-foto" src={foto} alt="Foto de perfil" />
            </label>
            <div className="status-indicator"></div>
          </div>

          {editando ? (
            <>
              <input
                className="perfil-nombre-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
              />
              <input
                className="perfil-username-input"
                value={username}
                onChange={(e) => validarUsername(e.target.value)}
                placeholder="Username"
              />
              {errorUsername && <p className="error-text">{errorUsername}</p>}
            </>
          ) : (
            <>
              <h2 className="perfil-nombre">{nombre}</h2>
              <span className="perfil-username">@{username}</span>
            </>
          )}

          {/* ESTADÍSTICAS */}
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">{estadisticas.totalMascotas}</div>
              <div className="stat-label">Mascotas</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{estadisticas.especies}</div>
              <div className="stat-label">Especies</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{calcularAniosActivos()}</div>
              <div className="stat-label">Años Activo</div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="action-buttons">
            {editando ? (
              <button className="action-btn primary" onClick={handleGuardar}>Guardar</button>
            ) : (
              <button className="action-btn primary" onClick={() => setEditando(true)}>Editar perfil</button>
            )}
            <button
              className="action-btn secondary"
              onClick={() => window.location.href = "/mascotas"}
            >
              Agregar mascota
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
