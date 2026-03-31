const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const EventDPDraft = require('../models/eventDPDraft.model')

const MAX_HOST_EVENTS = 5

const getSettings = (req, res) => {
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
        userModel.findOne({ email })
            .then(async (user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }

                const usedEvents = await EventDPDraft.countDocuments({ userEmail: email })

                return res.status(200).json({
                    status: true,
                    message: "Settings retrieved successfully",
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
                    storage: {
                        maxEvents: MAX_HOST_EVENTS,
                        usedEvents,
                        remainingEvents: Math.max(0, MAX_HOST_EVENTS - usedEvents),
                    },
                })
            })
            .catch((err) => {
                console.error(err)
                return res.status(500).json({ status: false, message: "Internal server error" })
            })
    })
}

module.exports = getSettings
