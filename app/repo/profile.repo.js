// app/repositories/profile.repo.js
const pool = require('../db/pool');

function buildSet(fields, map) {
    const set = [];
    const params = {};
    for (const [k, v] of Object.entries(fields)) {
        if (v === undefined) continue;
        if (!(k in map)) continue;
        set.push(`${map[k]} = :${k}`);
        params[k] = v;
    }
    return { set, params };
}

async function ensureUserExists(userId) {
    const [[row]] = await pool.query('SELECT id FROM users WHERE id=? LIMIT 1', [userId]);
    return !!row;
}

async function getProfileJoinUserByUserId(userId, date) {
    const params = [userId];
    let where = 'WHERE p.user_id = ?';
    if (date) { where += ' AND DATE(p.created_at) = DATE(?)'; params.push(date); }

    const [rows] = await pool.query(
        `SELECT
       p.id, p.user_id, p.birthday, p.address, p.gender, p.job_status,
       p.created_at, p.updated_at,
       u.name AS user_name, u.email AS user_email, u.role AS user_role
     FROM profile p
     JOIN users u ON u.id = p.user_id
     ${where}
     ORDER BY p.created_at DESC`,
        params
    );
    return rows;
}

async function getProfileByUserId(userId) {
    const [[row]] = await pool.query(
        `SELECT p.id, p.user_id, p.birthday, p.address, p.gender, p.job_status,
            p.created_at, p.updated_at
       FROM profile p
      WHERE p.user_id = ? LIMIT 1`, [userId]
    );
    return row || null;
}

async function updateProfileByUserId(userId, fields) {
    const map = { birthday: 'birthday', address: 'address', gender: 'gender', job_status: 'job_status' };
    const { set, params } = buildSet(fields, map);
    if (set.length === 0) return { affectedRows: 0 };

    params.userId = userId;
    const [res] = await pool.execute(
        `UPDATE profile SET ${set.join(', ')}, updated_at = NOW() WHERE user_id = :userId`,
        params
    );
    return res;
}

async function insertProfile(userId, fields) {
    const cols = ['user_id'];
    const vals = [':user_id'];
    const params = { user_id: userId };

    for (const k of ['birthday', 'address', 'gender', 'job_status']) {
        if (fields[k] !== undefined) {
            cols.push(k);
            vals.push(`:${k}`);
            params[k] = fields[k];
        }
    }

    const [res] = await pool.execute(
        `INSERT INTO profile (${cols.join(', ')}) VALUES (${vals.join(', ')})`,
        params
    );
    return res;
}

module.exports = {
    ensureUserExists,
    getProfileJoinUserByUserId,
    getProfileByUserId,
    updateProfileByUserId,
    insertProfile,
};
