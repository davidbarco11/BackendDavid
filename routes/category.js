const express = require('express');
const CategoryController = require('../controllers/category');
const router = express.Router();
const md_auth = require('../middleware/authenticated');

//rutas de peliculas solo se puede acceder si hay un usuario autenticado con token.
router.post('/createCategory',[md_auth.authenticated], CategoryController.save);

//a esta ruta de actualizar solo se puede acceder si hay un usuario autenticado con token
router.put('/updateCategory/:categoryId', md_auth.authenticated, CategoryController.update);
router.get('/categories', CategoryController.getCategories);
router.get('/category/:categoryId', CategoryController.getCategory);

module.exports = router;