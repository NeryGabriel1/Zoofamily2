import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Mascotas.css';

const Mascotas = () => {
  const { userData } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    raza: '',
    tipo: '',
    anio_nacimiento: '',
    foto: null,
  });
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (userData?.id) fetchMascotas();
  }, [userData]);

  const fetchMascotas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mascotas/${userData.id}`);
      setMascotas(res.data);
    } catch (err) {
      console.error('Error al cargar mascotas:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('usuario_id', userData.id);
    formData.append('nombre', form.nombre);
    formData.append('raza', form.raza);
    formData.append('tipo', form.tipo);
    formData.append('anio_nacimiento', form.anio_nacimiento);
    if (form.foto) formData.append('foto', form.foto);

    try {
      if (editandoId) {
        await axios.put(`${API_URL}/api/mascotas/${editandoId}`, formData);
      } else {
        await axios.post(`${API_URL}/api/mascotas`, formData);
      }
      setForm({ nombre: '', raza: '', tipo: '', anio_nacimiento: '', foto: null });
      setEditandoId(null);
      fetchMascotas();
    } catch (err) {
      console.error('Error al guardar mascota:', err);
    }
  };

  const handleEditar = (mascota) => {
    setForm({
      nombre: mascota.nombre,
      raza: mascota.raza,
      tipo: mascota.tipo,
      anio_nacimiento: mascota.anio_nacimiento,
      foto: null,
    });
    setEditandoId(mascota.id);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta mascota?')) return;
    try {
      await axios.delete(`${API_URL}/api/mascotas/${id}`);
      fetchMascotas();
    } catch (err) {
      console.error('Error al eliminar mascota:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <section className="form-section">
          <h2 className="form-title">Registrar Nueva Mascota</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Raza</label>
                <input className="form-input" name="raza" value={form.raza} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de Mascota</label>
                <select className="form-input" name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">Seleccionar tipo</option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="ave">Ave</option>
                  <option value="roedor">Roedor</option>
                  <option value="reptil">Reptil</option>
                  <option value="pez">Pez</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Año de Nacimiento</label>
                <input className="form-input" type="number" name="anio_nacimiento" value={form.anio_nacimiento} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Foto de la Mascota</label>
              <div className="file-input-wrapper">
                <input className="file-input" type="file" name="foto" accept="image/*" onChange={handleChange} />
                <div className="file-input-display">📸 Seleccionar archivo o arrastrar imagen aquí</div>
              </div>
            </div>
            <button type="submit" className="submit-btn">
              {editandoId ? 'Actualizar Mascota' : 'Registrar Mascota'}
            </button>
          </form>
        </section>

        <section className="pets-section">
          <h2 className="section-title">🏠 Mis Mascotas</h2>
          <div className="pets-grid">
            {mascotas.map((mascota) => (
              <div className="pet-card" key={mascota.id}>
                <img
                  src={
                    mascota.foto_url?.startsWith('http')
                      ? mascota.foto_url
                      : `${API_URL}${mascota.foto_url}`
                  }
                  alt={mascota.nombre}
                  className="pet-imagen"
                />
                <div className="pet-info">
                  <p><strong>Nombre:</strong> {mascota.nombre}</p>
                  <p><strong>Raza:</strong> {mascota.raza}</p>
                  <p><strong>Tipo:</strong> {mascota.tipo}</p>
                  <p><strong>Año:</strong> {mascota.anio_nacimiento}</p>
                  <div className="pet-actions">
                    <button className="edit-btn" onClick={() => handleEditar(mascota)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleEliminar(mascota.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Mascotas;
