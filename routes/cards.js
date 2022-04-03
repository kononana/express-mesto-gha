const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  createCardValid,
} = require('../middlewares/serverValidation');
const {
  getCards,
  createCard,
  likeCard,
  dislikeCard,
  deleteCard,
} = require('../controllers/cards');

router.get('/', auth, getCards);
router.post('/', auth, createCardValid, createCard);
router.delete('/:cardId', auth, deleteCard);
router.put('/:cardId/likes', auth, likeCard);
router.delete('/:cardId/likes', auth, dislikeCard);

module.exports = router;
