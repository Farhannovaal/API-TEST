const Joi = require('joi');

const createHealthSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    penyakit: Joi.string().min(3).max(100).required(),
    waktu: Joi.date().iso().optional(),
    is_fit: Joi.boolean().default(false)
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

module.exports = { createHealthSchema, idParamSchema };
