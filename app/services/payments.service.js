const repo = require('../repo/payments.repo');

async function listByOrder(orderId) {
    const order = await repo.findOrderById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });

    return repo.listByOrder(orderId);
}

async function createForOrder(orderId, payload) {
    const order = await repo.findOrderById(orderId);
    if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
    if (order.status === 'paid') throw Object.assign(new Error('Order already paid'), { status: 409 });
    if (order.status === 'cancelled') throw Object.assign(new Error('Order cancelled'), { status: 409 });

    let amount = payload.amount;
    if (amount == null) {
        amount = order.total_amount != null ? Number(order.total_amount) : await repo.computeOrderTotal(orderId);
    }
    if (amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 422 });

    const paymentId = await repo.create({
        order_id: orderId,
        method: payload.method,
        amount,
        provider_txn_id: payload.provider_txn_id,
        raw_response: payload.raw_response,
    });

    const payment = await repo.getById(paymentId);
    return payment;
}

async function capture(id, payload) {
    const payment = await repo.getById(id);
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    if (payment.status === 'success') return payment; // idempotent
    if (payment.status === 'failed') throw Object.assign(new Error('Payment already failed'), { status: 409 });

    await repo.updateStatusSuccess(id, {
        amount: payload.amount,
        provider_txn_id: payload.provider_txn_id,
        raw_response: payload.raw_response,
    });

    await repo.markOrderPaid(payment.order_id);

    return repo.getById(id);
}

async function fail(id, payload) {
    const payment = await repo.getById(id);
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    if (payment.status === 'success') throw Object.assign(new Error('Payment already success'), { status: 409 });

    const raw = payload.raw_response || {};
    if (payload.reason) raw.reason = payload.reason;

    await repo.updateStatusFailed(id, { raw_response: raw });
    return repo.getById(id);
}

async function getById(id) {
    const payment = await repo.getById(id);
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    return payment;
}

module.exports = { listByOrder, createForOrder, capture, fail, getById };
