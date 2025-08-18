const pool = require('../../app/db/pool');

async function getProfileByUserId(req, res, next) {
    try {
        const userId = +req.params.id;
        const { date } = req.query;

        const params = [userId];
        let where = 'WHERE p.user_id = ?';

        if (date) {
            where += ' AND DATE(p.created_at) = DATE(?)';
            params.push(date);
        }

        const [rows] = await pool.query(
            `SELECT
         p.id, p.user_id, p.birthday, p.address, p.gender, p.job_status,
         p.created_at, p.updated_at,
         u.name AS user_name, u.email AS user_email, u.role AS user_role
       FROM profile p
       JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.created_at DESC`,
            params
        );

        if (rows.length === 0) {
            const [u] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
            if (!u[0]) return res.status(404).json({ error: 'User not found' });
            return res.json({ success: true, data: [] });
        }

        return res.json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
}

function toDateYMD(input) {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

async function updateProfile(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { birthday, address, gender, job_status } = req.body;

        const [[user]] = await pool.query('SELECT id FROM users WHERE id=? LIMIT 1', [userId]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const set = [];
        const params = { userId };

        if (birthday !== undefined) { set.push('birthday = :birthday'); params.birthday = birthday; } // sudah dinormalisasi oleh Joi
        if (address !== undefined) { set.push('address = :address'); params.address = address; }
        if (gender !== undefined) { set.push('gender = :gender'); params.gender = gender; }
        if (job_status !== undefined) { set.push('job_status = :job_status'); params.job_status = job_status; }

        if (!set.length) {
            const [current] = await pool.query(
                `SELECT p.id, p.user_id, p.birthday, p.address, p.gender, p.job_status,
                p.created_at, p.updated_at
           FROM profile p
          WHERE p.user_id = ? LIMIT 1`, [userId]
            );
            return res.json({ success: true, data: current[0] || null });
        }

        const [upd] = await pool.execute(
            `UPDATE profile SET ${set.join(', ')}, updated_at = NOW() WHERE user_id = :userId`,
            params
        );

        if (upd.affectedRows === 0) {
            const cols = ['user_id'];
            const vals = [':userId'];
            if (params.birthday !== undefined) { cols.push('birthday'); vals.push(':birthday'); }
            if (params.address !== undefined) { cols.push('address'); vals.push(':address'); }
            if (params.gender !== undefined) { cols.push('gender'); vals.push(':gender'); }
            if (params.job_status !== undefined) { cols.push('job_status'); vals.push(':job_status'); }

            await pool.execute(
                `INSERT INTO profile (${cols.join(', ')}) VALUES (${vals.join(', ')})`,
                params
            );
        }

        const [row] = await pool.query(
            `SELECT p.id, p.user_id, p.birthday, p.address, p.gender, p.job_status,
              p.created_at, p.updated_at
         FROM profile p
        WHERE p.user_id = ? LIMIT 1`,
            [userId]
        );

        return res.json({ success: true, data: row[0] || null });
    } catch (error) {
        next(error);
    }
}

module.exports = { getProfileByUserId, updateProfile };
