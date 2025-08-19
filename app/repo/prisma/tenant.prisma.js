const prisma = require('../../lib/prisma');

async function findAll() {
    return prisma.tenants.findMany({
        orderBy: { id: 'desc' },
        select: { id: true, name: true, code: true, address: true, phone: true, created_at: true, updated_at: true },
    });
}

async function findById(id) {
    return prisma.tenants.findUnique({
        where: { id: Number(id) },
        select: { id: true, name: true, code: true, address: true, phone: true, created_at: true, updated_at: true },
    });
}

async function findByCode(code) {
    return prisma.tenants.findUnique({
        where: { code },
        select: { id: true, name: true, code: true, address: true, phone: true, created_at: true, updated_at: true },
    });
}

async function findByName(name) {
    return prisma.tenants.findUnique({
        where: { name },
        select: { id: true, name: true, code: true, address: true, phone: true, created_at: true, updated_at: true },
    });
}

async function create(data) {
    const row = await prisma.tenants.create({ data, select: { id: true } });
    return findById(row.id);
}

async function update(id, fields) {
    await prisma.tenants.update({ where: { id: Number(id) }, data: fields });
    return findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await prisma.tenants.delete({ where: { id: Number(id) } });
    return before;
}

module.exports = { findAll, findById, findByCode, findByName, create, update, remove };
