const express = require('express');
const UserController = require('../controllers/user');
const router = express.Router();
const md_auth = require('../middleware/authenticated');
const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});


router.get('/probando', UserController.probando);

//rutas de usuarios.
router.post('/register', UserController.save);
router.post('/login', UserController.login);
//a esta ruta de actualizar solo se puede acceder si hay un usuario autenticado con token
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
//ruta para verificar tokens
router.post('/token', [md_auth.authenticated], UserController.validarToken);

router.get('/user/:userId', UserController.getUser);

module.exports = router;