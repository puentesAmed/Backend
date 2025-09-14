const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const { upload, uploadToCloudinary } = require('../middlewares/upload');
const { idParamValidator } = require('../middlewares/validators');
const { validationResult } = require('express-validator');
const ctrl = require('../controllers/user.controller');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.use(auth);//Proteccion de rutas

router.get('/', requireRole('admin'), ctrl.getAll);//Devuelve todos los usuarios.
router.get('/:id', idParamValidator, validate, ctrl.getById);//Devuelve un usuario por su ID.

router.patch('/:id', idParamValidator, validate, upload.single('image'), ctrl.updateSelf);//Actualiza un usuario (incluye subir imagen con upload.single('image'))
router.delete('/:id', idParamValidator, validate, ctrl.remove);//Elimina un usuario.

router.patch('/:id/role', requireRole('admin'), idParamValidator, validate, ctrl.adminSetRole);// Admin cambia rol

module.exports = router;
