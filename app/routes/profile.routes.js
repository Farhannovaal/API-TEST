
const router = require('express').Router();
const { getProfileByUserId, updateProfile: updateProfileHandler } =
    require('../../app/controllers/profile.controller');
const validate = require('../middlewares/validate');
const { updateProfile: updateProfileSchema, idParamSchema } =
    require('../schemas/profile.schema');

router.get('/:id', validate(idParamSchema, 'params'), getProfileByUserId);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateProfileSchema), updateProfileHandler);

module.exports = router;
