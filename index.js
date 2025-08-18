const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./app/routes/api.routes');
const notFound = require('./app/middlewares/notFound');
const errorHandler = require('./app/middlewares/errorHandler');
const pool = require('./app/db/pool')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./app/docs/swagger');


const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        tagsSorter: (a, b) => {
            const order = ['User', 'Profile', 'Health', 'Tenant', 'Menus', 'Order'];
            const ia = order.indexOf(a);
            const ib = order.indexOf(b);
            return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
        },
        operationsSorter: (a, b) => {
            const order = [
                '/users', '/users/{id}',
                '/profile/{id}',
                '/health', '/health/{id}', '/health/user/{id}',

                '/tenants', '/tenants/{id}',
                '/tenants/{tenantId}/menus', '/menus/{id}',

                '/orders', '/orders/{id}', '/orders/{id}/cancel',
            ];
            const ia = order.indexOf(a.get('path'));
            const ib = order.indexOf(b.get('path'));
            const A = ia === -1 ? 9999 : ia;
            const B = ib === -1 ? 9999 : ib;
            if (A !== B) return A - B;
            return a.get('method').localeCompare(b.get('method'));
        },
        docExpansion: 'none',
        defaultModelsExpandDepth: -1,
    }
}));

app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);


async function bootstrap() {
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        console.log(' MySQL connected');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
    } catch (err) {
        console.error(' MySQL connection failed:', err.message);
        process.exit(1);
    }
}

bootstrap();