module.exports = (role) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next()
    }
    try {
      return req.user.role === role ? next() : res.status(403).json('Доступ закрыт')
    } catch (error) {
      return res.status(401).json('Auth error')
    }
  }
}