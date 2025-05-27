// src/routers/routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthForm from '../pages/AuthForm';
import Home from '../pages/Home';
import Eventos from '../pages/Eventos';
import Comunidad from '../pages/Comunidad';
import Notificaciones from '../pages/Notificaciones';
import Perfil from '../pages/Perfil';
import Vacuna from "../pages/Vacuna";
import Mascotas from '../pages/Mascotas';
import PerfilDeUsuario from '../pages/PerfilDeUsuario';
import VerEvento from '../pages/VerEvento';
import ProtectorRuta from '../components/ProtectorRuta';

const AppRoutes = () => (
  <Routes>
    {/* Rutas públicas */}
    <Route path="/login" element={<AuthForm />} />
    <Route path="/register" element={<AuthForm />} />

    {/* Ruta pública para ver perfiles de otros usuarios */}
    <Route path="/perfilDeUsuario/:username" element={<PerfilDeUsuario />} />

    {/* Rutas protegidas */}
    <Route
      path="/"
      element={
        <ProtectorRuta>
          <Home />
        </ProtectorRuta>
      }
    />
    <Route
      path="/eventos"
      element={
        <ProtectorRuta>
          <Eventos />
        </ProtectorRuta>
      }
    />
    <Route
      path="/comunidad"
      element={
        <ProtectorRuta>
          <Comunidad />
        </ProtectorRuta>
      }
    />
    <Route
      path="/notificaciones"
      element={
        <ProtectorRuta>
          <Notificaciones />
        </ProtectorRuta>
      }
    />
    <Route
      path="/perfil"
      element={
        <ProtectorRuta>
          <Perfil />
        </ProtectorRuta>
      }
    />
    <Route
      path="/vacuna"
      element={
        <ProtectorRuta>
          <Vacuna />
        </ProtectorRuta>
      }
    />
    <Route
      path="/mascotas"
      element={
        <ProtectorRuta>
          <Mascotas />
        </ProtectorRuta>
      }
    />

    <Route
      path="/evento/:id"
      element={
        <ProtectorRuta>
          <VerEvento />
        </ProtectorRuta>
      }
    />

    {/* Redirección por defecto */}
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

export default AppRoutes;
