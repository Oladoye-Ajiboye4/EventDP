const cloudinary = require('../../config/cloudinary')

const uploadImage = (req, res) => {
    const { userEmail, fileName } = req.body
    const cloudinaryConfig = cloudinary.config()

    if (!userEmail) {
        return res.status(400).json({ status: false, message: 'User email is required' })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const safeName = String(fileName || 'eventdp-image')
        .toLowerCase()
        .replace(/[^a-z0-9-_\.]/g, '-')
        .replace(/\.+/g, '.')

    const publicId = `draft-${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}`
    const folder = `eventdp/${userEmail}/drafts`

    const signature = cloudinary.utils.api_sign_request(
        { folder, public_id: publicId, timestamp },
        cloudinaryConfig.api_secret,
    )

    return res.status(200).json({
        status: true,
        message: 'Upload signature generated',
        data: {
            cloudName: cloudinaryConfig.cloud_name,
            apiKey: cloudinaryConfig.api_key,
            timestamp,
            signature,
            folder,
            publicId,
        },
    })
}

module.exports = uploadImage