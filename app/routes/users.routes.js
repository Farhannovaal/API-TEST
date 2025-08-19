const router = require('express').Router();

const { listUsers, createUser, getUserById, updateUser, deleteUser } =
    require('../../app/controllers/users.controller');

const validate = require('../middlewares/validate');

const { createUserSchema, updateUserSchema, idParamSchema } =
    require('../schemas/user.schema');

router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);

router.get('/:id', validate(idParamSchema, 'params'), getUserById);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), updateUser);
router.delete('/:id', validate(idParamSchema, 'params'), deleteUser);

module.exports = router;
