const router = require('express').Router();
const auth = require('../middlewares/auth');
const { param } = require('express-validator');
const { validationResult } = require('express-validator');
const ctrl = require('../controllers/item.controller');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', ctrl.list);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.get);

router.use(auth);
router.post('/', ctrl.create);
router.patch('/:id', [param('id').isMongoId()], validate, ctrl.update);
router.delete('/:id', [param('id').isMongoId()], validate, ctrl.remove);

module.exports = router;
