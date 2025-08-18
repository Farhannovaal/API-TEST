const Joi = require('joi');

const createTenantSchema = Joi.object({
    name: Joi.string().min(3).max(120).required(),
    code: Joi.string().regex(/^[a-zA-Z0-9_-]+$/).min(2).max(50).required(),
    address: Joi.string().max(255).allow('', null),
    phone: Joi.string().max(50).allow('', null),
});

const updateTenantSchema = Joi.object({
    name: Joi.string().min(3).max(120),
    code: Joi.string().regex(/^[a-zA-Z0-9_-]+$/).min(2).max(50),
    address: Joi.string().max(255).allow('', null),
    phone: Joi.string().max(50).allow('', null),
}).min(1);

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const tenantIdParamSchema = Joi.object({
    tenantId: Joi.number().integer().positive().required(),
});

module.exports = {
    createTenantSchema,
    updateTenantSchema,
    idParamSchema,
    tenantIdParamSchema,
};
