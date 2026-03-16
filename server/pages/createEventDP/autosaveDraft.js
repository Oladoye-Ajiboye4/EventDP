const EventDPDraft = require('../../models/eventDPDraft.model')

const autosaveDraft = async (req, res) => {
    try {
        const { draftId } = req.params
        const { editor, baseRevision, lastClientEditAt } = req.body

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

        draft.editor = editor || draft.editor
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
