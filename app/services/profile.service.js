// app/services/profile.service.js
const repo = require('../repo/profile.repo');

async function getProfile(userId, { date } = {}) {
    const exists = await repo.ensureUserExists(userId);
    if (!exists) return { code: 404, error: 'User not found' };

    const rows = await repo.getProfileJoinUserByUserId(userId, date);
    return { code: 200, data: rows[0] || null };
}

async function upsertProfile(userId, payload) {
    const exists = await repo.ensureUserExists(userId);
    if (!exists) return { code: 404, error: 'User not found' };

    const upd = await repo.updateProfileByUserId(userId, payload);

    if (upd.affectedRows === 0) {
        try {
            await repo.insertProfile(userId, payload);
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                await repo.updateProfileByUserId(userId, payload);
            } else {
                throw e;
            }
        }
    }

    const data = await repo.getProfileByUserId(userId);
    return { code: 200, data };
}

module.exports = { getProfile, upsertProfile };
