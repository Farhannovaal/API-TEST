// app/repositories/health.repo.js
const pool = require('../db/pool');

async function ensureUserExists(userId) {
    const [[u]] = await pool.query('SELECT id FROM users WHERE id=? LIMIT 1', [userId]);
    return !!u;
}

async function listHealth() {
    const [rows] = await pool.query(
        `SELECT h.id, h.penyakit, h.waktu, h.created_at, h.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM health h
       JOIN users u ON u.id = h.user_id
      ORDER BY h.waktu DESC, h.id DESC`
    );
    return rows;
}

async function getHealthById(id) {
    const [[row]] = await pool.query(
        `SELECT h.id, h.user_id, h.penyakit, h.waktu, h.created_at, h.updated_at
       FROM health h
      WHERE h.id=? LIMIT 1`, [id]
    );
    return row || null;
}

async function listHealthByUserId(userId, { date } = {}) {
    const params = [userId];
    let where = 'WHERE h.user_id = ?';
    if (date) { where += ' AND DATE(h.waktu) = DATE(?)'; params.push(date); }

    const [rows] = await pool.query(
        `SELECT h.id, h.penyakit, h.waktu, h.created_at, h.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM health h
       JOIN users u ON u.id = h.user_id
       ${where}
      ORDER BY h.waktu DESC, h.id DESC`,
        params
    );
    return rows;
}

async function existsDuplicateSameDay(userId, penyakit, waktu) {
    const [[row]] = await pool.query(
        `SELECT 1 AS x
       FROM health
      WHERE user_id=? AND penyakit=? AND DATE(waktu)=DATE(?)
      LIMIT 1`,
        [userId, penyakit, waktu]
    );
    return !!row;
}

async function insertHealth({ user_id, penyakit, waktu }) {
    if (waktu !== undefined) {
        const [r] = await pool.execute(
            `INSERT INTO health (user_id, penyakit, waktu) VALUES (:user_id,:penyakit,:waktu)`,
            { user_id, penyakit, waktu }
        );
        return r.insertId;
    } else {
        const [r] = await pool.execute(
            `INSERT INTO health (user_id, penyakit) VALUES (:user_id,:penyakit)`,
            { user_id, penyakit }
        );
        return r.insertId;
    }
}

async function getHealthJoinedById(id) {
    const [[row]] = await pool.query(
        `SELECT h.id, h.penyakit, h.waktu, h.created_at, h.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM health h
       JOIN users u ON u.id = h.user_id
      WHERE h.id=? LIMIT 1`, [id]
    );
    return row || null;
}

module.exports = {
    ensureUserExists,
    listHealth,
    getHealthById,
    listHealthByUserId,
    existsDuplicateSameDay,
    insertHealth,
    getHealthJoinedById,
};
