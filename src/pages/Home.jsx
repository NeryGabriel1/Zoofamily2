// src/pages/Home.jsx
import React, { useEffect } from 'react';
import './Home.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

// Imágenes carrusel
import img1 from '../assets/carrusel/01.jpg';
import img2 from '../assets/carrusel/02.jpg';
import img3 from '../assets/carrusel/03.jpg';
import img4 from '../assets/carrusel/04.jpg';
import img5 from '../assets/carrusel/05.jpg';
import img6 from '../assets/carrusel/06.jpg';
import img7 from '../assets/carrusel/07.jpg';
import img8 from '../assets/carrusel/08.jpg';
import img9 from '../assets/carrusel/09.jpg';
import img10 from '../assets/carrusel/10.jpg';
import img11 from '../assets/carrusel/11.jpg';
import img12 from '../assets/carrusel/12.jpg';
import img13 from '../assets/carrusel/13.jpg';
import img14 from '../assets/carrusel/14.jpg';
import img15 from '../assets/carrusel/15.jpg';
import img16 from '../assets/carrusel/16.jpg';
import img17 from '../assets/carrusel/17.jpg';
import img18 from '../assets/carrusel/18.jpg';
import img19 from '../assets/carrusel/19.jpg';

// Iconos
import mascotasImg from '../assets/iconos/mascotas.jpg';
import comunidadImg from '../assets/iconos/comunidad.jpg';
import eventosImg from '../assets/iconos/eventos.jpg';
import informesImg from '../assets/iconos/informes.jpg';
import notiImg from '../assets/iconos/noti.jpg';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const header = document.querySelector('.header');
    const onScroll = () => {
      if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.2)';
        header.style.backdropFilter = 'blur(20px)';
      } else {
        header.style.background = 'rgba(255, 255, 255, 0.1)';
        header.style.backdropFilter = 'blur(10px)';
      }
    };

    window.addEventListener('scroll', onScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.menu-card').forEach(card => {
      observer.observe(card);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const images = [
    img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
    img11, img12, img13, img14, img15, img16, img17, img18, img19
  ];

  const menuItems = [
    { id: 'mascotas', title: 'MASCOTAS', desc: 'Gestiona los perfiles de tus mascotas, historial médico y más', img: mascotasImg },
    { id: 'comunidad', title: 'COMUNIDAD', desc: 'Conecta con otros dueños de mascotas', img: comunidadImg },
    { id: 'eventos', title: 'EVENTOS', desc: 'Descubre eventos pet-friendly y actividades especiales', img: eventosImg },
    { id: 'vacuna', title: 'INFORMES', desc: 'Accede a reportes de salud y vacunación', img: informesImg },
    { id: 'notificaciones', title: 'NOTIFICACIONES', desc: 'Recibe recordatorios importantes del sistema', img: notiImg }
  ];

  return (
    <>
      <header className="header">
        <Navbar />
      </header>

      <main className="main-content">
        <section className="hero">
          <h1>Tu mascota también es la nuestra</h1>
          <p>Cuidamos de tu familia peluda con amor y dedicación profesional</p>

          <div className="services-preview">
            {/* Puedes poner aquí tus SVG o íconos flotantes si los mantienes */}
          </div>
        </section>

        <section className="pets-containers">
          <div className="pet-images kitten"></div>
          <div className="pet-images puppy"></div>
        </section>

        <section className="menu-grid">
          {menuItems.map(({ id, title, desc, img }) => (
            <div key={id} className="menu-card" onClick={() => navigate(`/${id}`)}>
              <div className="menu-icon">
                <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <h3 className="menu-title">{title}</h3>
              <p className="menu-description">{desc}</p>
            </div>
          ))}
        </section>

        <section className="carrusel-container">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            interval={3000}
            transitionTime={600}
          >
            {images.map((img, index) => (
              <div key={index}>
                <img src={img} alt={`Imagen ${index + 1}`} />
              </div>
            ))}
          </Carousel>
        </section>
      </main>
    </>
  );
};

export default Home;
