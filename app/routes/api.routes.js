const router = require('express').Router();
const usersRoutes = require('./users.routes');
const healthRoutes = require('./health.routes')
const profileRoutes = require('./profile.routes')

router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/profile', profileRoutes)
module.exports = router;
