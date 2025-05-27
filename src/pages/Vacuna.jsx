import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Vacuna.css";

const Vacuna = () => {
  const { userData } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [mascota, setMascota] = useState(null);
  const [informe, setInforme] = useState("");
  const [alergias, setAlergias] = useState("");
  const [vacunas, setVacunas] = useState([]);

  const [modalAlergia, setModalAlergia] = useState(false);
  const [nuevaAlergia, setNuevaAlergia] = useState("");

  const [modalVacuna, setModalVacuna] = useState(false);
  const [nuevaVacuna, setNuevaVacuna] = useState({ nombre: "", fecha: "" });

  useEffect(() => {
    if (userData?.id) {
      axios.get(`http://localhost:3001/api/mascotas/${userData.id}`)
        .then((res) => setMascotas(res.data))
        .catch((err) => console.error(err));
    }
  }, [userData]);

  useEffect(() => {
    if (mascota) {
      axios.get(`http://localhost:3001/api/informes/informe/${mascota.id}`)
        .then(res => {
          setInforme(res.data.informe || "");
          setAlergias(res.data.alergias || "");
        });

      axios.get(`http://localhost:3001/api/informes/vacunas/${mascota.id}`)
        .then(res => setVacunas(res.data || []));
    }
  }, [mascota]);

  const guardarInforme = () => {
    axios.post(`http://localhost:3001/api/informes/informe`, {
      mascota_id: mascota.id,
      informe,
      alergias
    }).then(() => alert("Informe guardado correctamente"));
  };

  const agregarAlergia = () => {
    if (nuevaAlergia.trim()) {
      setAlergias(prev => prev ? `${prev}, ${nuevaAlergia}` : nuevaAlergia);
    }
    setModalAlergia(false);
  };

  const agregarVacuna = () => {
    const { nombre, fecha } = nuevaVacuna;
    if (!nombre || !fecha) return alert("Completa los campos");
    axios.post(`http://localhost:3001/api/informes/vacunas`, {
      mascota_id: mascota.id,
      nombre,
      fecha
    }).then(() => {
      setVacunas(prev => [...prev, { nombre, fecha }]);
      setModalVacuna(false);
    });
  };

  const eliminarVacuna = (nombre) => {
    axios.delete(`http://localhost:3001/api/informes/vacunas`, {
      data: { mascota_id: mascota.id, nombre }
    }).then(() => {
      setVacunas(prev => prev.filter(v => v.nombre !== nombre));
    });
  };

  return (
    <div className="vacuna-page">
      <Navbar />
      <div className="container">
        <div className="main-card">
          <div className="card-header">
            <h1 className="card-title">Registro de Vacunación</h1>
            <p className="card-subtitle">Mantén al día la salud de tu mascota</p>
          </div>

          <div className="card-content">
            <div className="pet-selection">
              <label className="form-label">Selecciona una mascota:</label>
              <select
                className="form-select"
                onChange={(e) => {
                  const sel = mascotas.find(m => m.id === parseInt(e.target.value));
                  setMascota(sel);
                }}
              >
                <option value="">-- Selecciona --</option>
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            {mascota && (
              <>
                <div className="pet-info-grid">
                  <div className="pet-details">
                    <div className="info-item"><span className="info-label">Nombre:</span><span className="info-value">{mascota.nombre}</span></div>
                    <div className="info-item"><span className="info-label">Raza:</span><span className="info-value">{mascota.raza}</span></div>
                    <div className="info-item"><span className="info-label">Tipo:</span><span className="info-value">{mascota.tipo}</span></div>
                    <div className="info-item"><span className="info-label">Año de nacimiento:</span><span className="info-value">{mascota.anio_nacimiento}</span></div>
                  </div>
                  <div className="pet-image">
                    <img src={mascota.foto_url} alt={mascota.nombre} />
                  </div>
                </div>

                <div className="medical-report">
                  <h3 className="section-titles">🩺 Informe Médico</h3>
                  <textarea
                    className="medical-textarea"
                    value={informe}
                    onChange={(e) => setInforme(e.target.value)}
                    placeholder="Ingrese el informe médico aquí..."
                  />
                </div>

                <div className="allergies-section">
                  <h3 className="section-titles">🌿 Alergias</h3>
                  <div className="allergy-status">
                    <div className="status-indicator"></div>
                    <span>{alergias || "Ninguna alergia registrada"}</span>
                  </div>
                  <button className="btn-add-allergy" onClick={() => setModalAlergia(true)}>+ Agregar Alergia</button>
                </div>

                <div className="vaccines-section">
                  <h3 className="section-titles">💉 Vacunas Aplicadas</h3>
                  {vacunas.map((v, i) => (
                    <div className="vaccine-card" key={i}>
                      <div className="vaccine-info">
                        <div className="vaccine-icon">{v.nombre.charAt(0).toUpperCase()}</div>
                        <div className="vaccine-details">
                          <h4>{v.nombre}</h4>
                          <p className="vaccine-date">Aplicada: {new Date(v.fecha).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="btn-delete" onClick={() => eliminarVacuna(v.nombre)}>Eliminar</button>
                    </div>
                  ))}
                  <button className="btn-primary" onClick={() => setModalVacuna(true)}>+ Adicionar Vacuna</button>
                </div>

                <div className="action-buttons">
                  <button className="btn-secondary" onClick={guardarInforme}>💾 Guardar Informe</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Alergia */}
      {modalAlergia && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Alergia</h3>
            <input
              type="text"
              value={nuevaAlergia}
              onChange={(e) => setNuevaAlergia(e.target.value)}
              placeholder="Ej: Polen"
            />
            <div className="modal-buttons">
              <button onClick={agregarAlergia}>Agregar</button>
              <button onClick={() => setModalAlergia(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vacuna */}
      {modalVacuna && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Vacuna</h3>
            <input
              type="text"
              value={nuevaVacuna.nombre}
              onChange={(e) =>
                setNuevaVacuna({ ...nuevaVacuna, nombre: e.target.value })
              }
              placeholder="Nombre vacuna"
            />
            <input
              type="date"
              value={nuevaVacuna.fecha}
              onChange={(e) =>
                setNuevaVacuna({ ...nuevaVacuna, fecha: e.target.value })
              }
            />
            <div className="modal-buttons">
              <button onClick={agregarVacuna}>Agregar</button>
              <button onClick={() => setModalVacuna(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vacuna;
