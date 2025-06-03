const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./conexion');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Objeto temporal para códigos de verificación
const codigosVerificacion = {};

// Normaliza el email
function normalizeEmail(email) {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (domain && (domain.toLowerCase() === 'gmail.com' || domain.toLowerCase() === 'googlemail.com')) {
    return `${localPart.replace(/\./g, '')}@${domain}`;
  }
  return email;
}

// Configuración Nodemailer (SendGrid)
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: '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' // reemplaza con tu clave válida
  }
});

// ENVIAR CÓDIGO DE VERIFICACIÓN
router.post('/enviar-codigo', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Correo requerido' });
  }

  const normalizedEmail = normalizeEmail(email.trim().toLowerCase());

  try {
    const [user] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [normalizedEmail]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000);
    codigosVerificacion[normalizedEmail] = {
      codigo,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    };

    const mailOptions = {
      from: '"Zoofamily 🐾" <nerycabral406@gmail.com>',
      to: normalizedEmail,
      subject: 'Código de verificación',
      text: `Tu código de verificación es: ${codigo}. Expira en 10 minutos.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar correo:', error);
        return res.status(500).json({ message: 'Error al enviar el correo' });
      } else {
        console.log('Correo enviado:', info.response);
        return res.json({ message: 'Código enviado al correo' });
      }
    });
  } catch (error) {
    console.error('Error en enviar-codigo:', error);
    res.status(500).json({ message: 'Error interno' });
  }
});

// VERIFICAR CÓDIGO
router.post('/verificar-codigo', (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  const normalizedEmail = normalizeEmail(email.trim().toLowerCase());
  const data = codigosVerificacion[normalizedEmail];

  if (!data) {
    return res.status(400).json({ message: 'No se ha solicitado un código' });
  }

  if (Date.now() > data.expires) {
    delete codigosVerificacion[normalizedEmail];
    return res.status(400).json({ message: 'El código ha expirado' });
  }

  if (parseInt(codigo) !== data.codigo) {
    return res.status(400).json({ message: 'Código incorrecto' });
  }

  delete codigosVerificacion[normalizedEmail];
  return res.json({ message: 'Verificación exitosa' });
});

// Multer para guardar imágenes en /uploads/perfiles
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'perfiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

const upload = multer({ storage });

// REGISTRAR USUARIO
router.post('/', async (req, res) => {
  try {
    const { uid, nombre, email, foto_perfil, proveedor, username, password } = req.body;

    if (!uid || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const normalizedEmail = normalizeEmail(email.trim().toLowerCase());
    const safeNombre = nombre?.trim() || '';
    let safeUsername = username?.trim() || normalizedEmail.split('@')[0];
    const proveedorFinal = proveedor || 'email';

    const [existingUser] = await db.query('SELECT id FROM usuarios WHERE uid = ? OR email = ?', [uid, normalizedEmail]);
    if (existingUser.length > 0) return res.status(200).json({ message: 'Usuario ya existe' });

    const [existingUsername] = await db.query('SELECT id FROM usuarios WHERE username = ?', [safeUsername]);
    if (existingUsername.length > 0) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      safeUsername = `${safeUsername}${randomSuffix}`;
    }

    let hashedPassword = password;
    if (proveedorFinal !== 'google') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const fotoPerfilFinal = foto_perfil || `${req.protocol}://${req.get('host')}/default_profile.png`;

    await db.query(
      `INSERT INTO usuarios (uid, nombre, email, foto_perfil, proveedor, username, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid, safeNombre, normalizedEmail, fotoPerfilFinal, proveedorFinal, safeUsername, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario guardado en MySQL', username: safeUsername });
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ACTUALIZAR PERFIL (con rutas dinámicas)
router.put('/actualizar', upload.single('foto'), async (req, res) => {
  const { id, nombre, username } = req.body;
  const nuevaFoto = req.file;

  try {
    const [userExists] = await db.query(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?',
      [username, id]
    );
    if (userExists.length > 0) {
      return res.json({ success: false, message: 'El username ya está en uso' });
    }

    const [userData] = await db.query('SELECT foto_perfil FROM usuarios WHERE id = ?', [id]);
    let nuevaURL = null;

    if (nuevaFoto) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      nuevaURL = `${baseUrl}/uploads/perfiles/${nuevaFoto.filename}`;
    }

    const updateQuery = `
      UPDATE usuarios SET nombre = ?, username = ?${nuevaURL ? ', foto_perfil = ?' : ''} WHERE id = ?
    `;
    const updateParams = nuevaURL ? [nombre, username, nuevaURL, id] : [nombre, username, id];
    await db.query(updateQuery, updateParams);

    if (
      nuevaFoto &&
      userData.length &&
      userData[0].foto_perfil &&
      userData[0].foto_perfil.includes('/uploads/perfiles/')
    ) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'perfiles', path.basename(userData[0].foto_perfil));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ success: true, foto_perfil: nuevaURL });
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// OBTENER POR UID
router.get('/uid/:uid', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE uid = ?', [req.params.uid]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// OBTENER POR USERNAME
router.get('/username/:username', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [req.params.username]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

module.exports = router;
