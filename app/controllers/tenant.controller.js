const svc = require('../services/tenant.service');

async function listTenants(req, res, next) {
    try { res.json({ success: true, data: await svc.listAll() }); }
    catch (e) { next(e); }
}

async function getTenantById(req, res, next) {
    try {
        const row = await svc.getById(+req.params.id);
        if (!row) return res.status(404).json({ error: 'Tenant not found' });
        res.json({ success: true, data: row });
    } catch (e) { next(e); }
}

async function createTenant(req, res, next) {
    try {
        const row = await svc.create(req.body);
        res.status(201).json({ success: true, data: row });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Duplicate code' });
        next(e);
    }
}

async function updateTenant(req, res, next) {
    try {
        const row = await svc.update(+req.params.id, req.body);
        if (!row) return res.status(404).json({ error: 'Tenant not found' });
        res.json({ success: true, data: row });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Duplicate code' });
        next(e);
    }
}

async function deleteTenant(req, res, next) {
    try {
        const row = await svc.remove(+req.params.id);
        if (!row) return res.status(404).json({ error: 'Tenant not found' });
        res.json({ success: true, data: row });
    } catch (e) { next(e); }
}

module.exports = { listTenants, getTenantById, createTenant, updateTenant, deleteTenant };
