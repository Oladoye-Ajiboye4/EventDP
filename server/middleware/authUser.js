const jwt = require('jsonwebtoken')

const authUser = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: false, message: 'Authorization token is missing' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err || !payload?.email) {
            return res.status(401).json({ status: false, message: 'Token is invalid or expired' })
        }

        req.user = payload
        next()
    })
}

module.exports = authUser
