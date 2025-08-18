const svc = require('../services/users.service');

async function listUsers(req, res, next) {
    try { res.json({ success: true, data: await svc.list() }); }
    catch (e) { next(e); }
}

async function createUser(req, res, next) {
    try { res.status(201).json({ success: true, data: await svc.create(req.body) }); }
    catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
        next(e);
    }
}

async function getUserById(req, res, next) {
    try {
        const one = await svc.get(+req.params.id);
        if (!one) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: one });
    } catch (e) { next(e); }
}

async function updateUser(req, res, next) {
    try {
        const one = await svc.edit(+req.params.id, req.body);
        if (!one) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: one });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
        next(e);
    }
}

async function deleteUser(req, res, next) {
    try {
        const one = await svc.destroy(+req.params.id);
        if (!one) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, data: one });
    } catch (e) { next(e); }
}

module.exports = { listUsers, createUser, getUserById, updateUser, deleteUser };
