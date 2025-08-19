const repo = require('../repo/prisma/tenant.prisma')
const { generateUniqueTenantCode } = require('../utils/tenantCode');

const httpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

function normalizeTenantPayload(input = {}) {
    const out = {};
    if (input.name !== undefined) out.name = String(input.name).trim();
    if (input.address !== undefined) out.address = String(input.address).trim();
    if (input.phone !== undefined) out.phone = String(input.phone).trim();
    return out;
}

async function listAll() {
    try { return await repo.findAll(); }
    catch (err) { console.error('[TenantService:listAll] Error:', err); throw err; }
}

async function getById(id) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) throw httpError(422, 'Invalid id');
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

        const existingByName = await repo.findByName(payload.name);
        if (existingByName) throw httpError(409, 'Name already exists');

        const code = await generateUniqueTenantCode(repo, { length: 20 });
        const row = await repo.create({ ...payload, code });
        return row;
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            if (String(err.sqlMessage || '').includes('uq_tenants_name')) {
                throw httpError(409, 'Name already exists');
            }
            if (String(err.sqlMessage || '').includes('uq_tenants_code')) {
                throw httpError(409, 'Code already exists');
            }
        }
        console.error('[TenantService:create] Error:', { data }, err);
        throw err;
    }
}

async function update(id, fields) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) throw httpError(422, 'Invalid id');

        const exists = await repo.findById(numId);
        if (!exists) throw httpError(404, 'Tenant not found');

        const payload = normalizeTenantPayload(fields);

        if ('code' in payload) delete payload.code;

        if (payload.name) {
            const dup = await repo.findByName(payload.name);
            if (dup && dup.id !== numId) throw httpError(409, 'Name already exists');
        }

        if (Object.keys(payload).length === 0) return exists;

        const updated = await repo.update(numId, payload);
        return updated;
    } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            if (String(err.sqlMessage || '').includes('uq_tenants_name')) {
                throw httpError(409, 'Name already exists');
            }
            if (String(err.sqlMessage || '').includes('uq_tenants_code')) {
                throw httpError(409, 'Code already exists');
            }
        }
        console.error('[TenantService:update] Error:', { id, fields }, err);
        throw err;
    }
}

async function remove(id) {
    try {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) throw httpError(422, 'Invalid id');

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
