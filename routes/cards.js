const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  createCardValid, checkCardId,
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
router.put('/:cardId/likes', auth, checkCardId, likeCard);
router.delete('/:cardId', auth, checkCardId, deleteCard);
router.delete('/:cardId/likes', auth, checkCardId, dislikeCard);

module.exports = router;
