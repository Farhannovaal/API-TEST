const repo = require('../repo/tenant.repo');

/* Helpers */
const httpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

function normalizeTenantPayload(input = {}) {
    const out = {};
    if (input.name !== undefined) out.name = String(input.name).trim();
    if (input.code !== undefined) out.code = String(input.code).trim().toUpperCase(); // konsisten UPPER
    if (input.address !== undefined) out.address = String(input.address).trim();
    if (input.phone !== undefined) out.phone = String(input.phone).trim();
    return out;
}

function isValidCode(code) {
    return /^[A-Z0-9\-_]+$/.test(code);
}


async function listAll() {
    try {
        const rows = await repo.findAll();
        return rows;
    } catch (err) {
        console.error('[TenantService:listAll] Error:', err);
        throw err;
    }
}

async function getById(id) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            throw httpError(422, 'Invalid id');
        }

        const row = await repo.findById(numId);
        if (!row) throw httpError(404, 'Tenant not found');
        return row;
    } catch (err) {
        console.error('[TenantService:getById] Error:', { id }, err);
        throw err;
    }
}

async function create(data) {
    try {
        const payload = normalizeTenantPayload(data);

        if (!payload.name) throw httpError(422, '"name" is required');
        if (!payload.code) throw httpError(422, '"code" is required');

        if (!isValidCode(payload.code)) {
            throw httpError(422, '"code" must be alphanumeric (A-Z, 0-9), dash (-) or underscore (_), no spaces');
        }

        if (typeof repo.findByCode === 'function') {
            const dup = await repo.findByCode(payload.code);
            if (dup) throw httpError(409, 'Code already exists');
        }

        const createdId = await repo.create(payload);
        const created = await repo.findById(createdId);
        return created;
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            console.error('[TenantService:create] Duplicate code at DB layer:', err);
            throw httpError(409, 'Code already exists');
        }
        console.error('[TenantService:create] Error:', { data }, err);
        throw err;
    }
}

async function update(id, fields) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            throw httpError(422, 'Invalid id');
        }

        const exists = await repo.findById(numId);
        if (!exists) throw httpError(404, 'Tenant not found');

        const payload = normalizeTenantPayload(fields);
        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return exists;
        }

        if (payload.code !== undefined && !isValidCode(payload.code)) {
            throw httpError(422, '"code" must be alphanumeric (A-Z, 0-9), dash (-) or underscore (_), no spaces');
        }

        if (payload.code && typeof repo.findByCode === 'function') {
            const dup = await repo.findByCode(payload.code);
            if (dup && dup.id !== numId) {
                throw httpError(409, 'Code already exists');
            }
        }

        await repo.update(numId, payload);

        const updated = await repo.findById(numId);
        return updated;
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            console.error('[TenantService:update] Duplicate code at DB layer:', { id, fields }, err);
            throw httpError(409, 'Code already exists');
        }
        console.error('[TenantService:update] Error:', { id, fields }, err);
        throw err;
    }
}

/** Remove tenant */
async function remove(id) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            throw httpError(422, 'Invalid id');
        }

        const exists = await repo.findById(numId);
        if (!exists) throw httpError(404, 'Tenant not found');

        await repo.remove(numId);
        return exists;
    } catch (err) {
        console.error('[TenantService:remove] Error:', { id }, err);
        throw err;
    }
}

module.exports = { listAll, getById, create, update, remove };
