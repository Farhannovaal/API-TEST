const pool = require('../db/pool');

function asNumericId(id) {
    if (id && typeof id === 'object' && 'id' in id) id = id.id;
    const nid = Number(id);
    if (!Number.isFinite(nid) || nid <= 0) {
        throw new Error(`findById expects positive numeric id, got: ${JSON.stringify(id)}`);
    }
    return nid;
}

async function findAll() {
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants ORDER BY id DESC'
    );
    return rows;
}

async function findById(id) {
    const nid = asNumericId(id);
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants WHERE id=? LIMIT 1',
        [nid]
    );
    return rows[0] || null;
}

async function findByCode(code) {
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants WHERE code=? LIMIT 1',
        [code]
    );
    return rows[0] || null;
}

async function findByName(name) {
    const [rows] = await pool.query(
        'SELECT id,name,code,address,phone,created_at,updated_at FROM tenants WHERE name=? LIMIT 1',
        [name]
    );
    return rows[0] || null;
}

async function create(data) {
    const payload = {
        name: data.name ?? null,
        code: data.code ?? null,
        address: data.address ?? null,
        phone: data.phone ?? null,
    };

    const [r] = await pool.execute(
        `INSERT INTO tenants (name,code,address,phone)
     VALUES (:name,:code,:address,:phone)`,
        payload
    );

    return await findById(r.insertId);
}

async function update(id, fields) {
    const set = [];
    const params = { id };

    for (const k of ['name', 'address', 'phone']) {
        if (fields[k] !== undefined) {
            set.push(`${k}=:${k}`);
            params[k] = fields[k];
        }
    }

    if (!set.length) return await findById(id);

    await pool.execute(
        `UPDATE tenants SET ${set.join(', ')}, updated_at=NOW() WHERE id=:id`,
        params
    );

    return await findById(id);
}

async function remove(id) {
    const before = await findById(id);
    if (!before) return null;
    await pool.execute('DELETE FROM tenants WHERE id=?', [Number(id)]);
    return before;
}

module.exports = { findAll, findById, findByCode, findByName, create, update, remove };
