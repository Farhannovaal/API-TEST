const router = require('express').Router();
const validate = require('../middlewares/validate');
const ctl = require('../controllers/order.controller');
const { createOrderSchema, orderIdParamSchema, listOrdersQuerySchema } = require('../schemas/order.schema');

router.get('/', validate(listOrdersQuerySchema, 'query'), ctl.listOrders);
router.post('/', validate(createOrderSchema), ctl.createOrder);
router.get('/:id', validate(orderIdParamSchema, 'params'), ctl.getOrder);
router.patch('/:id/cancel', validate(orderIdParamSchema, 'params'), ctl.cancelOrder);

module.exports = router;
