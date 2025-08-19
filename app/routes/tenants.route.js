const router = require('express').Router();
const validate = require('../middlewares/validate');
const ctl = require('../controllers/tenant.controller');
const { createTenantSchema, updateTenantSchema, idParamSchema } = require('../schemas/tenant.schema');
const TenantmenusRoutes = require('./tenantMenus.routes');
const ah = require('../utils/asyncHandler');


router.get('/', ctl.listTenants);
router.post('/', validate(createTenantSchema), ah(ctl.createTenant));
router.get('/:id', validate(idParamSchema, 'params'), ah(ctl.getTenantById));
router.put('/:id', validate(idParamSchema, 'params'), validate(updateTenantSchema), ah(ctl.updateTenant));
router.delete('/:id', validate(idParamSchema, 'params'), ah(ctl.deleteTenant));
router.use('/:tenantId/menus', TenantmenusRoutes);

module.exports = router;
