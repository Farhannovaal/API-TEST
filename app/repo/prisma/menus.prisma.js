const prisma = require('../../lib/prisma');

async function listByTenant(tenantId) {
    return prisma.menu.findMany({
        where: { tenantId: Number(tenantId) },
        orderBy: { id: 'desc' },
    });
}

async function findById(id) {
    return prisma.menu.findUnique({ where: { id: Number(id) } });
}

async function create(tenantId, data) {
    const created = await prisma.menu.create({
        data: { ...data, tenantId: Number(tenantId) },
        select: { id: true },
    });
    return findById(created.id);
}

async function update(id, fields) {
    await prisma.menu.update({ where: { id: Number(id) }, data: fields });
    return findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await prisma.menu.delete({ where: { id: Number(id) } });
    return before;
}

async function findByIds(ids) {
    if (!ids?.length) return [];
    return prisma.menu.findMany({
        where: { id: { in: ids.map(Number) } },
        select: { id: true, tenantId: true, name: true, price: true, stockQty: true },
    });
}

async function deductStockTx(tx, { menuId, tenantId, qty }) {
    const updated = await tx.menu.updateMany({
        where: { id: Number(menuId), tenantId: Number(tenantId), stockQty: { gte: Number(qty) } },
        data: { stockQty: { decrement: Number(qty) } },
    });
    return updated.count;
}

async function restoreStockTx(tx, { menuId, qty }) {
    await tx.menu.update({ where: { id: Number(menuId) }, data: { stockQty: { increment: Number(qty) } } });
}

module.exports = {
    listByTenant, findById, create, update, remove, findByIds, deductStockTx, restoreStockTx
};
