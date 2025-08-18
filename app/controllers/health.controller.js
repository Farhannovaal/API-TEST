const svc = require('../services/health.service');

async function listHealth(req, res, next) {
    try {
        const out = await svc.listAll();
        return res.status(out.code).json({ success: true, data: out.data });
    } catch (e) { next(e); }
}

async function getHealthById(req, res, next) {
    try {
        const id = Number(req.params.id);
        const out = await svc.getById(id);
        if (out.error) return res.status(out.code).json({ error: out.error });
        return res.status(out.code).json({ success: true, data: out.data });
    } catch (e) { next(e); }
}

async function getHealthByUserId(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { date } = req.query;
        const out = await svc.listByUser(userId, { date });
        if (out.error) return res.status(out.code).json({ error: out.error });
        return res.status(out.code).json({ success: true, data: out.data });
    } catch (e) { next(e); }
}

async function createHealth(req, res, next) {
    try {
        const out = await svc.createOne(req.body);
        if (out.error) return res.status(out.code).json({ error: out.error });
        return res.status(out.code).json({ success: true, data: out.data });
    } catch (e) { next(e); }
}

module.exports = { listHealth, getHealthById, getHealthByUserId, createHealth };
