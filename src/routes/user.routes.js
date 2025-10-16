const router = require('express').Router();
const { param } = require('express-validator');
const { validationResult } = require('express-validator');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const { upload, uploadToCloudinary } = require('../middlewares/upload');
const ctrl = require('../controllers/user.controller');

// Middleware de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Todas las rutas requieren autenticación
router.use(auth);

// Admin puede listar todos los usuarios
router.get('/', requireRole('admin'), ctrl.getAll);

// Obtener usuario por id (propietario o admin)
router.get('/:id', [param('id').isMongoId(), validate], ctrl.getById);

// Actualizar usuario (solo propietario) + imagen
router.patch(
  '/:id',
  [param('id').isMongoId(), validate],
  upload.single('image'),
  uploadToCloudinary,
  ctrl.updateSelf
);

// Cambiar rol (solo admin)
router.patch('/:id/role', requireRole('admin'), [param('id').isMongoId(), validate], ctrl.adminSetRole);

// Eliminar usuario (propietario o admin)
router.delete('/:id', [param('id').isMongoId(), validate], ctrl.remove);

module.exports = router;
