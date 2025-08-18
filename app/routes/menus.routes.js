const router = require('express').Router({ mergeParams: true });
const validate = require('../middlewares/validate');
const ctl = require('../controllers/menu.controller');
const { tenantIdParamSchema, createMenuSchema } = require('../schemas/menu.schema');

router.get('/', validate(tenantIdParamSchema, 'params'), ctl.listMenusByTenant);
router.post('/', validate(tenantIdParamSchema, 'params'), validate(createMenuSchema), ctl.createMenu);

module.exports = router;
