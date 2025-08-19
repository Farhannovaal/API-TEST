// app/lib/prisma.js  ← singular: lib
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['warn', 'error'],
});

module.exports = prisma;
