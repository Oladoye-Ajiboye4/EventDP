const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const { z } = require('zod')

const settingsSchema = z.object({
    phone: z.string().trim().max(30).optional(),
    company: z.string().trim().max(80).optional(),
    country: z.string().trim().max(60).optional(),
    bio: z.string().trim().max(300).optional(),
})

const updateSettings = (req, res) => {
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
        const parsed = settingsSchema.safeParse(req.body || {})

        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid settings payload',
            })
        }

        const { phone, company, country, bio } = parsed.data

        if (!email) {
            return res.status(400).json({ status: false, message: "Email is required" })
        }

        userModel.findOneAndUpdate(
            { email },
            {
                phone: phone || '',
                company: company || '',
                country: country || '',
                bio: bio || '',
                updatedAt: new Date(),
            },
            { new: true }
        )
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }

                return res.status(200).json({
                    status: true,
                    message: "Settings updated successfully",
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        company: user.company,
                        country: user.country,
                        bio: user.bio,
                        plan: user.plan,
                        provider: user.provider,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    },
                })
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({ status: false, message: "Internal server error" })
            })
    })
}

module.exports = updateSettings
