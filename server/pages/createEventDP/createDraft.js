const EventDPDraft = require('../../models/eventDPDraft.model')
const { z } = require('zod')

const MAX_HOST_EVENTS = 5

const createDraftSchema = z.object({
    title: z.string().trim().min(1).max(80).optional(),
    asset: z.object({
        publicId: z.string().min(1),
        secureUrl: z.string().min(1),
        width: z.coerce.number().positive(),
        height: z.coerce.number().positive(),
        format: z.string().optional(),
        bytes: z.coerce.number().nonnegative().optional(),
        originalFilename: z.string().optional(),
    }),
    editor: z.record(z.string(), z.unknown()).optional(),
})

const createDraft = async (req, res) => {
    try {
        const parsed = createDraftSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid draft payload',
            })
        }

        const { title, asset, editor } = parsed.data

        const existingEventsCount = await EventDPDraft.countDocuments({ userEmail: req.user.email })
        if (existingEventsCount >= MAX_HOST_EVENTS) {
            return res.status(403).json({
                status: false,
                message: `You have reached your storage limit of ${MAX_HOST_EVENTS} EventDP projects. Delete an existing one to create a new project.`,
                limit: MAX_HOST_EVENTS,
                used: existingEventsCount,
            })
        }

        if (!asset?.publicId || !asset?.secureUrl || !asset?.width || !asset?.height) {
            return res.status(400).json({ status: false, message: 'Valid uploaded asset is required' })
        }

        const draft = await EventDPDraft.create({
            userEmail: req.user.email,
            title: title || asset.originalFilename || 'Untitled Project',
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
            history: [
                {
                    action: 'created',
                    at: new Date(),
                    meta: {},
                },
            ],
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
