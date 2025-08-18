const repo = require('../repo/tenant.repo');

function httpError(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function asId(input) {
    const id = Number(input);
    if (!Number.isInteger(id) || id <= 0) {
        throw httpError('Invalid "id" (must be positive integer)', 422);
    }
    return id;
}

function sanitizePayload(data = {}) {
    const out = {};
    if (data.name !== undefined) out.name = String(data.name).trim();
    if (data.code !== undefined) out.code = String(data.code).trim();
    if (data.address !== undefined) out.address = String(data.address).trim();
    if (data.phone !== undefined) out.phone = String(data.phone).trim();
    return out;
}

function validateCode(code) {
    if (!/^[A-Za-z0-9\-_]{3,50}$/.test(code)) {
        throw httpError('"code" must be 3-50 chars, alnum/dash/underscore', 422);
    }
}

function validateCreate(payload) {
    if (!payload.name) throw httpError('"name" is required', 422);
    if (!payload.code) throw httpError('"code" is required', 422);
    validateCode(payload.code);
}

function validateUpdate(payload) {
    if (payload.code !== undefined) validateCode(payload.code);
}

async function listAll() {
    try {
        return await repo.findAll();
    } catch (e) {
        console.error('[TenantService:listAll] error:', e);
        throw e;
    }
}

async function getById(id) {
    try {
        const tenantId = asId(id);
        const row = await repo.findById(tenantId);
        return row || null;
    } catch (e) {
        console.error('[TenantService:getById] error:', e);
        throw e;
    }
}

async function create(data) {
    try {
        const payload = sanitizePayload(data);
        validateCreate(payload);

        if (typeof repo.findByCode === 'function') {
            const dup = await repo.findByCode(payload.code);
            if (dup) throw httpError('Code already exists', 409);
        }

        const newId = await repo.create(payload);
        if (Number.isInteger(newId)) {
            return await repo.findById(newId);
        }
        return newId;
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') {
            console.error('[TenantService:create] duplicate code:', e);
            throw httpError('Code already exists', 409);
        }
        console.error('[TenantService:create] error:', e);
        throw e;
    }
}

async function update(id, fields) {
    try {
        const tenantId = asId(id);
        const exists = await repo.findById(tenantId);
        if (!exists) return null;

        const patch = sanitizePayload(fields);
        if (!Object.keys(patch).length) return exists;

        validateUpdate(patch);

        if (patch.code && typeof repo.findByCodeExceptId === 'function') {
            const dup = await repo.findByCodeExceptId(patch.code, tenantId);
            if (dup) throw httpError('Code already exists', 409);
        }

        await repo.update(tenantId, patch);
        return await repo.findById(tenantId);
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') {
            console.error('[TenantService:update] duplicate code:', e);
            throw httpError('Code already exists', 409);
        }
        console.error('[TenantService:update] error:', e);
        throw e;
    }
}

async function remove(id) {
    try {
        const tenantId = asId(id);
        const exists = await repo.findById(tenantId);
        if (!exists) return null;

        return await repo.remove(tenantId);
    } catch (e) {
        console.error('[TenantService:remove] error:', e);
        throw e;
    }
}

module.exports = { listAll, getById, create, update, remove };
