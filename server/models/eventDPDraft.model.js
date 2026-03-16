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

const eventDPDraftSchema = new mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
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
    revision: { type: Number, default: 1 },
    lastClientEditAt: { type: Date, default: Date.now },
    lastServerSaveAt: { type: Date, default: Date.now },
}, { timestamps: true })

const EventDPDraft = mongoose.model('EventDPDraft', eventDPDraftSchema)

module.exports = EventDPDraft
