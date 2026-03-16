const EventDPDraft = require('../../models/eventDPDraft.model')

const getDraft = async (req, res) => {
    try {
        const { draftId } = req.params
        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        return res.status(200).json({
            status: true,
            message: 'Draft fetched successfully',
            draft,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = getDraft
