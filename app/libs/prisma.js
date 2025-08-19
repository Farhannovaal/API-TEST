// app/lib/prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['warn', 'error'] });
module.exports = prisma;

