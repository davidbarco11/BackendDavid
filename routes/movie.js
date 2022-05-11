const express = require('express');
const MovieController = require('../controllers/movie');
const router = express.Router();
const md_auth = require('../middleware/authenticated');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/movies'});


//rutas de peliculas solo se puede acceder si hay un usuario autenticado con token.
router.post('/createMovie',[md_auth.authenticated], MovieController.save);

//a esta ruta de actualizar solo se puede acceder si hay un usuario autenticado con token
router.put('/updateMovie/:movieId', md_auth.authenticated, MovieController.update);
router.post('/upload-image/:movieId', [md_auth.authenticated, md_upload], MovieController.uploadImage);
router.get('/image/:fileName', MovieController.image);
router.get('/video/:fileName', MovieController.video);
router.get('/movies', MovieController.getMovies);
router.get('/movie/:movieId', MovieController.getMovie);

//ruta para sacar las peliculas por id de la categoria.
router.get('/movie-category/:categoryId', MovieController.getMovieCategory);

module.exports = router;