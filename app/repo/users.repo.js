const pool = require('../db/pool');

async function findAll() {
    const [rows] = await pool.query(
        'SELECT id,name,email,role,created_at,updated_at FROM users ORDER BY id DESC'
    );
    return rows;
}

async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id,name,email,role,created_at,updated_at FROM users WHERE id=? LIMIT 1', [id]
    );
    return rows[0] || null;
}

async function insert({ name, email, role }) {
    const [r] = await pool.execute(
        'INSERT INTO users (name,email,role) VALUES (:name,:email,:role)',
        { name, email, role }
    );
    return r.insertId;
}

async function update(id, fields) {
    const set = []; const params = { id };
    if (fields.name !== undefined) { set.push('name=:name'); params.name = fields.name; }
    if (fields.email !== undefined) { set.push('email=:email'); params.email = fields.email; }
    if (fields.role !== undefined) { set.push('role=:role'); params.role = fields.role; }
    if (!set.length) return 0;
    const [r] = await pool.execute(`UPDATE users SET ${set.join(', ')}, updated_at=NOW() WHERE id=:id`, params);
    return r.affectedRows;
}

async function remove(id) {
    const [r] = await pool.execute('DELETE FROM users WHERE id=?', [id]);
    return r.affectedRows;
}

module.exports = { findAll, findById, insert, update, remove };
