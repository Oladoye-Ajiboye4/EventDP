const crypto = require('crypto')
const EventDPDraft = require('../../models/eventDPDraft.model')
const { z } = require('zod')

const publishSchema = z.object({
    editor: z.record(z.string(), z.unknown()).optional(),
    baseRevision: z.number().int().optional(),
    lastClientEditAt: z.string().optional(),
    title: z.string().trim().min(1).max(80).optional(),
    expiresAt: z.string().datetime().optional(),
})

const generateAccessKey = () => crypto.randomBytes(8).toString('base64url').toLowerCase()

const slugifyTitle = (title = 'eventdp-project') => title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'eventdp-project'

const buildPublicUrl = (req, projectSlug, accessKey) => {
    const origin = req.headers.origin
    const fallbackClientUrl = process.env.NODE_ENV === 'production'
        ? `${req.protocol}://${req.get('host')}`
        : 'http://localhost:5173'

    const publicBaseUrl = process.env.PUBLIC_WEB_BASE_URL
        || process.env.CLIENT_BASE_URL
        || origin
        || fallbackClientUrl

    return `${publicBaseUrl.replace(/\/$/, '')}/eventdp/${projectSlug}/${accessKey}`
}

const publishDraft = async (req, res) => {
    try {
        const { draftId } = req.params
        const parsed = publishSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid publish payload',
            })
        }

        const { editor, baseRevision, lastClientEditAt, title, expiresAt } = parsed.data

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        if (Number.isInteger(baseRevision) && baseRevision !== draft.revision) {
            return res.status(409).json({
                status: false,
                message: 'Draft version conflict. Reload latest draft.',
                revision: draft.revision,
            })
        }

        if (editor) {
            draft.editor = editor
        }

        if (title) {
            draft.title = title
        }

        if (!expiresAt) {
            return res.status(400).json({
                status: false,
                message: 'Please set when this public link should expire before publishing.',
            })
        }

        const parsedExpiry = new Date(expiresAt)
        if (Number.isNaN(parsedExpiry.getTime())) {
            return res.status(400).json({ status: false, message: 'Invalid expiry date' })
        }

        const now = new Date()
        if (parsedExpiry <= now) {
            return res.status(400).json({ status: false, message: 'Link expiry must be in the future' })
        }

        const maxAllowedExpiry = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))
        if (parsedExpiry > maxAllowedExpiry) {
            return res.status(400).json({ status: false, message: 'Link expiry cannot exceed 365 days' })
        }

        if (draft.status !== 'published') {
            let accessKey = generateAccessKey()
            let exists = await EventDPDraft.exists({
                $or: [
                    { 'publish.accessKey': accessKey },
                    { 'publish.slug': accessKey },
                ],
            })

            while (exists) {
                accessKey = generateAccessKey()
                exists = await EventDPDraft.exists({
                    $or: [
                        { 'publish.accessKey': accessKey },
                        { 'publish.slug': accessKey },
                    ],
                })
            }

            const projectSlug = slugifyTitle(draft.title || draft.asset?.originalFilename || 'eventdp-project')

            draft.status = 'published'
            draft.publish = {
                slug: accessKey,
                accessKey,
                projectSlug,
                expiresAt: parsedExpiry,
                publicUrl: buildPublicUrl(req, projectSlug, accessKey),
                publishedAt: new Date(),
            }
            draft.history.push({
                action: 'published',
                at: new Date(),
                meta: { accessKey, projectSlug, expiresAt: parsedExpiry.toISOString() },
            })
        } else {
            draft.publish = {
                ...draft.publish,
                expiresAt: parsedExpiry,
                projectSlug: draft.publish?.projectSlug || slugifyTitle(draft.title || draft.asset?.originalFilename || 'eventdp-project'),
                accessKey: draft.publish?.accessKey || draft.publish?.slug,
                slug: draft.publish?.slug || draft.publish?.accessKey,
                publicUrl: buildPublicUrl(
                    req,
                    draft.publish?.projectSlug || slugifyTitle(draft.title || draft.asset?.originalFilename || 'eventdp-project'),
                    draft.publish?.accessKey || draft.publish?.slug,
                ),
            }
        }

        draft.lastClientEditAt = lastClientEditAt ? new Date(lastClientEditAt) : new Date()
        draft.lastServerSaveAt = new Date()
        draft.revision += 1

        await draft.save()

        return res.status(200).json({
            status: true,
            message: 'Draft published successfully',
            draft,
            revision: draft.revision,
            publish: draft.publish,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = publishDraft
