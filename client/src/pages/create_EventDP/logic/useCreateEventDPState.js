import { useMemo, useState } from 'react'
import { BORDER_STYLES } from '../constants'
import { clamp, fitCanvasToViewport, ZONE_SHAPES } from './canvasMath'
import useHistoryStack from './useHistoryStack'

const createSnapshot = (state) => ({
    zoneShape: state.zoneShape,
    committedZone: state.committedZone,
    bleedGuides: state.bleedGuides,
    backgroundOpacity: state.backgroundOpacity,
    cornerRadius: state.cornerRadius,
    borderStyle: state.borderStyle,
    snapToGrid: state.snapToGrid,
    allowGuestText: state.allowGuestText,
    textZones: state.textZones,
    activeTextZoneIndex: state.activeTextZoneIndex,
    activeCanvasTool: state.activeCanvasTool,
    guestTextStyle: state.guestTextStyle,
    zoom: state.zoom,
})

const DEFAULT_GUEST_TEXT_STYLE = {
    text: 'Add your custom message',
    fontFamily: 'Poppins',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 1.25,
    fontWeight: 700,
    textAlign: 'center',
}

const MAX_TEXT_ZONES = 2

const normalizeTextStyle = (style) => {
    const next = { ...style }
    next.text = String(next.text || '').slice(0, 90)
    next.fontSize = clamp(Number(next.fontSize) || DEFAULT_GUEST_TEXT_STYLE.fontSize, 16, 72)
    next.letterSpacing = clamp(Number(next.letterSpacing) || 0, -1, 12)
    next.lineHeight = clamp(Number(next.lineHeight) || DEFAULT_GUEST_TEXT_STYLE.lineHeight, 0.9, 2)

    const allowedWeights = [400, 500, 600, 700]
    const normalizedWeight = Number(next.fontWeight)
    next.fontWeight = allowedWeights.includes(normalizedWeight)
        ? normalizedWeight
        : DEFAULT_GUEST_TEXT_STYLE.fontWeight

    const allowedAlignments = ['left', 'center', 'right']
    next.textAlign = allowedAlignments.includes(next.textAlign)
        ? next.textAlign
        : DEFAULT_GUEST_TEXT_STYLE.textAlign

    if (!/^#([A-Fa-f0-9]{6})$/.test(String(next.color || ''))) {
        next.color = DEFAULT_GUEST_TEXT_STYLE.color
    }

    return next
}

