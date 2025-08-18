const Joi = require('joi');

const orderIdParamSchema = Joi.object({
    orderId: Joi.number().integer().positive().required(),
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const createPaymentSchema = Joi.object({
    method: Joi.string().valid('cash', 'qris', 'transfer', 'card').required(),
    amount: Joi.number().precision(2).positive().optional(),
    provider_txn_id: Joi.string().max(100).optional(),
    raw_response: Joi.object().unknown(true).optional(),
}).required();

const capturePaymentSchema = Joi.object({
    amount: Joi.number().precision(2).positive().optional(),
    provider_txn_id: Joi.string().max(100).optional(),
    raw_response: Joi.object().unknown(true).optional(),
}).min(1);

const failPaymentSchema = Joi.object({
    raw_response: Joi.object().unknown(true).optional(),
    reason: Joi.string().max(255).optional(),
}).min(1);

module.exports = {
    orderIdParamSchema,
    idParamSchema,
    createPaymentSchema,
    capturePaymentSchema,
    failPaymentSchema,
};
