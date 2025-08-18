const pool = require('../db/pool');

async function listByTenant(tenantId) {
    const [rows] = await pool.query(
        `SELECT id,tenant_id,name,sku,category,price,stock_qty,image_url,is_active,created_at,updated_at
     FROM menus WHERE tenant_id=? ORDER BY id DESC`,
        [tenantId]
    );
    return rows;
}

async function findById(id) {
    const [rows] = await pool.query(
        `SELECT id,tenant_id,name,sku,category,price,stock_qty,image_url,is_active,created_at,updated_at
     FROM menus WHERE id=? LIMIT 1`, [id]
    );
    return rows[0] || null;
}

async function create(tenantId, data) {
    const payload = { ...data, tenant_id: tenantId };
    const [r] = await pool.execute(
        `INSERT INTO menus (tenant_id,name,sku,category,price,stock_qty,image_url,is_active)
     VALUES (:tenant_id,:name,:sku,:category,:price,:stock_qty,:image_url,:is_active)`,
        payload
    );
    return findById(r.insertId);
}

async function update(id, fields) {
    const set = [];
    const params = { id };
    for (const k of ['name', 'sku', 'category', 'price', 'stock_qty', 'image_url', 'is_active']) {
        if (fields[k] !== undefined) { set.push(`${k}=:${k}`); params[k] = fields[k]; }
    }
    if (!set.length) return findById(id);
    await pool.execute(`UPDATE menus SET ${set.join(', ')}, updated_at=NOW() WHERE id=:id`, params);
    return findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await pool.execute('DELETE FROM menus WHERE id=?', [id]);
    return before;
}

async function findByIds(ids) {
    if (!ids.length) return [];
    const [rows] = await pool.query(
        `SELECT id,tenant_id,name,price,stock_qty FROM menus WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
    );
    return rows;
}

async function deductStock(conn, { menuId, tenantId, qty }) {
    const [r] = await conn.execute(
        `UPDATE menus SET stock_qty = stock_qty - :qty
       WHERE id=:menuId AND tenant_id=:tenantId AND stock_qty >= :qty`,
        { menuId, tenantId, qty }
    );
    return r.affectedRows;
}

async function restoreStock(conn, { menuId, qty }) {
    await conn.execute(
        `UPDATE menus SET stock_qty = stock_qty + :qty WHERE id=:menuId`,
        { menuId, qty }
    );
}

module.exports = {
    listByTenant, findById, create, update, remove, findByIds, deductStock, restoreStock
};
