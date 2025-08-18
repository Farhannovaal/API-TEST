const swaggerJsdoc = require('swagger-jsdoc');
const j2s = require('joi-to-swagger');

// ⬇️ pastikan path lowercase:
const {
    createUserSchema,
    updateUserSchema,
    idParamSchema: userIdParamSchema,
} = require('../../app/schemas/user.schema');

const {
    createHealthSchema,
    idParamSchema: healthIdParamSchema, // kalau kamu punya, tak pakai di parameter juga bisa
} = require('../../app/schemas/health.schema');

const {
    updateProfile: updateProfileSchema,
    idParamSchema: profileIdParamSchema,
} = require('../../app/schemas/profile.schema');

// convert Joi -> OpenAPI
const { swagger: UserCreate } = j2s(createUserSchema);
const { swagger: UserUpdate } = j2s(updateUserSchema);
const { swagger: HealthCreate } = j2s(createHealthSchema);
const { swagger: ProfileUpdate } = j2s(updateProfileSchema);

// (opsional) param id dari Joi juga bisa di-ref pakai schema:
const { swagger: IdParam } = j2s(userIdParamSchema);

const options = {
    definition: {
        openapi: '3.0.3',
        info: { title: 'API-TEST PPA SS6', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000/api' }],
        components: {
            // skema respons dari DB (tulis manual sekali)
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Farhan' },
                        email: { type: 'string', example: 'farhan@example.com' },
                        role: { type: 'string', enum: ['admin', 'staff', 'guest'], example: 'admin' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                HealthItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 10 },
                        user_id: { type: 'integer', example: 1 },
                        penyakit: { type: 'string', example: 'Flu' },
                        waktu: { type: 'string', format: 'date-time' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time', nullable: true },
                        user_name: { type: 'string', example: 'Farhan' },
                        user_email: { type: 'string', example: 'farhan@example.com' },
                        user_role: { type: 'string', enum: ['admin', 'staff', 'guest'], example: 'admin' }
                    }
                },

                // ❗BODY REQUEST: AUTO dari Joi (cukup ubah Joi → /docs ikut)
                UserCreate,     // → '#/components/schemas/UserCreate'
                UserUpdate,     // → '#/components/schemas/UserUpdate'
                HealthCreate,   // → '#/components/schemas/HealthCreate'
                ProfileUpdate,  // → '#/components/schemas/ProfileUpdate'

                // (opsional) param id (pakai di parameter.schema.$ref)
                IdParam,

                // error shapes (manual)
                ApiError: {
                    type: 'object',
                    properties: { error: { type: 'string', example: 'Email already exists' } }
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Validation error' },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: '"email" must be a valid email' },
                                    path: { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./app/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
