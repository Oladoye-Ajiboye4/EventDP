const { z } = require('zod')
const EventDPDraft = require('../../models/eventDPDraft.model')

const paramsSchema = z.object({
    draftId: z.string().min(1),
})

const deleteDraft = async (req, res) => {
    try {
        const parsed = paramsSchema.safeParse(req.params)
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid draft id',
            })
        }

        const { draftId } = parsed.data

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })
        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        await EventDPDraft.deleteOne({ _id: draft._id })

        return res.status(200).json({
            status: true,
            message: 'Draft deleted successfully',
            deletedDraftId: String(draft._id),
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = deleteDraft
