// Requiring modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
//const pool = require('./database');

//ejecutar express.
const app = express();

//configuro morgan, el cual me permite ver por consola las peticiones que hago y el restultado.
app.use(morgan('dev'));

//cargar archivos de rutas.
const user_routes = require('./routes/user');
const movie_routes = require('./routes/movie');
const category_routes = require('./routes/category');
//middleware.
app.use(bodyParser.urlencoded({ extended: false })); //En algunas ocasiones no requerimos utilizar json para enviar datos sino una variante como application/x-www-form-urlencoded. Este es especialmente útil en formularios HTML.
app.use(bodyParser.json()); //instalar body-parser y habilitar json() así como url-encode como middlewares para convertir datos a JSON.

//cors.
app.use(cors({
    origin: '*'
  }));

//reescribir rutas.
app.use('/api', user_routes);
app.use('/api', movie_routes);
app.use('/api', category_routes);


//exportar modulo.
module.exports = app;