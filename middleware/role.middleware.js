const jwt = require('jsonwebtoken')
const { key } = require('../config')

module.exports = (role) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next()
    }
    try {
      const token = req.headers.authorization.split(' ')[1]
      if (!token) {
        return res.status(401).json('Пользователь не авторизован')
      }
      const {role: userRole} = jwt.verify(token, key)
      let hasRole = false
      userRole.forEach(e => {
        if (e.includes(role)) {
          hasRole = true
        }
      });
      if (!hasRole) {
        return res.status(403).json('Доступ закрыт')
      }
      next()
    } catch (error) {
      return res.status(401).json('Auth error')
    }
  }
}