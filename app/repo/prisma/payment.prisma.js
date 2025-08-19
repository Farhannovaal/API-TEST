const prisma = require('../libs/prisma');

async function findOrderBasic(orderId) {
    return prisma.order.findUnique({
        where: { id: Number(orderId) },
        select: { id: true, tenantId: true, userId: true, status: true, totalAmount: true }
    });
}

async function computeOrderTotal(orderId) {
    const items = await prisma.orderItem.findMany({
        where: { orderId: Number(orderId) },
        select: { subtotal: true }
    });
    return items.reduce((sum, r) => sum + Number(r.subtotal), 0);
}

async function listByOrder(orderId) {
    return prisma.payment.findMany({
        where: { orderId: Number(orderId) },
        orderBy: { id: 'desc' }
    });
}

async function getById(id) {
    return prisma.payment.findUnique({ where: { id: Number(id) } });
}

async function create({ order_id, method, amount, provider_txn_id, raw_response }) {
    const created = await prisma.payment.create({
        data: {
            orderId: Number(order_id),
            method,
            amount: amount ?? null,
            providerTxnId: provider_txn_id ?? null,
            rawResponse: raw_response ? JSON.stringify(raw_response) : null,
            status: 'pending'
        },
        select: { id: true }
    });
    return created.id;
}

async function updateStatusSuccess(id, { amount, provider_txn_id, raw_response }) {
    await prisma.payment.update({
        where: { id: Number(id) },
        data: {
            status: 'success',
            amount: amount ?? undefined,
            providerTxnId: provider_txn_id ?? undefined,
            rawResponse: raw_response ? JSON.stringify(raw_response) : undefined,
            paidAt: new Date()
        }
    });
}

async function updateStatusFailed(id, { raw_response }) {
    await prisma.payment.update({
        where: { id: Number(id) },
        data: {
            status: 'failed',
            rawResponse: raw_response ? JSON.stringify(raw_response) : undefined
        }
    });
}

async function markOrderPaid(orderId) {
    await prisma.order.update({ where: { id: Number(orderId) }, data: { status: 'paid' } });
}

module.exports = {
    findOrderBasic, computeOrderTotal, listByOrder, getById,
    create, updateStatusSuccess, updateStatusFailed, markOrderPaid
};
