const Joi = require('joi');

const normalizeBirthday = (value, helpers) => {
    if (typeof value !== 'string') return helpers.error('any.invalid');

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
        const [, dd, mm, yyyy] = m;
        return `${yyyy}-${mm}-${dd}`;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);

    return helpers.error('any.invalid');
};

const updateProfile = Joi.object({
    birthday: Joi.string()
        .custom(normalizeBirthday, 'normalize birthday to YYYY-MM-DD')
        .optional()
        .messages({ 'any.invalid': 'birthday must be YYYY-MM-DD, DD/MM/YYYY, or ISO-8601' }),
    address: Joi.string().min(3).max(250),
    gender: Joi.string().valid('Laki-laki', 'Perempuan'),
    job_status: Joi.string().valid('working', 'not working')
}).min(1);

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

module.exports = { updateProfile, idParamSchema };
