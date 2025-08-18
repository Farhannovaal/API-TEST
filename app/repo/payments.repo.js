const pool = require('../db/pool');

async function findOrderById(orderId) {
    const [[row]] = await pool.query(
        'SELECT id, tenant_id, user_id, status, total_amount FROM orders WHERE id=? LIMIT 1',
        [orderId]
    );
    return row || null;
}

async function computeOrderTotal(orderId) {
    const [[row]] = await pool.query(
        'SELECT COALESCE(SUM(price*qty),0) AS total FROM order_items WHERE order_id=?',
        [orderId]
    );
    return Number(row?.total || 0);
}

async function listByOrder(orderId) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE order_id=? ORDER BY id DESC', [orderId]);
    return rows;
}

async function getById(id) {
    const [[row]] = await pool.query('SELECT * FROM payments WHERE id=? LIMIT 1', [id]);
    return row || null;
}

async function create({ order_id, method, amount, provider_txn_id, raw_response }) {
    const params = { order_id, method, amount, provider_txn_id, raw_response: raw_response ? JSON.stringify(raw_response) : null };
    const [r] = await pool.execute(
        `INSERT INTO payments (order_id, method, amount, provider_txn_id, raw_response)
     VALUES (:order_id, :method, :amount, :provider_txn_id, :raw_response)`,
        params
    );
    return r.insertId;
}

async function updateStatusSuccess(id, { amount, provider_txn_id, raw_response }) {
    const [r] = await pool.execute(
        `UPDATE payments
       SET status='success',
           amount = COALESCE(:amount, amount),
           provider_txn_id = COALESCE(:provider_txn_id, provider_txn_id),
           raw_response = COALESCE(:raw_response, raw_response),
           paid_at = NOW(),
           updated_at = NOW()
     WHERE id=:id`,
        {
            id,
            amount,
            provider_txn_id,
            raw_response: raw_response ? JSON.stringify(raw_response) : null,
        }
    );
    return r.affectedRows;
}

async function updateStatusFailed(id, { raw_response }) {
    const [r] = await pool.execute(
        `UPDATE payments
       SET status='failed',
           raw_response = COALESCE(:raw_response, raw_response),
           updated_at = NOW()
     WHERE id=:id`,
        { id, raw_response: raw_response ? JSON.stringify(raw_response) : null }
    );
    return r.affectedRows;
}

async function markOrderPaid(orderId) {
    const [r] = await pool.execute(
        `UPDATE orders SET status='paid', updated_at=NOW() WHERE id=:orderId`,
        { orderId }
    );
    return r.affectedRows;
}

module.exports = {
    findOrderById,
    computeOrderTotal,
    listByOrder,
    getById,
    create,
    updateStatusSuccess,
    updateStatusFailed,
    markOrderPaid,
};
