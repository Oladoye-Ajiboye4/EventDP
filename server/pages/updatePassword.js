const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { z } = require('zod')

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long').max(64),
})

const updatePassword = (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ status: false, message: "Authorization header is missing" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ status: false, message: "Token is missing" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
            return res.status(401).json({ status: false, message: "Token is expired or invalid" })
        }

        const email = result.email
        const parsed = passwordSchema.safeParse(req.body || {})

        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid password payload',
            })
        }

        const { currentPassword, newPassword } = parsed.data

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ status: false, message: "Email, current password, and new password are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ status: false, message: "New password must be at least 6 characters long" })
        }

        userModel.findOne({ email })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }

                // Check if user is a manual signin user
                if (user.provider !== 'manual') {
                    return res.status(403).json({ status: false, message: "Password reset is not available for social login users" })
                }

                const isMatch = bcrypt.compareSync(currentPassword, user.password)
                if (!isMatch) {
                    return res.status(401).json({ status: false, message: "Current password is incorrect" })
                }

                const hashedPassword = bcrypt.hashSync(newPassword, 10)
                userModel.findOneAndUpdate(
                    { email },
                    {
                        password: hashedPassword,
                        updatedAt: new Date(),
                    },
                    { new: true }
                )
                    .then((updatedUser) => {
                        return res.status(200).json({
                            status: true,
                            message: "Password updated successfully",
                            user: {
                                _id: updatedUser._id,
                                username: updatedUser.username,
                                email: updatedUser.email,
                                provider: updatedUser.provider,
                            },
                        })
                    })
                    .catch((updateErr) => {
                        console.error(updateErr)
                        return res.status(500).json({ status: false, message: "Error updating password" })
                    })
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({ status: false, message: "Internal server error" })
            })
    })
}

module.exports = updatePassword
