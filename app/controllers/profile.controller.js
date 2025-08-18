// app/controllers/profile.controller.js
const svc = require('../services/profile.service');

async function getProfileByUserId(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { date } = req.query;
        const out = await svc.getProfile(userId, { date });
        if (out.error) return res.status(out.code).json({ error: out.error });
        return res.status(out.code).json({ success: true, data: out.data ?? [] });
    } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const out = await svc.upsertProfile(userId, req.body); // body sudah tervalidasi & dinormalisasi oleh Joi
        if (out.error) return res.status(out.code).json({ error: out.error });
        return res.status(out.code).json({ success: true, data: out.data });
    } catch (err) { next(err); }
}

module.exports = { getProfileByUserId, updateProfile };
