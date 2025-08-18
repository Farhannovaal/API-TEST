const router = require('express').Router();
const usersRoutes = require('./users.routes');
const healthRoutes = require('./health.routes')
const profileRoutes = require('./profile.routes')
const tenantsRoutes = require('./tenants.route')
const menusRoutes = require('./menus.routes')
const orderRoutes = require('./orders.routes')

router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/profile', profileRoutes);
router.use('/tenants', tenantsRoutes);
router.use('/menus', menusRoutes);
router.use('/order', orderRoutes);
module.exports = router;
