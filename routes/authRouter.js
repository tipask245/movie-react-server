const { Router } = require('express')
const router = Router()
const controller = require('./authController')
const { check } = require('express-validator')

router.post('/registration', [
  check('username', 'Имя не может быть пустым').notEmpty(),
  check('password', 'Пароль должен быть больше 3-х и меньше 15-и символов').isLength({min: 3, max: 15})
], controller.registration)
router.post('/login', [
  check()
], controller.login)
router.get('/users', controller.getUsers)
router.post('/checkAuth', controller.checkAuth)

module.exports = router
