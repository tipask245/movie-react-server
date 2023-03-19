const { validationResult } = require('express-validator')
const db = require('../sqlDB')

class movieController {

  async createMovie(req, res) {
    console.log(req)
    const {img, title, desc, type, rating} = req.body
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors)
    }  
    await db.query('INSERT INTO movies (img, title, content, item_type, rating, origin_rating) values($1, $2, $3, $4)', [img, title, desc, type, rating, rating])
    res.json(req.body)
  }

  async createReview(req, res) {
    // const validationErrors = validationResult(req)
    // if (!validationErrors.isEmpty()) {
    //   res.status(400).json(validationErrors)
    // }  
    
    const filmId = Number(req.body.id)
    const userId = req.user.id
    // console.log(typeof userId);
    const {reviewTitle, reviewBody} = req.body.review
    const reviewId = (await db.query('INSERT INTO reviews(user_id, film_id, title, body) values($1, $2, $3, $4) RETURNING id', [userId, filmId, reviewTitle, reviewBody])).rows[0].id
    console.log(reviewId);
    const resultReview = (await db.query('SELECT reviews.id, movies.img, movies.title, movies.rating, reviews.title AS review_title, reviews.body AS review_body FROM ((users INNER JOIN reviews on users.id = reviews.user_id) INNER JOIN movies on reviews.film_id = movies.id) WHERE reviews.id = $1;', [reviewId])).rows[0]
    const reviewForFilm = (await db.query('SELECT users.username, reviews.id, reviews.title, reviews.body FROM ((users INNER JOIN reviews on users.id = reviews.user_id) INNER JOIN movies on reviews.film_id = movies.id) WHERE reviews.id = $1;', [reviewId])).rows[0]

    return res.json({filmData: reviewForFilm, userData: resultReview})
  }

  async getMovie(req, res) {
    try {
      const {limit, page, sort} = req.query
      const totalDocs = Number((await db.query('SELECT COUNT(*) FROM movies')).rows[0].count)
      const totalPages = Math.ceil(totalDocs / limit)
      let result = []
      if (sort) {
        const sortQuery = sort.split('-') 
        console.log(sortQuery);
        result = (await db.query(`SELECT * FROM movies ORDER BY ${sortQuery.length > 1 ? `rating ${sortQuery[1]}, id ${sortQuery[1]}` : `title ${sortQuery[0]}`} LIMIT $1 OFFSET $2`, [limit, (page - 1) * limit])).rows
        return res.json({docs: result, totalDocs, totalPages})
      } else {
        result = (await db.query('SELECT * FROM movies ORDER BY id ASC LIMIT $1 OFFSET $2', [limit, (page - 1) * limit])).rows
        res.json({docs: result, totalDocs, totalPages})
      }
    } catch(e) {
      console.log(e)
    }
    
  }

  async getMovieById(req, res) {
    try {
      const {_id} = req.params
      const result = (await db.query('SELECT * FROM movies WHERE id = $1', [_id])).rows[0]
      result.reviews = (await db.query('SELECT reviews.id, reviews.title, reviews.body, users.username FROM (users INNER JOIN reviews on users.id = reviews.user_id) WHERE film_id = $1', [_id])).rows
      
      return res.json({...result})
      
    } catch(e) {
      console.log(e)
    }
  }

  async searchMovie(req, res) {
    try {
      const reg = new RegExp(req.query.search)
      const movies = (await db.query(`SELECT id, img, title, item_type, rating FROM movies WHERE title ~~* '%${req.query.search}%' LIMIT 5`)).rows
      console.log(reg);
     
      if (!movies.length) {
        console.log(123);
        return res.json('not found')
      }

      return res.json(movies)
      // поиск по регулярному выражению, полученному из инпута поиска. хук useDebounce на клиенте
    } catch(e) {
      console.log(e)
      return res.json('error search')
    }
  }

  async setRating(req, res) {
    try {
      const userId = req.user.id
      const {id, mark} = req.body

      const originRating = (await db.query('SELECT origin_rating FROM movies WHERE id = $1', [id])).rows[0].origin_rating
      console.log(originRating)
      const isFilmRatedLater = (await db.query('SELECT * FROM marks WHERE user_id = $1 AND film_id = $2', [userId, id])).rows

      isFilmRatedLater.length > 0
      ? await db.query('UPDATE marks SET mark = $1 WHERE film_id = $2 AND user_id = $3', [mark, id, userId]) 
      : await db.query('INSERT INTO marks (user_id, film_id, mark) values ($1, $2, $3)', [userId, id, mark])

      const allFilmMarks = (await db.query('SELECT mark FROM marks WHERE film_id = $1', [id])).rows
      console.log(allFilmMarks);
      let count = 1
      let sum = Number(originRating)

      allFilmMarks.forEach(el => {
        sum += Number(el.mark)
        count++
      })

      const resRating = (sum / count) % 1 === 0 ? (sum / count) : (sum / count).toFixed(1)
      console.log(resRating);
      await db.query('UPDATE movies SET rating = $1 WHERE id = $2', [resRating, id])

      const userData = (await db.query('SELECT id, img, title, item_type, rating FROM movies WHERE id = $1', [id])).rows[0]
      userData.mark = mark
      return res.json({rating: resRating, userData})
    } catch(e) {
      console.log(e);
    }
   
  }

  async addInList(req, res) {
    try {
      const { listName, id } = req.body
      const userId = req.user.id
      await db.query(`INSERT INTO ${listName} (user_id, film_id) values (${userId} , ${id});`)
      const result = (await db.query(`SELECT movies.id, movies.img, movies.title, movies.rating FROM ((users INNER JOIN ${listName} ON users.id = ${listName}.user_id) INNER JOIN movies ON ${listName}.film_id = movies.id) WHERE users.id = ${userId};`)).rows
      
      return res.json(result.reverse())
    } catch(e) {
      console.log('error', e);
      return res.status(400).json('add in list error')
    }
  }

  async removeFromList(req, res) {
    try{
      const { listName, id } = req.body
      const userId = req.user.id

      await db.query(`DELETE FROM ${listName} WHERE user_id = ${userId} AND film_id = ${id}`)

      if (listName === 'marks') {
        const allMarks = (await db.query('SELECT mark FROM marks WHERE id = $1', [id])).rows
        let sum = Number((await db.query('SELECT origin_rating FROM movies WHERE id = $1', [id])).rows[0].origin_rating)
        let count = 1
        allMarks.forEach(el => {
          sum += el.mark
          count++
        })
        const newRating = (sum / count) % 1 === 0 ? (sum / count) : (sum / count).toFixed(1)
        await db.query('UPDATE movies SET rating = $1 WHERE id = $2', [newRating, id])
      }
      return res.json('remove ok')
    } catch (e) {
      console.log(e);
      return res.status(400).json('remove error')
    }
  }

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.body
      // const userId = req.user.id
      await db.query('DELETE FROM reviews WHERE id = $1', [reviewId])
      return res.json("review deleted")
    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = new movieController()