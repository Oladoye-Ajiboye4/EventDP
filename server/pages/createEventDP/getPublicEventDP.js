const EventDPDraft = require('../../models/eventDPDraft.model')

const getPublicEventDP = async (req, res) => {
    try {
        const { slug, accessKey } = req.params
        const resolvedKey = accessKey || slug

        if (!resolvedKey) {
            return res.status(400).json({ status: false, message: 'Public link key is required' })
        }

        const draft = await EventDPDraft.findOne({
            status: 'published',
            $or: [
                { 'publish.accessKey': resolvedKey },
                { 'publish.slug': resolvedKey },
            ],
        }).select('title asset editor publish status createdAt updatedAt')

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        if (draft.publish?.expiresAt && new Date(draft.publish.expiresAt) <= new Date()) {
            return res.status(410).json({
                status: false,
                message: 'This EventDP link has expired. Please contact the host for a new link.',
            })
        }

        const eventDP = {
            _id: draft._id,
            title: draft.title,
            status: draft.status,
            asset: {
                secureUrl: draft.asset?.secureUrl,
                width: draft.asset?.width,
                height: draft.asset?.height,
                originalFilename: draft.asset?.originalFilename,
            },
            editor: {
                zoneShape: draft.editor?.zoneShape,
                committedZone: draft.editor?.committedZone,
                textZones: draft.editor?.textZones,
                allowGuestText: draft.editor?.allowGuestText,
                guestTextStyle: draft.editor?.guestTextStyle,
            },
            publish: {
                publicUrl: draft.publish?.publicUrl,
                publishedAt: draft.publish?.publishedAt,
                expiresAt: draft.publish?.expiresAt,
            },
            createdAt: draft.createdAt,
            updatedAt: draft.updatedAt,
        }

        return res.status(200).json({
            status: true,
            message: 'Published EventDP fetched successfully',
            eventDP,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = getPublicEventDP
