const pool = require('../db/pool');

async function createOrderTx(conn, { user_id, tenant_id, payment_method, total_amount, notes }) {
  const [r] = await conn.execute(
    `INSERT INTO orders (user_id,tenant_id,status,payment_method,total_amount,notes)
     VALUES (:user_id,:tenant_id,'pending',:payment_method,:total_amount,:notes)`,
    { user_id, tenant_id, payment_method, total_amount, notes: notes ?? null }
  );
  return r.insertId;
}

async function insertOrderItemTx(conn, { order_id, menu_id, qty, unit_price, subtotal }) {
  await conn.execute(
    `INSERT INTO order_items (order_id,menu_id,qty,unit_price,subtotal)
     VALUES (:order_id,:menu_id,:qty,:unit_price,:subtotal)`,
    { order_id, menu_id, qty, unit_price, subtotal }
  );
}

async function getOrderWithItems(id) {
  const [orders] = await pool.query(
    `SELECT o.id,o.user_id,o.tenant_id,o.status,o.payment_method,o.total_amount,o.notes,
            o.created_at,o.updated_at,
            t.name AS tenant_name
       FROM orders o
       JOIN tenants t ON t.id=o.tenant_id
      WHERE o.id=? LIMIT 1`, [id]
  );
  const order = orders[0];
  if (!order) return null;
  const [items] = await pool.query(
    `SELECT oi.id,oi.menu_id,oi.qty,oi.unit_price,oi.subtotal,
            m.name AS menu_name
       FROM order_items oi
       JOIN menus m ON m.id=oi.menu_id
      WHERE oi.order_id=? ORDER BY oi.id`, [id]
  );
  order.items = items;
  return order;
}

async function listOrders({ tenant_id, user_id, status, page, page_size }) {
  const where = [];
  const params = [];
  if (tenant_id) { where.push('o.tenant_id=?'); params.push(tenant_id); }
  if (user_id) { where.push('o.user_id=?'); params.push(user_id); }
  if (status) { where.push('o.status=?'); params.push(status); }
  const wsql = where.length ? ('WHERE ' + where.join(' AND ')) : '';
  const limit = page_size;
  const offset = (page - 1) * page_size;

  const [rows] = await pool.query(
    `SELECT o.id,o.user_id,o.tenant_id,o.status,o.payment_method,o.total_amount,o.notes,
            o.created_at,o.updated_at,
            t.name AS tenant_name
       FROM orders o
       JOIN tenants t ON t.id=o.tenant_id
       ${wsql}
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?`, [...params, limit, offset]
  );
  return rows;
}

async function cancelOrderTx(conn, orderId) {
  const [r] = await conn.execute(
    `UPDATE orders SET status='cancelled', updated_at=NOW()
      WHERE id=:id AND status='pending'`, { id: orderId }
  );
  return r.affectedRows;
}

async function getOrderItems(conn, orderId) {
  const [rows] = await conn.query(
    `SELECT menu_id, qty FROM order_items WHERE order_id=?`, [orderId]
  );
  return rows;
}

module.exports = {
  createOrderTx, insertOrderItemTx, getOrderWithItems, listOrders, cancelOrderTx, getOrderItems
};
