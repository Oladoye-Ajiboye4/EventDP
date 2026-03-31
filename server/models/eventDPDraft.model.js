const mongoose = require('mongoose')

const zoneSchema = new mongoose.Schema({
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
}, { _id: false })

const textZoneSchema = new mongoose.Schema({
    actual: { type: zoneSchema, default: null },
    display: { type: zoneSchema, default: null },
}, { _id: false })

const historyEntrySchema = new mongoose.Schema({
    action: { type: String, required: true },
    at: { type: Date, default: Date.now },
    meta: { type: Object, default: {} },
}, { _id: false })

const eventDPDraftSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled Project', trim: true, maxlength: 80, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    asset: {
        publicId: { type: String, required: true },
        secureUrl: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        format: { type: String, default: '' },
        bytes: { type: Number, default: 0 },
        originalFilename: { type: String, default: '' },
    },
    editor: {
        zoneShape: { type: String, default: 'square' },
        committedZone: {
            actual: { type: zoneSchema, default: null },
            display: { type: zoneSchema, default: null },
        },
        textZones: { type: [textZoneSchema], default: [] },
        activeTextZoneIndex: { type: Number, default: null },
        bleedGuides: { type: Boolean, default: true },
        backgroundOpacity: { type: Number, default: 85 },
        cornerRadius: { type: Number, default: 16 },
        borderStyle: { type: String, default: '' },
        snapToGrid: { type: Boolean, default: false },
        allowGuestText: { type: Boolean, default: false },
        activeCanvasTool: { type: String, default: 'photo' },
        guestTextStyle: { type: Object, default: {} },
        zoom: { type: Number, default: 1 },
        activeMenu: { type: String, default: 'template' },
    },
    publish: {
        slug: { type: String, default: '', index: true },
        projectSlug: { type: String, default: '', index: true },
        accessKey: { type: String, default: '', index: true },
        expiresAt: { type: Date, default: null, index: true },
        publicUrl: { type: String, default: '' },
        publishedAt: { type: Date, default: null },
    },
    history: { type: [historyEntrySchema], default: [] },
    revision: { type: Number, default: 1 },
    lastClientEditAt: { type: Date, default: Date.now },
    lastServerSaveAt: { type: Date, default: Date.now },
}, { timestamps: true })

eventDPDraftSchema.index(
    { title: 'text', 'asset.originalFilename': 'text' },
    {
        name: 'title_filename_text_idx',
        weights: { title: 10, 'asset.originalFilename': 4 },
    },
)

const EventDPDraft = mongoose.model('EventDPDraft', eventDPDraftSchema)

module.exports = EventDPDraft
