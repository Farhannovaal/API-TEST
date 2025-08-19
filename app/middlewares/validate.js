module.exports = (schema, property = 'body') => (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
        console.error('Validation schema is missing or invalid for', { property });
        return res.status(500).json({ error: 'Internal validation config error' });
    }

    try {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(422).json({
                error: 'Validation error',
                details: error.details.map(d => ({ message: d.message, path: d.path })),
            });
        }

        req[property] = value;
        next();
    } catch (e) {
        console.error('Validation middleware error:', e);
        res.status(500).json({ error: 'Unexpected validation error' });
    }
};
