/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: List health records (joined with users)
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/HealthItem' }
 *   post:
 *     tags: [Health]
 *     summary: Create health record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, penyakit]
 *             properties:
 *               user_id: { type: integer, example: 1 }
 *               penyakit: { type: string, example: "Flu" }
 *               waktu: { type: string, format: date-time, example: "2025-08-18T10:00:00+07:00" }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/HealthItem' }
 * /health/{id}:
 *   get:
 *     tags: [Health]
 *     summary: Get health record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */

const router = require('express').Router();
const { listHealth, getHealthByUserId, createHealth } = require('../controllers/health.controller');
const validate = require('../middlewares/validate');
const { createHealthSchema, idParamSchema } = require('../../app/schemas/health.schema');

router.get('/', listHealth);
router.get('/:id', validate(idParamSchema, 'params'), getHealthByUserId);
router.post('/', validate(createHealthSchema), createHealth);

module.exports = router;
