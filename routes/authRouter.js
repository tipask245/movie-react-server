const { Router } = require('express')
const router = Router()
const controller = require('./authController')
const { check } = require('express-validator')
const imgMw = require('../middleware/img.middleware')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/registration', [
  check('username', 'Имя не может быть пустым').notEmpty(),
  check('password', 'Пароль должен быть больше 3-х и меньше 15-и символов').isLength({min: 3, max: 15})
], controller.registration)
router.post('/login', [
  // check()
], controller.login)

router.get('/users', controller.getUsers)

router.post('/checkAuth', controller.checkAuth)

router.post('/getUserInformation', authMiddleware, controller.getUserInformation)

router.post('/upload_image', imgMw.single('avatar'), controller.uploadImage)

module.exports = router
