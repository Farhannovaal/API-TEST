const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'staff', 'guest').default('guest'),
});

const updateUserSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    email: Joi.string().email(),
    role: Joi.string().valid('admin', 'staff', 'guest'),
}).min(1);

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

module.exports = { createUserSchema, updateUserSchema, idParamSchema };
