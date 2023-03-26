const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { validationResult } = require('express-validator')
const { key } = require('../config')

const db = require('../sqlDB')

const genAccessToken = (id, role) => {
  const payload = {
    id,
    role
  }
  return jwt.sign(payload, key, {expiresIn: '50m'})
}

class authController {

  async registration(req, res) {
    try {
      const validationErrors = validationResult(req)
      if (!validationErrors.isEmpty()) {
        res.status(400).json(validationErrors)
      }
      const {username, password} = req.body
      const candidate = await db.query('SELECT username FROM users WHERE username = $1', [username])
      console.log(candidate.rows, candidate.rows.length > 0);
      if (candidate.rows.length > 0) {
        return res.status(400).json('Пользователь уже существует')
      }
      const hashPassword = bcrypt.hashSync(password, 8)
      await db.query(`INSERT INTO users (username, password, role) values ($1, $2, $3)`, [username, hashPassword, 'user'])
      return res.json('Пользователь успешно зарегистрирован')
    } catch (error) {
      console.log(error)
      res.status(400).json({message: 'registration error'})
    }
  }

  async login(req, res) {
    try {
      const {username, password} = req.body
      const user = await db.query('SELECT * FROM users WHERE username = $1', [username])
      if (!user.rowCount) {
        return res.status(400).json('Пользователь не найден')
      }
      const validPassword = bcrypt.compareSync(password, user.rows[0].password)
      if (!validPassword) {
        return res.status(400).json('Неверный пароль')
      }
      const token = genAccessToken(user.rows[0].id, user.rows[0].role)
      const willWatch = await db.query(`SELECT movies.id, movies.img, movies.title, movies.rating FROM ((users INNER JOIN will_watch ON users.id = will_watch.user_id) INNER JOIN movies ON will_watch.film_id = movies.id) WHERE users.username = $1;`, [username])
      const watched = await db.query('SELECT movies.id, movies.img, movies.title, movies.rating FROM ((users INNER JOIN watched on users.id = watched.user_id) INNER JOIN movies on watched.film_id = movies.id) WHERE users.username = $1;', [username])
      const marks = await db.query('SELECT movies.id, movies.img, movies.title, movies.rating, marks.mark FROM ((users INNER JOIN marks on users.id = marks.user_id) INNER JOIN movies on marks.film_id = movies.id) WHERE users.username = $1;', [username])
      const reviews = await db.query('SELECT movies.id AS film_id, movies.img, movies.title, movies.rating, reviews.id, reviews.title AS review_title, reviews.body AS review_body FROM ((users INNER JOIN reviews on users.id = reviews.user_id) INNER JOIN movies on reviews.film_id = movies.id) WHERE users.username = $1;', [username])
      let data = {
        id: user.rows[0].id,
        token: token,
        role: user.rows[0].role,
        // isUser: false,
        userInf: {
          username: user.rows[0].username,
          avatar: user.rows[0].avatar,
          reviews: reviews.rows.reverse(),
          marks: marks.rows.reverse(),
          will_watch: willWatch.rows.reverse(),
          watched: watched.rows.reverse()
        }
      }

      return res
        // .cookie('token', token, { httpOnly: true })
        .json(data)
    } catch (error) {
      console.log(error)
      res.status(400).json({message: 'login error'})
    }
  }

  async getUserInformation(req, res) {
    try{
      const userId = req.user.id
      console.log(req.user);
      const user = await db.query('SELECT username, avatar FROM users WHERE id = $1', [userId])
      const willWatch = await db.query(`SELECT movies.id, movies.img, movies.title, movies.rating FROM ((users INNER JOIN will_watch ON users.id = will_watch.user_id) INNER JOIN movies ON will_watch.film_id = movies.id) WHERE users.id = $1;`, [userId])
      const watched = await db.query('SELECT movies.id, movies.img, movies.title, movies.rating FROM ((users INNER JOIN watched on users.id = watched.user_id) INNER JOIN movies on watched.film_id = movies.id) WHERE users.id = $1;', [userId])
      const marks = await db.query('SELECT movies.id, movies.img, movies.title, movies.rating, marks.mark FROM ((users INNER JOIN marks on users.id = marks.user_id) INNER JOIN movies on marks.film_id = movies.id) WHERE users.id = $1;', [userId])
      const reviews = await db.query('SELECT movies.id AS film_id, movies.img, movies.title, movies.rating, reviews.id, reviews.title AS review_title, reviews.body AS review_body FROM ((users INNER JOIN reviews on users.id = reviews.user_id) INNER JOIN movies on reviews.film_id = movies.id) WHERE users.id = $1;', [userId])
      console.log(watched.rows);
      let data = {
        userInf: {
          username: user.rows[0].username,
          avatar: user.rows[0].avatar,
          reviews: reviews.rows.reverse(),
          marks: marks.rows.reverse(),
          will_watch: willWatch.rows.reverse(),
          watched: watched.rows.reverse()
        },
        isUser: false
      }
      console.log(data);
      // if (JSON.stringify(user._id).slice(1, -1) === payload.id) {
      //   data.isUser = true
      // }

      return res.json(data)
    } catch(e) {
      console.log(e);
      return res.status(403).json('token error')
    }
    
  }

  async getUsers(req, res) {
    try {
      // ? сделать 
      res.json('ok')
    } catch (error) {
      throw error
    }
  }

  async checkAuth(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const isUserAuth = jwt.verify(token, key)
      res.json(isUserAuth)
    } catch (e) {
      res.status(403).json('token error')
    }
  }

  async uploadImage(req, res) {
    try {
      const username = req.headers.username
      // console.log(req.headers.username);
      // User.findOne({username}, async (err, result) => {
      //   //удалить предыдущую картинку
      //   // fs.unlinkSync(`images/${result.avatar.split('\\')[1]}`)
      //   // console.log(result.avatar.split('\\')[1])
      //   result.avatar = req.file.path
      //   await result.save()
      // })
      await db.query('UPDATE users SET avatar = $1 WHERE username = $2;', [req.file.path, username])
      return res.json(req.file.path)
    } catch(e) {
      throw e
    }
  }
}

module.exports = new authController()