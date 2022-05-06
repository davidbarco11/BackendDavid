// Requiring modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
//const pool = require('./database');

//ejecutar express.
const app = express();

//confiro morgan, el cual me permite ver por consola las peticiones que hago y el restultado.
app.use(morgan('dev'));

//cargar archivos de rutas.
const user_routes = require('./routes/user');
const movie_routes = require('./routes/movie');
const category_routes = require('./routes/category');
//middleware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cors.

//reescribir rutas.
app.use('/api', user_routes);
app.use('/api', movie_routes);
app.use('/api', category_routes);


//exportar modulo.
module.exports = app;