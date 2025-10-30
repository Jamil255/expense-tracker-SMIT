const jwt = require('jsonwebtoken')

function getToken(req) {
  const auth = req.headers.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  if (req.cookies && req.cookies.token) return req.cookies.token
  return null
}

function authRequired(req, res, next) {
  const token = getToken(req)
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')
    req.user = { id: payload.id }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = { authRequired }
