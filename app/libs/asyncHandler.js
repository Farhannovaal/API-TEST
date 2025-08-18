// Tidak wajib di Express v5, tapi berguna jika kamu ingin pola eksplisit.
module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
