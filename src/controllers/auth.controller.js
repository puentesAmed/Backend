const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, process.env.JWT_EXPIRES ? { expiresIn: process.env.JWT_EXPIRES } : {});

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si ya existe el usuario
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email en uso' });

    // Construir payload
    const payload = {
      name,
      email,
      password,
      role: 'user', // 🔒 fuerza siempre 'user'
      image: req.file?.cloudinary || null, // ✅ Cloudinary
    };

    const user = await User.create(payload);
    const token = sign(user._id);

    res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .status(201)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image, // { public_id, url }
        },
        token,
      });
  } catch (e) {
    res.status(500).json({ message: 'Error registro', error: e.message });
  }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = sign(user._id);

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image, // ✅ siempre Cloudinary
        },
        token,
      });
  } catch (e) {
    res.status(500).json({ message: 'Error login', error: e.message });
  }
};

// ------------------ ME ------------------
exports.me = async (req, res) => {
  try {
    // req.user se rellena en el middleware `auth.js`
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image, // ✅ Cloudinary
      },
    });
  } catch (e) {
    res.status(500).json({ message: 'Error obteniendo usuario', error: e.message });
  }
};
