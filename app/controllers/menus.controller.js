const svc = require('../services/menus.service');

async function listMenusByTenant(req, res, next) {
    try {
        const { data, error } = await svc.listByTenant(+req.params.tenantId);
        if (error) return res.status(404).json({ error });
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

async function createMenu(req, res, next) {
    try {
        const { data, error } = await svc.create(+req.params.tenantId, req.body);
        if (error) {
            const code = error.includes('Duplicate') ? 409 : 404;
            return res.status(code).json({ error });
        }
        res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
}

async function getMenuById(req, res, next) {
    try {
        const { data, error } = await svc.getById(+req.params.id);
        if (error) return res.status(404).json({ error });
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

async function updateMenu(req, res, next) {
    try {
        const { data, error } = await svc.update(+req.params.id, req.body);
        if (error) return res.status(404).json({ error });
        res.json({ success: true, data });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Duplicate SKU' });
        next(e);
    }
}

async function deleteMenu(req, res, next) {
    try {
        const { data, error } = await svc.remove(+req.params.id);
        if (error) return res.status(404).json({ error });
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

module.exports = { listMenusByTenant, createMenu, getMenuById, updateMenu, deleteMenu };
