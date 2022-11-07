const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const { key } = require('../config')

const genAccessToken = (id, role) => {
  const payload = {
    id,
    role
  }
  return jwt.sign(payload, key, {expiresIn: '1h'})
}

class authController {
  async registration(req, res) {
    try {
      const validationErrors = validationResult(req)
      if (!validationErrors.isEmpty()) {
        res.status(400).json(validationErrors)
      }
      const {username, password} = req.body
      const candidate = await User.findOne({username})
      if (candidate) {
        res.status(400).json('Пользователь уже существует')
      }
      const hashPassword = bcrypt.hashSync(password, 8)
      const userRole = await Role.findOne({value: 'user'})
      const user = new User({username, password: hashPassword, role: [userRole.value]})
      await user.save()
      res.json('Пользователь успешно зарегистрирован')
    } catch (error) {
      console.log(error)
      res.status(400).json({message: 'registration error'})
    }
  }

  async login(req, res) {
    try {
      const {username, password} = req.body
      const user = await User.findOne({username})
      if (!user) {
        return res.status(400).json('Пользователь не найден')
      }
      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json('Неверный пароль')
      }
      const token = genAccessToken(user._id, user.role)
      let data = {
        id: user._id,
        token: token,
        role: user.role,
        // isUser: false,
        userInf: {
          username: user.username,
          avatar: user.avatar,
          reviews: user.reviews,
          marks: user.marks,
          willWatch: user.willWatch,
          watched: user.watched
        }
      }
      // if (JSON.stringify(user._id).slice(1, -1) === payload.id) {
      //   data.isUser = true
      // }
      if (validPassword) {
        return res
          // .cookie('token', token, { httpOnly: true })
          .json(data)
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({message: 'login error'})
    }
  }

  async getUserInformation(req, res) {
    try{
      // console.log(req);
      const userId = req.body.id
      const user = await User.findById(userId)
      const token = req.headers.authorization.split(' ')[1]
      const payload = jwt.verify(token, key)
      let data = {
        userInf: {
          username: user.username,
          avatar: user.avatar,
          reviews: user.reviews.reverse(),
          marks: user.marks.reverse(),
          willWatch: user.willWatch.reverse(),
          watched: user.watched.reverse()
        },
        isUser: false
      }
      if (JSON.stringify(user._id).slice(1, -1) === payload.id) {
        data.isUser = true
      }
      return res.json(data)
    } catch {
      return res.status(403).json('token error')
    }
    
  }

  async getUsers(req, res) {
    try {
      // const userRole = new Role()
      // const adminRole = new Role({value: 'admin'})
      // await userRole.save()
      // await adminRole.save()
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

  uploadImage(req, res) {
    try {
      const username = req.headers.username
      console.log(req.headers.username);
      User.findOne({username}, async (err, result) => {
        result.avatar = req.file.path
        await result.save()
      })
      console.log(req.file);
      return res.json(req.file.path)
    } catch(e) {
      throw e
    }
  }
}

module.exports = new authController()