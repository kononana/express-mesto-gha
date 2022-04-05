const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const Unauthorized = require('../errors/Unauthorized');

const getUsers = (req, res, next) => {
  Users.find({})
    .then((user) => res.status(200).send(user))
    .catch((err) => next(err));
};

const getUserMe = (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => {
      if (!user._id) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Проверьте введенные данные.'));
      } else {
        next(err);
      }
    });
};

const getUserById = (req, res, next) => {
  Users.findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => {
      if (!user._id) {
        next(new NotFoundError('Пользователь не найден'));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Проверьте введенные данные.'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  Users.findOne({ email })
    .then((user) => {
      if (user) {
        next(new ForbiddenError(`Пользователь с таким email ${email} уже зарегистрирован`));
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => Users.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => Users.findOne({ _id: user._id }))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Проверьте введенные данные.'));
      } else if (err.code === 11000) {
        next(new ForbiddenError({ message: err.errorMessage }));
      } else {
        next(err);
      }
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  Users.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      throw new BadRequestError('Проверьте введенные данные');
    })
    .then((user) => {
      if (!user) {
        next(new BadRequestError('Проверьте введенные данные'));
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Проверьте введенные данные'));
      }
      next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new BadRequestError('Проверьте введенные данные');
    })
    .then((user) => {
      if (!user) {
        next(new BadRequestError('Проверьте введенные данные'));
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Проверьте введенные данные'));
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return Users.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.status(200).send({ message: 'Авторизация прошла успешно', token });
    })
    .catch((err) => {
      if (err.message === 'IncorrectEmail') {
        next(new Unauthorized('Неправильный логин или пароль'));
      }
      next(err);
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getUserMe,
};
