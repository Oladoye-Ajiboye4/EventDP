const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const getDashboard = (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        console.log('Authorization header', authHeader)
        return res.status(401).json({ status: false, message: "Authorization header is missing" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ status: false, message: "Token is missing" })
    }

    jwt.verify(token, "secretkey", (err, result) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ status: false, message: "Token is expired or invalid" })
        }

        console.log(result);
        const email = result.email
        userModel.findOne({ email })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }
                res.status(200).json({ status: true, message: "Token is valid", user })
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ status: false, message: "Internal server error" })
            })
    });
}

module.exports = getDashboard