const svc = require('../services/order.service');

async function createOrder(req, res, next) {
    try {
        const { data, error } = await svc.createOrder(req.body);
        if (error) return res.status(400).json({ error });
        res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
}

async function getOrder(req, res, next) {
    try {
        const { data, error } = await svc.getOrder(+req.params.id);
        if (error) return res.status(404).json({ error });
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

async function listOrders(req, res, next) {
    try {
        const { data } = await svc.listOrders(req.query);
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

async function cancelOrder(req, res, next) {
    try {
        const { data, error } = await svc.cancelOrder(+req.params.id);
        if (error) return res.status(400).json({ error });
        res.json({ success: true, data });
    } catch (e) { next(e); }
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
