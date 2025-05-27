// src/pages/PerfilDeUsuario.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import defaultProfile from "../assets/default_profile.png";
import "./Perfil.css";

const PerfilDeUsuario = () => {
  const { username } = useParams();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    totalMascotas: 0,
    especies: 0,
    fechaRegistro: ""
  });
  const [mascotas, setMascotas] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/usuarios/username/${username}`);
        setDatos(res.data);

        const estadRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/mascotas/estadisticas/${res.data.id}`);
        setEstadisticas(estadRes.data);

        const mascotasRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/mascotas/${res.data.id}`);
        setMascotas(mascotasRes.data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [username]);

  const calcularAniosActivos = () => {
    if (!estadisticas.fechaRegistro) return 0;
    const fecha = new Date(estadisticas.fechaRegistro);
    const hoy = new Date();
    return hoy.getFullYear() - fecha.getFullYear();
  };

  if (loading) return <p style={{ color: "white", textAlign: "center", marginTop: "100px" }}>Cargando perfil...</p>;
  if (!datos) return <p style={{ color: "white", textAlign: "center", marginTop: "100px" }}>Usuario no encontrado.</p>;

  const foto = datos.foto_perfil || defaultProfile;

  return (
    <>
      <Navbar />

      <div className="perfil-page-container">
        <div className="bg-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div className="profile-card">
          <div className="avatar-container">
            <img className="perfil-foto" src={foto} alt="Foto de perfil" />
            <div className="status-indicator"></div>
          </div>

          <h2 className="perfil-nombre">{datos.nombre}</h2>
          <span className="perfil-username">@{datos.username}</span>

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

          {mascotas.length > 0 && (
            <div className="pets-section">
              <h3 className="pets-title">Mascotas de {datos.nombre}</h3>
              <div className="pets-grid">
                {mascotas.map((m) => (
                  <div key={m.id} className="pet-card">
                    <div className="pet-avatar">🐾</div>
                    <div className="pet-name">{m.nombre}</div>
                    <div className="pet-type">{m.tipo}</div>
                    {m.foto_url && (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${m.foto_url}`}
                        alt={m.nombre}
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginTop: "5px"
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PerfilDeUsuario;
