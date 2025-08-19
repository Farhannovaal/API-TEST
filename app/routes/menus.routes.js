const router = require('express').Router();
const validate = require('../middlewares/validate');
const ctl = require('../controllers/menus.controller');
const { menuIdParamSchema, updateMenuSchema } = require('../schemas/menus.schema');

router.get('/:id',
    validate(menuIdParamSchema, 'params'),
    ctl.getMenuById
);

router.patch('/:id',
    validate(menuIdParamSchema, 'params'),
    validate(updateMenuSchema, 'body'),
    ctl.updateMenu
);

router.put('/:id',
    validate(menuIdParamSchema, 'params'),
    validate(updateMenuSchema, 'body'),
    ctl.updateMenu
);

router.delete('/:id',
    validate(menuIdParamSchema, 'params'),
    ctl.deleteMenu
);

module.exports = router;
