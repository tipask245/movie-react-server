const { Router } = require('express')
const router = Router()
const Movie = require('../models/Movie')
const { check } = require('express-validator')
const controller = require('./movieController')
const roleMiddleware = require('../middleware/role.middleware')
 
router.post('/create', [
  // roleMiddleware(['admin']),
  check('title', 'Название не может быть пустым').notEmpty(),
  check('type', 'Пароль должен быть больше 3-х и меньше 15-и символов').isLength({min: 3, max: 15}),
  check('desc', 'Описание должно быть больше 15 символов').isLength({min: 15}),
  check('rating', 'Рейтинг должен быть больше 1 символа и меньше 3-х').isLength({min: 1, max: 3})
], controller.createMovie)

router.post('/set_rating', controller.setRating)

// router.post('/set_willWatch', controller.setWillWatch)

// router.post('/set_watched', controller.setWatched)

router.post('/add_in_list', controller.addInList)

router.delete('/remove_from_list', controller.removeFromList)

router.post('/create_review', controller.createReview)

router.delete('/delete_review', controller.deleteReview)

router.get('/get', controller.getMovie)

router.get('/get_byid/:_id/:isAuth', controller.getMovieById)

module.exports = router