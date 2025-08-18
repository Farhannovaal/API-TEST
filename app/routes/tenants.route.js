const router = require('express').Router();
const validate = require('../middlewares/validate');
const ctl = require('../controllers/tenant.controller');
const { createTenantSchema, updateTenantSchema, idParamSchema } = require('../schemas/tenant.schema');

router.get('/', ctl.listTenants);
router.post('/', validate(createTenantSchema), ctl.createTenant);
router.get('/:id', validate(idParamSchema, 'params'), ctl.getTenantById);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateTenantSchema), ctl.updateTenant);
router.delete('/:id', validate(idParamSchema, 'params'), ctl.deleteTenant);

module.exports = router;
