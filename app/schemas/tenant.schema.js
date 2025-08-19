const Joi = require('joi');

const createTenantSchema = Joi.object({
    name: Joi.string().min(3).max(120).required(),
    address: Joi.string().max(255).allow('', null),
    phone: Joi.string().max(50).allow('', null),
    code: Joi.forbidden(),
});

const updateTenantSchema = Joi.object({
    name: Joi.string().min(3).max(120),
    address: Joi.string().max(255).allow('', null),
    phone: Joi.string().max(50).allow('', null),
    code: Joi.forbidden(),
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
