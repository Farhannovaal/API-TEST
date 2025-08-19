const swaggerJsdoc = require('swagger-jsdoc');
const j2s = require('joi-to-swagger');

const { createUserSchema, updateUserSchema } = require('../schemas/user.schema');
const { createHealthSchema } = require('../schemas/health.schema');
const { updateProfile } = require('../schemas/profile.schema');
const { createTenantSchema, updateTenantSchema } = require('../schemas/tenant.schema');
const { createMenuSchema, updateMenuSchema } = require('../schemas/menus.schema');
const { createOrderSchema, updateOrderSchema } = require('../schemas/order.schema');
const { createPaymentSchema, capturePaymentSchema, failPaymentSchema } = require('../schemas/payments.schema');



const toSwagger = (schema) => {
    try {
        const resolved = typeof schema === 'function' ? schema() : schema;
        if (!resolved || typeof resolved.describe !== 'function') {
            console.warn('toSwagger: schema invalid/missing describe()');
            return undefined;
        }
        const { swagger } = j2s(resolved);
        return swagger;
    } catch (e) {
        console.error('toSwagger error:', e);
        return undefined;
    }
};


const ValidationError = {
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
};

const ApiError = {
    type: 'object',
    properties: { error: { type: 'string', example: 'Message' } }
};

const User = {
    type: 'object',
    properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Farhan' },
        email: { type: 'string', example: 'farhan@example.com' },
        role: { type: 'string', enum: ['admin', 'staff', 'guest'], example: 'admin' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time', nullable: true }
    }
};

const HealthItem = {
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
};

const schemas = {
    User,
    HealthItem,
    ApiError,
    ValidationError,

    UserCreate: toSwagger(createUserSchema),
    UserUpdate: toSwagger(updateUserSchema),

    HealthCreate: toSwagger(createHealthSchema),

    ProfileUpdate: toSwagger(updateProfile),

    TenantCreate: toSwagger(createTenantSchema),
    TenantUpdate: toSwagger(updateTenantSchema),

    MenuCreate: toSwagger(createMenuSchema),
    MenuUpdate: toSwagger(updateMenuSchema),

    OrderCreate: toSwagger(createOrderSchema),
    OrderUpdate: toSwagger(updateOrderSchema),

    PaymentCreate: toSwagger(createPaymentSchema),
    PaymentCapture: toSwagger(capturePaymentSchema),
    PaymentFail: toSwagger(failPaymentSchema),
};


for (const k of Object.keys(schemas)) {
    if (schemas[k] === undefined) delete schemas[k];
}

const ORDERED_TAGS = ['User', 'Profile', 'Health', 'Tenant', 'Menu', 'Order', 'Payments'];
const PATH_ORDER = [
    '/users', '/users/{id}',
    '/profile/{id}',
    '/health', '/health/{id}', '/health/user/{id}',
    '/tenants', '/tenants/{id}',
    '/tenants/{tenantId}/menus', '/menus/{id}',
    '/orders', '/orders/{id}', '/orders/{id}/cancel',
    '/orders/{orderId}/payments', '/payments/{id}', '/payments/{id}/capture', '/payments/{id}/fail',
];

const options = {
    definition: {
        openapi: '3.0.3',
        info: { title: 'API-TEST PPA SS6', version: '1.0.0' },
        servers: [{ url: 'http://localhost:3000/api' }],

        tags: ORDERED_TAGS.map(name => ({ name })),

        'x-tagGroups': [
            { name: 'Core', tags: ['User', 'Profile', 'Health'] },
            { name: 'Catalog', tags: ['Tenant', 'Menu'] },
            { name: 'Sales', tags: ['Order'] },
        ],

        'x-pathOrder': PATH_ORDER,

        components: {
            parameters: {
                PathId: {
                    in: 'path', name: 'id', required: true,
                    schema: { type: 'integer', minimum: 1 }, example: 1,
                    description: 'Resource numeric ID'
                }
            },
            schemas
        }
    },
    apis: ['./app/docs/paths/*.yaml'],
};

module.exports = swaggerJsdoc(options);
