const router = require('express').Router();
const ctrl = require('../controllers/payments.controller');
const validate = require('../middlewares/validate');

const {
    orderIdParamSchema,
    idParamSchema,
    createPaymentSchema,
    capturePaymentSchema,
    failPaymentSchema,
} = require('../schemas/payments.schema');

router.get('/orders/:orderId/payments', validate(orderIdParamSchema, 'params'), ctrl.listByOrder);
router.post('/orders/:orderId/payments',
    validate(orderIdParamSchema, 'params'),
    validate(createPaymentSchema),
    ctrl.createForOrder
);

router.get('/payments/:id', validate(idParamSchema, 'params'), ctrl.getById);
router.patch('/payments/:id/capture', validate(idParamSchema, 'params'), validate(capturePaymentSchema), ctrl.capture);
router.patch('/payments/:id/fail', validate(idParamSchema, 'params'), validate(failPaymentSchema), ctrl.fail);

module.exports = router;
