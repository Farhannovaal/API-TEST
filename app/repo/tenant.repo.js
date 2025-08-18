const pool = require('../db/pool');

async function findAll() {
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants ORDER BY id DESC'
    );
    return rows;
}

async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants WHERE id=? LIMIT 1',
        [id]
    );
    return rows[0] || null;
}

async function create(data) {
    const [r] = await pool.execute(
        `INSERT INTO tenants (name,code,address,phone) 
     VALUES (:name,:code,:address,:phone)`,
        data
    );
    return findById(r.insertId);
}

async function update(id, fields) {
    const set = [];
    const params = { id };
    for (const k of ['name', 'code', 'address', 'phone']) {
        if (fields[k] !== undefined) { set.push(`${k}=:${k}`); params[k] = fields[k]; }
    }
    if (!set.length) return findById(id);
    await pool.execute(`UPDATE tenants SET ${set.join(', ')}, updated_at=NOW() WHERE id=:id`, params);
    return findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await pool.execute('DELETE FROM tenants WHERE id=?', [id]);
    return before;
}

module.exports = { findAll, findById, create, update, remove };
