/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserCreate' }
 *     responses:
 *       201: { description: Created }
 *       409:
 *         description: Duplicate email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 */

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
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
 *       404: { description: Not found }
 *   put:
 *     tags: [Users]
 *     summary: Update user by ID
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
 *           schema: { $ref: '#/components/schemas/UserUpdate' }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *       409:
 *         description: Duplicate email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidationError' }
 *   delete:
 *     tags: [Users]
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */



const router = require('express').Router();

const { listUsers, createUser, getUserById, updateUser, deleteUser } =
    require('../controllers/users.controller');

const validate = require('../middlewares/validate');

const { createUserSchema, updateUserSchema, idParamSchema } =
    require('../../app/schemas/user.schema');

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);

router.get('/:id', validate(idParamSchema, 'params'), getUserById);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUser);
router.delete('/:id', validate(idParamSchema, 'params'), deleteUser);

module.exports = router;
