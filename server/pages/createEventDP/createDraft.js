const EventDPDraft = require('../../models/eventDPDraft.model')

const createDraft = async (req, res) => {
    try {
        const { asset, editor } = req.body

        if (!asset?.publicId || !asset?.secureUrl || !asset?.width || !asset?.height) {
            return res.status(400).json({ status: false, message: 'Valid uploaded asset is required' })
        }

        const draft = await EventDPDraft.create({
            userEmail: req.user.email,
            asset: {
                publicId: asset.publicId,
                secureUrl: asset.secureUrl,
                width: Number(asset.width),
                height: Number(asset.height),
                format: asset.format || '',
                bytes: Number(asset.bytes) || 0,
                originalFilename: asset.originalFilename || '',
            },
            editor: editor || {},
            revision: 1,
            lastClientEditAt: new Date(),
            lastServerSaveAt: new Date(),
        })

        return res.status(201).json({
            status: true,
            message: 'Draft created successfully',
            draft,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = createDraft