const useCreateEventDPState = () => {
    const [uploadedImage, setUploadedImage] = useState(null)
    const [zoneShape, setZoneShape] = useState('square')
    const [committedZone, setCommittedZone] = useState(null)
    const [textZones, setTextZones] = useState([])
    const [activeTextZoneIndex, setActiveTextZoneIndex] = useState(null)
    const [bleedGuides, setBleedGuides] = useState(true)
    const [backgroundOpacity, setBackgroundOpacity] = useState(85)
    const [cornerRadius, setCornerRadius] = useState(16)
    const [borderStyle, setBorderStyle] = useState(BORDER_STYLES[1].id)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [allowGuestText, setAllowGuestText] = useState(false)
    const [activeCanvasTool, setActiveCanvasTool] = useState('photo')
    const [guestTextStyle, setGuestTextStyle] = useState(DEFAULT_GUEST_TEXT_STYLE)
    const [previewMode, setPreviewMode] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [activeMenu, setActiveMenu] = useState('template')

    const {
        canUndo,
        canRedo,
        pushState,
        undo,
        redo,
    } = useHistoryStack(createSnapshot({
        zoneShape,
        committedZone,
        bleedGuides,
        backgroundOpacity,
        cornerRadius,
        borderStyle,
        snapToGrid,
        allowGuestText,
        textZones,
        activeTextZoneIndex,
        activeCanvasTool,
        guestTextStyle,
        zoom,
    }))

    // Canvas dimensions come entirely from the uploaded image; if no image, a sensible default.
    const canvasDimensions = useMemo(() => {
        if (uploadedImage?.width && uploadedImage?.height) {
            return { width: uploadedImage.width, height: uploadedImage.height }
        }
        return { width: 1080, height: 1920 }
    }, [uploadedImage])

    const displayedCanvasSize = useMemo(() => {
        return fitCanvasToViewport({
            canvasWidth: canvasDimensions.width,
            canvasHeight: canvasDimensions.height,
            viewportWidth: 340,
            viewportHeight: 610,
            zoom,
        })
    }, [canvasDimensions, zoom])

    const persistSnapshot = (overrides = {}) => {
        pushState(createSnapshot({
            zoneShape,
            committedZone,
            bleedGuides,
            backgroundOpacity,
            cornerRadius,
            borderStyle,
            snapToGrid,
            allowGuestText,
            textZones,
            activeTextZoneIndex,
            activeCanvasTool,
            guestTextStyle,
            zoom,
            ...overrides,
        }))
    }

    const selectZoneShape = (shape) => {
        setZoneShape(shape)
        setCommittedZone(null)   // clear existing zone when shape type changes
        persistSnapshot({ zoneShape: shape })
    }

    const handleZoneCommit = (zone) => {
        setCommittedZone(zone)
    }

    const handleTextZoneCommit = (zone) => {
        const hasActiveZone = Number.isInteger(activeTextZoneIndex)
            && activeTextZoneIndex >= 0
            && activeTextZoneIndex < textZones.length

        let nextZones = textZones
        let nextActiveIndex = activeTextZoneIndex

        if (hasActiveZone) {
            nextZones = textZones.map((item, index) => (
                index === activeTextZoneIndex ? zone : item
            ))
        } else if (textZones.length < MAX_TEXT_ZONES) {
            nextZones = [...textZones, zone]
            nextActiveIndex = nextZones.length - 1
        } else {
            return
        }

        setTextZones(nextZones)
        setActiveTextZoneIndex(nextActiveIndex)
        persistSnapshot({
            textZones: nextZones,
            activeTextZoneIndex: nextActiveIndex,
        })
    }

    const clearCommittedZone = () => {
        setCommittedZone(null)
    }

    const clearTextZone = (zoneIndex = activeTextZoneIndex) => {
        if (!Number.isInteger(zoneIndex) || zoneIndex < 0 || zoneIndex >= textZones.length) {
            return
        }

        const nextZones = textZones.filter((_, index) => index !== zoneIndex)
        const nextActiveIndex = nextZones.length === 0
            ? null
            : Math.min(zoneIndex, nextZones.length - 1)

        setTextZones(nextZones)
        setActiveTextZoneIndex(nextActiveIndex)
        persistSnapshot({
            textZones: nextZones,
            activeTextZoneIndex: nextActiveIndex,
        })
    }

    const setOpacity = (value) => {
        const normalized = clamp(value, 25, 100)
        setBackgroundOpacity(normalized)
        persistSnapshot({ backgroundOpacity: normalized })
    }

    const setRadius = (value) => {
        const normalized = clamp(value, 0, 52)
        setCornerRadius(normalized)
        persistSnapshot({ cornerRadius: normalized })
    }

    const setZoomLevel = (nextZoom) => {
        const normalized = clamp(nextZoom, 0.5, 1.8)
        setZoom(normalized)
        persistSnapshot({ zoom: normalized })
    }

    const handleImageUpload = (file) => {
        if (!file) {
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                setUploadedImage({
                    src: reader.result,
                    width: img.width,
                    height: img.height,
                    name: file.name,
                    file,
                })
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    }

    const removeUploadedImage = () => {
        setUploadedImage(null)
    }

    const toggleGuestText = () => {
        const next = !allowGuestText
        const nextTool = next ? activeCanvasTool : 'photo'
        const nextTextZones = next ? textZones : []
        const nextActiveTextZoneIndex = next ? activeTextZoneIndex : null

        setAllowGuestText(next)
        setActiveCanvasTool(nextTool)
        if (!next) {
            setTextZones([])
            setActiveTextZoneIndex(null)
        }

        persistSnapshot({
            allowGuestText: next,
            activeCanvasTool: nextTool,
            textZones: nextTextZones,
            activeTextZoneIndex: nextActiveTextZoneIndex,
        })
    }

    const addTextZone = () => {
        if (textZones.length >= MAX_TEXT_ZONES) {
            return
        }

        const nextActiveIndex = textZones.length
        setActiveCanvasTool('text')
        setActiveTextZoneIndex(nextActiveIndex)
        persistSnapshot({
            activeCanvasTool: 'text',
            activeTextZoneIndex: nextActiveIndex,
        })
    }

    const selectTextZone = (zoneIndex) => {
        if (!Number.isInteger(zoneIndex) || zoneIndex < 0 || zoneIndex >= textZones.length) {
            return
        }

        setActiveTextZoneIndex(zoneIndex)
        setActiveCanvasTool('text')
        persistSnapshot({
            activeTextZoneIndex: zoneIndex,
            activeCanvasTool: 'text',
        })
    }

    const selectCanvasTool = (tool) => {
        const normalized = tool === 'text' && allowGuestText ? 'text' : 'photo'
        const nextActiveTextZoneIndex = normalized === 'photo'
            ? activeTextZoneIndex
            : (Number.isInteger(activeTextZoneIndex) ? activeTextZoneIndex : (textZones.length > 0 ? 0 : null))

        setActiveCanvasTool(normalized)
        setActiveTextZoneIndex(nextActiveTextZoneIndex)
        persistSnapshot({
            activeCanvasTool: normalized,
            activeTextZoneIndex: nextActiveTextZoneIndex,
        })
    }

    const updateGuestTextStyle = (updates) => {
        const nextStyle = normalizeTextStyle({
            ...guestTextStyle,
            ...updates,
        })
        setGuestTextStyle(nextStyle)
        persistSnapshot({ guestTextStyle: nextStyle })
    }

    const restoreFromSnapshot = (snapshot) => {
        if (!snapshot) {
            return
        }
        setZoneShape(snapshot.zoneShape)
        setCommittedZone(snapshot.committedZone || null)
        setBleedGuides(snapshot.bleedGuides)
        setBackgroundOpacity(snapshot.backgroundOpacity)
        setCornerRadius(snapshot.cornerRadius)
        setBorderStyle(snapshot.borderStyle)
        setSnapToGrid(snapshot.snapToGrid)
        setAllowGuestText(Boolean(snapshot.allowGuestText))
        const snapshotTextZones = Array.isArray(snapshot.textZones)
            ? snapshot.textZones.slice(0, MAX_TEXT_ZONES)
            : []
        const hasSnapshotActiveIndex = Number.isInteger(snapshot.activeTextZoneIndex)
            && snapshot.activeTextZoneIndex >= 0
            && snapshot.activeTextZoneIndex < snapshotTextZones.length

        setTextZones(snapshotTextZones)
        setActiveTextZoneIndex(hasSnapshotActiveIndex ? snapshot.activeTextZoneIndex : null)
        setActiveCanvasTool(snapshot.activeCanvasTool || 'photo')
        setGuestTextStyle(normalizeTextStyle(snapshot.guestTextStyle || DEFAULT_GUEST_TEXT_STYLE))
        setZoom(snapshot.zoom)
    }

    const toggleBleedGuides = () => {
        const next = !bleedGuides
        setBleedGuides(next)
        persistSnapshot({ bleedGuides: next })
    }

    const changeBorderStyle = (nextBorderStyle) => {
        setBorderStyle(nextBorderStyle)
        persistSnapshot({ borderStyle: nextBorderStyle })
    }

    const toggleSnapToGrid = () => {
        const next = !snapToGrid
        setSnapToGrid(next)
        persistSnapshot({ snapToGrid: next })
    }

    const handleUndo = () => {
        const snapshot = undo()
        restoreFromSnapshot(snapshot)
    }

    const handleRedo = () => {
        const snapshot = redo()
        restoreFromSnapshot(snapshot)
    }

    const draftSnapshot = useMemo(() => ({
        zoneShape,
        committedZone,
        textZones,
        activeTextZoneIndex,
        bleedGuides,
        backgroundOpacity,
        cornerRadius,
        borderStyle,
        snapToGrid,
        allowGuestText,
        activeCanvasTool,
        guestTextStyle,
        zoom,
        activeMenu,
    }), [
        zoneShape,
        committedZone,
        textZones,
        activeTextZoneIndex,
        bleedGuides,
        backgroundOpacity,
        cornerRadius,
        borderStyle,
        snapToGrid,
        allowGuestText,
        activeCanvasTool,
        guestTextStyle,
        zoom,
        activeMenu,
    ])

    return {
        activeMenu,
        setActiveMenu,
        // zone selection
        zoneShape,
        selectZoneShape,
        committedZone,
        handleZoneCommit,
        clearCommittedZone,
        textZones,
        activeTextZoneIndex,
        selectedTextZone: Number.isInteger(activeTextZoneIndex) ? textZones[activeTextZoneIndex] || null : null,
        handleTextZoneCommit,
        clearTextZone,
        addTextZone,
        selectTextZone,
        maxTextZones: MAX_TEXT_ZONES,
        zoneShapes: ZONE_SHAPES,
        // frame settings
        bleedGuides,
        toggleBleedGuides,
        backgroundOpacity,
        setOpacity,
        cornerRadius,
        setRadius,
        borderStyle,
        changeBorderStyle,
        snapToGrid,
        toggleSnapToGrid,
        allowGuestText,
        toggleGuestText,
        activeCanvasTool,
        selectCanvasTool,
        guestTextStyle,
        updateGuestTextStyle,
        previewMode,
        setPreviewMode,
        zoom,
        setZoomLevel,
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,
        uploadedImage,
        handleImageUpload,
        removeUploadedImage,
        canvasDimensions,
        displayedCanvasSize,
        draftSnapshot,
    }
}

export default useCreateEventDPState