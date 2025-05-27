import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar header">
      <div className="navbar-container nav">
        {/* Logo */}
        <div className="navbar-logo logo">ZOOFAMILY</div>

        {/* Hamburguesa (solo visible en mobile) */}
        <div className="hamburger" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Enlaces */}
        <ul className={`navbar-links nav-links ${isOpen ? 'active' : ''}`}>
          <li>
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`nav-link menu-button ${location.pathname === '/' ? 'active' : ''}`}
            >
              INICIO
            </Link>
          </li>
          <li>
            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className={`nav-link menu-button ${location.pathname === '/perfil' ? 'active' : ''}`}
            >
              PERFIL
            </Link>
          </li>
          <li>
            <button className="btn-salir menu-button logout-button" onClick={handleLogout}>
              SALIR
            </button>
          </li>
          {user && (
            <li className="navbar-user">👋 {user.displayName || user.email}</li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;