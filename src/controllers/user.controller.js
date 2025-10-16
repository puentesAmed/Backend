const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// solo admin
exports.getAll = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// propietario o admin
exports.getById = async (req, res) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Prohibido' });
  }
  const user = await User.findById(req.params.id).select('-password').populate('related');
  if (!user) return res.status(404).json({ message: 'No encontrado' });
  res.json(user);
};

// propietario actualiza datos básicos e imagen
exports.updateSelf = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) return res.status(403).json({ message: 'Prohibido' });

  const updates = {};
  if (req.body.email) updates.email = req.body.email;
  if (req.body.password) updates.password = req.body.password;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'No encontrado' });

  // Subida imagen Cloudinary
  if (req.file?.cloudinary) {
    if (user.image?.public_id) {
      try { await cloudinary.uploader.destroy(user.image.public_id); } catch (_) {}
    }
    user.image = req.file.cloudinary;
  }

  if (updates.email) user.email = updates.email;
  if (updates.password) user.password = updates.password;

  await user.save();
  const out = user.toObject(); delete out.password;
  res.json(out);
};

// admin cambia rol
exports.adminSetRole = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido' });
  const { role } = req.body;
  if (!['user','admin'].includes(role)) return res.status(400).json({ message: 'Rol inválido' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'No encontrado' });
  res.json(user);
};

// propietario o admin pueden borrar; elimina imagen
exports.remove = async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  if (!isSelf && req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido' });

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'No encontrado' });

  if (user.image?.public_id) {
    try { await cloudinary.uploader.destroy(user.image.public_id); } catch (_) {}
  }
  await user.deleteOne();
  res.json({ message: 'Usuario eliminado' });
};

// related: add sin duplicar
exports.addRelated = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) return res.status(403).json({ message: 'Prohibido' });
  const { itemIds } = req.body;
  if (!Array.isArray(itemIds) || itemIds.length === 0) return res.status(400).json({ message: 'itemIds requerido' });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { related: { $each: itemIds } } },
    { new: true }
  ).select('-password').populate('related');
  res.json(user);
};

// related: remove
exports.removeRelated = async (req, res) => {
  if (req.user._id.toString() !== req.params.id) return res.status(403).json({ message: 'Prohibido' });
  await User.findByIdAndUpdate(req.params.id, { $pull: { related: req.params.itemId } });
  res.json({ message: 'Eliminado' });
};
