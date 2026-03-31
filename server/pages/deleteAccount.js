const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { z } = require('zod')
const userModel = require('../models/user.model')
const EventDPDraft = require('../models/eventDPDraft.model')

const deleteAccountSchema = z.object({
    currentPassword: z.string().min(6).optional(),
})

const deleteAccount = async (req, res) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ status: false, message: 'Authorization header is missing' })
        }

        const token = authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ status: false, message: 'Token is missing' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const parsed = deleteAccountSchema.safeParse(req.body || {})

        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid delete account payload',
            })
        }

        const { currentPassword } = parsed.data
        const email = decoded.email

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' })
        }

        if (user.provider === 'manual') {
            if (!currentPassword) {
                return res.status(400).json({ status: false, message: 'Current password is required to delete account' })
            }

            const passwordMatch = bcrypt.compareSync(currentPassword, user.password)
            if (!passwordMatch) {
                return res.status(401).json({ status: false, message: 'Current password is incorrect' })
            }
        }

        await Promise.all([
            EventDPDraft.deleteMany({ userEmail: email }),
            userModel.deleteOne({ _id: user._id }),
        ])

        return res.status(200).json({
            status: true,
            message: 'Account deleted successfully',
        })
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: 'Token is expired or invalid' })
        }

        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = deleteAccount
