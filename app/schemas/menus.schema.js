const Joi = require('joi');

const tenantIdParamSchema = Joi.object({
    tenantId: Joi.number().integer().positive().required(),
});

const menuIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const createMenuSchema = Joi.object({
    name: Joi.string().min(2).max(120).required(),
    sku: Joi.string().max(64).allow(null, ''),
    category: Joi.string().max(64).allow(null, ''),
    price: Joi.number().min(0).precision(2).required(),
    stock_qty: Joi.number().integer().min(0).default(0),
    image_url: Joi.string().uri().allow(null, ''),
    is_active: Joi.boolean().default(true),
});

const updateMenuSchema = Joi.object({
    name: Joi.string().min(2).max(120),
    sku: Joi.string().max(64).allow(null, ''),
    category: Joi.string().max(64).allow(null, ''),
    price: Joi.number().min(0).precision(2),
    stock_qty: Joi.number().integer().min(0),
    image_url: Joi.string().uri().allow(null, ''),
    is_active: Joi.boolean(),
}).min(1);

module.exports = {
    tenantIdParamSchema,
    menuIdParamSchema,
    createMenuSchema,
    updateMenuSchema,
};
