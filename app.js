const express = require('express');
const { errors } = require('celebrate');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mainRoute = require('./routes/mainRoute');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const {
  regValidation, loginValidation,
} = require('./middlewares/serverValidation');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.post('/signup', regValidation, createUser);
app.post('/signin', loginValidation, login);

app.use(auth);

app.use(mainRoute);

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
