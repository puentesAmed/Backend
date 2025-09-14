const router = require('express').Router();
const { upload, uploadToCloudinary } = require('../middlewares/upload');
const { registerValidator, loginValidator } = require('../middlewares/validators');
const { validationResult } = require('express-validator');
const ctrl = require('../controllers/auth.controller');

// Middleware para validar los errores de express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/register', upload.single('image'), uploadToCloudinary, registerValidator, validate, ctrl.register);

// Ruta de login
router.post('/login', loginValidator, validate, ctrl.login);// Login
// Ruta para obtener info del usuario logueado
router.get('/me', require('../middlewares/auth'), ctrl.me);//  Usuario Logueado

module.exports = router;
