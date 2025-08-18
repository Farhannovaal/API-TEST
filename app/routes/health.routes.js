const router = require('express').Router();
const { listHealth, getHealthById, getHealthByUserId, createHealth } =
    require('../controllers/health.controller');

const validate = require('../middlewares/validate');
const { createHealthSchema, idParamSchema, dateQuerySchema } =
    require('../schemas/health.schema');

router.get('/', listHealth);
router.get('/:id', validate(idParamSchema, 'params'), getHealthById);
router.get('/user/:id', validate(idParamSchema, 'params'), validate(dateQuerySchema, 'query'), getHealthByUserId);
router.post('/', validate(createHealthSchema), createHealth);

module.exports = router;
