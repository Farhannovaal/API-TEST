const repo = require('../repo/tenant.repo');

async function listAll() { return repo.findAll(); }
async function getById(id) { return repo.findById(id); }

async function create(data) {
    return repo.create(data);
}

async function update(id, fields) {
    const exists = await repo.findById(id);
    if (!exists) return null;
    return repo.update(id, fields);
}

async function remove(id) {
    return repo.remove(id);
}

module.exports = { listAll, getById, create, update, remove };
