const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const Card = require('../models/card');
const NoRightsError = require('../errors/NoRightsError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => next(err));
};
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      }
      next(err);
    });
};
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена'));
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      next(err);
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена'));
      }
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Проверьте введенные данные'));
      }
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const ownerId = req.user._id;
  Card.findById(req.params.cardId)
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((userCard) => {
      if (!userCard.owner.equals(ownerId)) {
        return next(new NoRightsError('Нет прав для удаления карточки'));
      }
      return userCard.remove()
        .then(() => res.status(200).send(userCard));
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
