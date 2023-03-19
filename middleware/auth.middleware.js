const jwt = require('jsonwebtoken')
const { key } = require('../config')

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }

  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(401).json('Auth error')
    }
    const decodedData = jwt.verify(token, key)
    req.user = decodedData
    return next()
  } catch (error) {
    return res.status(401).json('Auth error')
  }
}