const svc = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { user, token } = await svc.register(req.body);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    if (e.code === 'P2002') return res.status(409).json({ error: 'Email already exists' });
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await svc.login(req.body);
    res.json({ success: true, data: { user, token } });
  } catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    next(e);
  }
}

module.exports = { register, login };
