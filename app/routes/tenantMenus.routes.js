
const router = require('express').Router({ mergeParams: true });
const validate = require('../middlewares/validate');
const ctl = require('../controllers/menus.controller');
const { tenantIdParamSchema, createMenuSchema } = require('../schemas/menus.schema');

router.get(
    '/',
    validate(tenantIdParamSchema, 'params'),
    ctl.listMenusByTenant
);

router.post(
    '/',
    validate(tenantIdParamSchema, 'params'),
    validate(createMenuSchema, 'body'),
    ctl.createMenu
);

module.exports = router;

