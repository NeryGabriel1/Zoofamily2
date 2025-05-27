/*=================================================*/
/*Crear base de datos*/
CREATE DATABASE IF NOT EXISTS Zoofamily;

/*=================================================*/
/*Usar base de datos*/
USE Zoofamily;

/*=================================================*/
/*Tabla: Usuarios*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(255),
    nombre VARCHAR(255),
    email VARCHAR(255),
    foto_perfil TEXT,
    proveedor ENUM('google', 'email'),
    username VARCHAR(50),
    password VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(uid),
    UNIQUE(email),
    UNIQUE(username)
);

/*=================================================*/
/*Tabla: Mensajes_comunidad*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS mensajes_comunidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    texto TEXT,
    respuesta_a INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    -- NOTA: No se incluye FOREIGN KEY en respuesta_a según el diagrama original
);

/*=================================================*/
/*Tabla: Imagenes_comunidad*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS imagenes_comunidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje_id INT,
    url VARCHAR(255),
    FOREIGN KEY (mensaje_id) REFERENCES mensajes_comunidad(id)
);

/*=================================================*/
/*Tabla: Eventos*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_uid VARCHAR(255),
    titulo VARCHAR(255),
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion VARCHAR(255),
    ubicacion VARCHAR(255),
    FOREIGN KEY (usuario_uid) REFERENCES usuarios(uid)
);

/*=================================================*/
/*Tabla: Notificaciones*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_uid VARCHAR(255) NOT NULL,
    evento_id INT,
    mensaje VARCHAR(255) NOT NULL,
    fecha_creada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida TINYINT(1) DEFAULT 0,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

/*=================================================*/
/*Tabla: Mascotas*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nombre VARCHAR(100),
    raza VARCHAR(100),
    tipo VARCHAR(100),
    anio_nacimiento INT,
    foto_url VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

/*=================================================*/
/*Tabla: Informes_mascotas*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS informes_mascotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT NOT NULL,
    informe TEXT,
    alergias TEXT,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);

/*=================================================*/
/*Tabla: Vacunas*/
/*=================================================*/
CREATE TABLE IF NOT EXISTS vacunas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mascota_id INT NOT NULL,
    nombre VARCHAR(100),
    fecha DATE,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE CASCADE
);

/*=================================================*/
/*Verificar contenido*/
/*=================================================*/
SELECT * FROM usuarios;
SELECT * FROM mensajes_comunidad;
SELECT * FROM imagenes_comunidad;
SELECT * FROM eventos;
SELECT * FROM notificaciones;
SELECT * FROM mascotas;
SELECT * FROM vacunas;
SELECT * FROM informes_mascotas;
