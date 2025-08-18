const repo = require('../repo/users.repo');

async function list() {
    return repo.findAll();
}

async function get(id) {
    return repo.findById(id);
}

async function create(payload) {
    const id = await repo.insert(payload);
    return repo.findById(id);
}

async function edit(id, payload) {
    await repo.update(id, payload);
    return repo.findById(id);
}

async function destroy(id) {
    const one = await repo.findById(id);
    if (!one) return null;
    await repo.remove(id);
    return one;
}

module.exports = { list, get, create, edit, destroy };
