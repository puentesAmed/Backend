const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    // fuerza role user
    const payload = { email, password, role: 'user' };

    if (req.file) {
      payload.image = { public_id: req.file.filename, url: req.file.path };
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email en uso' });

    const user = await User.create(payload);
    const token = sign(user._id);
    res
      .cookie('token', token, { httpOnly: true, sameSite: 'lax' })
      .status(201).json({ user: { id: user._id, email: user.email, role: user.role, image: user.image }, token });
  } catch (e) {
    res.status(500).json({ message: 'Error registro', error: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = sign(user._id);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
       .json({ user: { id: user._id, email: user.email, role: user.role, image: user.image }, token });
  } catch (e) {
    res.status(500).json({ message: 'Error login', error: e.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
