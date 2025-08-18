const menuRepo = require('../repo/menus.repo');
const tenantRepo = require('../repo/tenant.repo');

async function listByTenant(tenantId) {
    const t = await tenantRepo.findById(tenantId);
    if (!t) return { error: 'Tenant not found' };
    const rows = await menuRepo.listByTenant(tenantId);
    return { data: rows };
}

async function create(tenantId, payload) {
    const t = await tenantRepo.findById(tenantId);
    if (!t) return { error: 'Tenant not found' };
    try {
        const row = await menuRepo.create(tenantId, payload);
        return { data: row };
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return { error: 'Duplicate SKU for the same tenant' };
        throw e;
    }
}

async function getById(id) {
    const row = await menuRepo.findById(id);
    if (!row) return { error: 'Menu not found' };
    return { data: row };
}

async function update(id, fields) {
    const row = await menuRepo.update(id, fields);
    if (!row) return { error: 'Menu not found' };
    return { data: row };
}

async function remove(id) {
    const row = await menuRepo.remove(id);
    if (!row) return { error: 'Menu not found' };
    return { data: row };
}

module.exports = { listByTenant, create, getById, update, remove };
