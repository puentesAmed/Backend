const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(require('./middlewares/error'));

// rutas
app.use('/auth', require('./routes/auth.routes'));
app.use('/users', require('./routes/user.routes'));
app.use('/items', require('./routes/item.routes'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

module.exports = app;
