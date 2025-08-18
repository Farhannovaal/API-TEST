const svc = require('../services/payments.service');

async function listByOrder(req, res, next) {
    try {
        const orderId = +req.params.orderId;
        const rows = await svc.listByOrder(orderId);
        res.json({ success: true, data: rows });
    } catch (e) { next(e); }
}

async function createForOrder(req, res, next) {
    try {
        const orderId = +req.params.orderId;
        const row = await svc.createForOrder(orderId, req.body);
        res.status(201).json({ success: true, data: row });
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try {
        const id = +req.params.id;
        const row = await svc.getById(id);
        res.json({ success: true, data: row });
    } catch (e) { next(e); }
}

async function capture(req, res, next) {
    try {
        const id = +req.params.id;
        const row = await svc.capture(id, req.body);
        res.json({ success: true, data: row });
    } catch (e) { next(e); }
}

async function fail(req, res, next) {
    try {
        const id = +req.params.id;
        const row = await svc.fail(id, req.body);
        res.json({ success: true, data: row });
    } catch (e) { next(e); }
}

module.exports = { listByOrder, createForOrder, getById, capture, fail };
