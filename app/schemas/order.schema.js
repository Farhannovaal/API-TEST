const Joi = require('joi');

const createOrderSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    tenant_id: Joi.number().integer().positive().required(),
    payment_method: Joi.string().valid('cash', 'bank_transfer', 'ewallet', 'card').default('cash'),
    notes: Joi.string().max(255).allow(null, ''),
    items: Joi.array().items(
        Joi.object({
            menu_id: Joi.number().integer().positive().required(),
            qty: Joi.number().integer().min(1).required(),
        })
    ).min(1).required(),
});

const orderIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const listOrdersQuerySchema = Joi.object({
    tenant_id: Joi.number().integer().positive(),
    user_id: Joi.number().integer().positive(),
    status: Joi.string().valid('pending', 'paid', 'cancelled', 'refunded'),
    page: Joi.number().integer().min(1).default(1),
    page_size: Joi.number().integer().min(1).max(200).default(20),
});

module.exports = { createOrderSchema, orderIdParamSchema, listOrdersQuerySchema };
