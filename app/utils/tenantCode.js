// app/utils/tenantCode.js
const crypto = require('crypto');

function randomCode(length = 12) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const buf = crypto.randomBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) out += alphabet[buf[i] % alphabet.length];
    return out;
}

async function generateUniqueTenantCode(repo, { length = 12, prefix = '', maxAttempts = 10 } = {}) {
    for (let i = 0; i < maxAttempts; i++) {
        const candidate = (prefix + randomCode(length)).toUpperCase();
        const exists = await repo.findByCode(candidate);
        if (!exists) return candidate;
    }
    throw new Error('Failed to generate unique tenant code');
}

module.exports = { generateUniqueTenantCode };
