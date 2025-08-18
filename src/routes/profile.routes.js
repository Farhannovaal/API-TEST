// app/routes/profile.routes.js
/**
 * @openapi
 * /profile/{id}:
 *   get:
 *     tags: [Profile]
 *     summary: Get profile by user id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200: { description: OK }
 *       404: { description: User not found }
 *   put:
 *     tags: [Profile]
 *     summary: Update profile by user id (partial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *     responses:
 *       200: { description: OK }
 *       404: { description: User not found }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
const router = require('express').Router();
const { getProfileByUserId, updateProfile: updateProfileHandler } =
    require('../controllers/profile.controller');
const validate = require('../middlewares/validate');
const { updateProfile: updateProfileSchema, idParamSchema } =
    require('../../app/schemas/profile.schema');

router.get('/:id', validate(idParamSchema, 'params'), getProfileByUserId);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateProfileSchema), updateProfileHandler);

module.exports = router;
