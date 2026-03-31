const EventDPDraft = require('../../models/eventDPDraft.model')
const { z } = require('zod')

const autosaveSchema = z.object({
    editor: z.record(z.string(), z.unknown()).optional(),
    baseRevision: z.number().int().optional(),
    lastClientEditAt: z.string().optional(),
    title: z.string().trim().min(1).max(80).optional(),
})

const autosaveDraft = async (req, res) => {
    try {
        const { draftId } = req.params
        const parsed = autosaveSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid autosave payload',
            })
        }

        const { editor, baseRevision, lastClientEditAt, title } = parsed.data

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        if (draft.status === 'published') {
            return res.status(409).json({
                status: false,
                message: 'Published EventDP is locked for editing',
            })
        }

        if (Number.isInteger(baseRevision) && baseRevision !== draft.revision) {
            return res.status(409).json({
                status: false,
                message: 'Draft version conflict. Reload latest draft.',
                revision: draft.revision,
            })
        }

        draft.editor = editor || draft.editor
        if (title) {
            draft.title = title
        }
        draft.lastClientEditAt = lastClientEditAt ? new Date(lastClientEditAt) : new Date()
        draft.lastServerSaveAt = new Date()
        draft.revision += 1

        await draft.save()

        return res.status(200).json({
            status: true,
            message: 'Draft autosaved',
            revision: draft.revision,
            lastServerSaveAt: draft.lastServerSaveAt,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = autosaveDraft
