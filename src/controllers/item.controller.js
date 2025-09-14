const Item = require('../models/Item');

exports.create = async (req, res) => {
  const item = await Item.create({ ...req.body, owner: req.user._id });
  res.status(201).json(item);
};

exports.list = async (req, res) => {
  const items = await Item.find().populate('owner', 'email role');
  res.json(items);
};

exports.get = async (req, res) => {
  const item = await Item.findById(req.params.id).populate('owner', 'email role');
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
};

exports.update = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  const isOwner = item.owner?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido' });
  Object.assign(item, req.body);
  await item.save();
  res.json(item);
};

exports.remove = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  const isOwner = item.owner?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Prohibido' });
  await item.deleteOne();
  res.json({ message: 'Eliminado' });
};
