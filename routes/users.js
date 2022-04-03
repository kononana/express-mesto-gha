const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  userValidation,
} = require('../middlewares/serverValidation');

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');

router.get('/', auth, getUsers);
router.get('/me', auth, getUserMe);
router.get('/:userId', auth, getUserById);
router.patch('/me', auth, userValidation, updateUser);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
