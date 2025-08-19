const prisma = require('../libs/prisma');

async function findAll() {
    return prisma.tenant.findMany({
        orderBy: { id: 'desc' },
        select: { id: true, name: true, code: true, address: true, phone: true, createdAt: true, updatedAt: true },
    });
}

async function findById(id) {
    return prisma.tenant.findUnique({
        where: { id: Number(id) },
        select: { id: true, name: true, code: true, address: true, phone: true, createdAt: true, updatedAt: true },
    });
}

async function findByCode(code) {
    return prisma.tenant.findUnique({
        where: { code },
        select: { id: true, name: true, code: true, address: true, phone: true, createdAt: true, updatedAt: true },
    });
}

async function findByName(name) {
    return prisma.tenant.findUnique({
        where: { name },
        select: { id: true, name: true, code: true, address: true, phone: true, createdAt: true, updatedAt: true },
    });
}

async function create(data) {
    const row = await prisma.tenant.create({ data, select: { id: true } });
    return findById(row.id);
}

async function update(id, fields) {
    await prisma.tenant.update({ where: { id: Number(id) }, data: fields });
    return findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await prisma.tenant.delete({ where: { id: Number(id) } });
    return before;
}

module.exports = { findAll, findById, findByCode, findByName, create, update, remove };
