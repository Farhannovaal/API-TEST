# API-TEST
PPA TEST API FOR NEST JS AND EXPRESS JS

Users: CRUD pengguna, Order, Payments

- FIlter and Sorting


Health: catatan kesehatan per user (bisa banyak), termasuk status is_fit (sudah sembuh/belum)

Food Order: Order Food dengan ketentuan / persyaratan kesehatan tertentu.

Swagger UI di /docs + skema request otomatis dari Joi via joi-to-swagger

Node.js 20.x 

Express v5

MySQL 8 / MariaDB 

Joi (validasi) + joi-to-swagger (generate schema)

swagger-jsdoc + swagger-ui-express

dotenv, morgan, cors

nodemon (dev)


// SETUP LOCAL PROJECT

1. Clone Project
2. Setup Env
3. Setup Database query migration di file app\schemas\mysql\mysql.yaml
4. Doc Swagger
