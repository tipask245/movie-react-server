const { Router } = require('express')
const router = Router()
const { check } = require('express-validator')
const controller = require('./movieController')
const roleMiddleware = require('../middleware/role.middleware')
const authMiddleware = require('../middleware/auth.middleware')
 
router.post('/create', [
  authMiddleware,
  roleMiddleware('admin'),
  check('title', 'Название не может быть пустым').notEmpty(),
  check('type', 'Тип должен быть больше 3-х и меньше 15-и символов').isLength({min: 3, max: 15}),
  check('desc', 'Описание должно быть больше 15 символов').isLength({min: 15}),
  check('rating', 'Рейтинг должен быть больше 1 символа и меньше 3-х').isLength({min: 1, max: 3})
], controller.createMovie)

router.post('/set_rating', authMiddleware, controller.setRating)

router.post('/add_in_list', authMiddleware, controller.addInList)

router.delete('/remove_from_list', authMiddleware, controller.removeFromList)

router.post('/create_review', authMiddleware, controller.createReview)

router.delete('/delete_review', authMiddleware, controller.deleteReview)

router.get('/get', controller.getMovie)

router.get('/get_byid/:_id/:isAuth', controller.getMovieById)

router.get('/search_movie', controller.searchMovie)

module.exports = router