const Joi = require('joi');

const createHealthSchema = Joi.object({
    user_id: Joi.number().integer().positive().required(),
    penyakit: Joi.string().min(3).max(100).required(),
    waktu: Joi.date().iso().optional(),
    is_fit: Joi.boolean().default(false),
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const dateQuerySchema = Joi.object({
    start: Joi.date().iso(),
    end: Joi.date().iso(),
})
    .and('start', 'end')
    .custom((val, helpers) => {
        if (val.start && val.end && val.start > val.end) {
            return helpers.error('any.invalid', { message: 'start must be before or equal to end' });
        }
        return val;
    }, 'start-end order check');

module.exports = { createHealthSchema, idParamSchema, dateQuerySchema };
