// app/services/health.service.js
const repo = require('../repo/health.repo');

const toMysqlDateTime = (d) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    const pad = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
};

async function listAll() {
    const data = await repo.listHealth();
    return { code: 200, data };
}

async function getById(id) {
    const row = await repo.getHealthById(id);
    if (!row) return { code: 404, error: 'Record not found' };
    return { code: 200, data: row };
}

async function listByUser(userId, { date } = {}) {
    const exists = await repo.ensureUserExists(userId);
    if (!exists) return { code: 404, error: 'User not found' };
    const data = await repo.listHealthByUserId(userId, { date });
    return { code: 200, data };
}

async function createOne(payload) {
    const { user_id, penyakit, waktu } = payload;

    const exists = await repo.ensureUserExists(user_id);
    if (!exists) return { code: 404, error: 'User not found' };

    let waktuSql = undefined;
    if (waktu !== undefined) {
        waktuSql = toMysqlDateTime(waktu);
        if (!waktuSql) return { code: 422, error: 'Invalid "waktu" (must be ISO-8601 datetime)' };
    }

    const cekDup = await repo.existsDuplicateSameDay(user_id, penyakit, waktuSql ?? new Date());
    if (cekDup) return { code: 409, error: 'Duplicate penyakit for this user in the same day' };

    const id = await repo.insertHealth({ user_id, penyakit, waktu: waktuSql });
    const data = await repo.getHealthJoinedById(id);
    return { code: 201, data };
}

module.exports = { listAll, getById, listByUser, createOne };
