const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const manualSignin = (req, res) => {

    const { email, password } = req.body
    const user = { email, password }

    userModel.findOne({ email })
        .then((result) => {
            if (!result) {
                return res.status(404).json({ message: 'User with this email was not found', userData: result })
            }

            const isMatch = bcrypt.compareSync(password, result.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password', userData: result })
            }

            const token = jwt.sign({ email: result.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({
                message: "Login Successful",
                user: {
                    id: result._id,
                    email: result.email,
                    username: result.username,
                    token: token
                }
            })
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
}

module.exports = manualSignin