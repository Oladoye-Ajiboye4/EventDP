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
    fontSizeUnit: 'px',
    color: '#FFFFFF',
    letterSpacing: 0,
    letterSpacingUnit: 'px',
    lineHeight: 1.25,
    lineHeightUnit: 'unitless',
    fontWeight: 700,
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    textAlign: 'center',
}

const MAX_TEXT_ZONES = 2

const DEFAULT_EDITOR_STATE = {
    zoneShape: 'square',
    committedZone: null,
    textZones: [],
    activeTextZoneIndex: null,
    bleedGuides: true,
    backgroundOpacity: 85,
    cornerRadius: 16,
    borderStyle: BORDER_STYLES[1].id,
    snapToGrid: false,
    allowGuestText: false,
    activeCanvasTool: 'photo',
    guestTextStyle: DEFAULT_GUEST_TEXT_STYLE,
    zoom: 1,
    activeMenu: 'template',
}

const normalizeTextStyle = (style) => {
    const next = { ...style }
    next.text = String(next.text || '').slice(0, 90)

    const allowedSizeUnits = ['px', 'pt']
    next.fontSizeUnit = allowedSizeUnits.includes(next.fontSizeUnit)
        ? next.fontSizeUnit
        : DEFAULT_GUEST_TEXT_STYLE.fontSizeUnit

    const allowedSpacingUnits = ['px', 'pt']
    next.letterSpacingUnit = allowedSpacingUnits.includes(next.letterSpacingUnit)
        ? next.letterSpacingUnit
        : DEFAULT_GUEST_TEXT_STYLE.letterSpacingUnit

    const allowedLineHeightUnits = ['unitless', 'px', 'pt']
    next.lineHeightUnit = allowedLineHeightUnits.includes(next.lineHeightUnit)
        ? next.lineHeightUnit
        : DEFAULT_GUEST_TEXT_STYLE.lineHeightUnit

    const parsedFontSize = Number.parseFloat(next.fontSize)
    next.fontSize = clamp(
        Number.isFinite(parsedFontSize) ? parsedFontSize : DEFAULT_GUEST_TEXT_STYLE.fontSize,
        0,
        next.fontSizeUnit === 'pt' ? 180 : 240,
    )

    const parsedLetterSpacing = Number.parseFloat(next.letterSpacing)
    next.letterSpacing = clamp(
        Number.isFinite(parsedLetterSpacing) ? parsedLetterSpacing : DEFAULT_GUEST_TEXT_STYLE.letterSpacing,
        -4,
        24,
    )

    const parsedLineHeight = Number.parseFloat(next.lineHeight)
    if (next.lineHeightUnit === 'unitless') {
        next.lineHeight = clamp(
            Number.isFinite(parsedLineHeight) ? parsedLineHeight : DEFAULT_GUEST_TEXT_STYLE.lineHeight,
            0.6,
            4,
        )
    } else {
        next.lineHeight = clamp(
            Number.isFinite(parsedLineHeight) ? parsedLineHeight : 24,
            next.lineHeightUnit === 'pt' ? 6 : 8,
            next.lineHeightUnit === 'pt' ? 220 : 300,
        )
    }

    const normalizedWeight = Math.round(Number(next.fontWeight) || DEFAULT_GUEST_TEXT_STYLE.fontWeight)
    next.fontWeight = clamp(normalizedWeight, 100, 900)

    const allowedFontStyles = ['normal', 'italic']
    next.fontStyle = allowedFontStyles.includes(next.fontStyle)
        ? next.fontStyle
        : DEFAULT_GUEST_TEXT_STYLE.fontStyle

    const allowedDecorations = ['none', 'underline', 'line-through']
    next.textDecoration = allowedDecorations.includes(next.textDecoration)
        ? next.textDecoration
        : DEFAULT_GUEST_TEXT_STYLE.textDecoration

    const allowedTransforms = ['none', 'uppercase', 'lowercase', 'capitalize']
    next.textTransform = allowedTransforms.includes(next.textTransform)
        ? next.textTransform
        : DEFAULT_GUEST_TEXT_STYLE.textTransform

    const allowedAlignments = ['left', 'center', 'right']
    next.textAlign = allowedAlignments.includes(next.textAlign)
        ? next.textAlign
        : DEFAULT_GUEST_TEXT_STYLE.textAlign

    if (!/^#([A-Fa-f0-9]{6})$/.test(String(next.color || ''))) {
        next.color = DEFAULT_GUEST_TEXT_STYLE.color
    }

    return next
}

const getZoneStyle = (zone, fallbackStyle = DEFAULT_GUEST_TEXT_STYLE) => {
    return normalizeTextStyle(zone?.style || fallbackStyle)
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
            const activeZoneStyle = getZoneStyle(textZones[activeTextZoneIndex], guestTextStyle)
            nextZones = textZones.map((item, index) => (
                index === activeTextZoneIndex
                    ? {
                        ...zone,
                        style: activeZoneStyle,
                    }
                    : item
            ))
        } else if (textZones.length < MAX_TEXT_ZONES) {
            nextZones = [...textZones, {
                ...zone,
                style: normalizeTextStyle(guestTextStyle),
            }]
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
        const nextStyle = Number.isInteger(nextActiveIndex)
            ? getZoneStyle(nextZones[nextActiveIndex], guestTextStyle)
            : normalizeTextStyle(DEFAULT_GUEST_TEXT_STYLE)

        setTextZones(nextZones)
        setActiveTextZoneIndex(nextActiveIndex)
        setGuestTextStyle(nextStyle)
        persistSnapshot({
            textZones: nextZones,
            activeTextZoneIndex: nextActiveIndex,
            guestTextStyle: nextStyle,
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

        const nextStyle = getZoneStyle(textZones[zoneIndex], guestTextStyle)
        setActiveTextZoneIndex(zoneIndex)
        setActiveCanvasTool('text')
        setGuestTextStyle(nextStyle)
        persistSnapshot({
            activeTextZoneIndex: zoneIndex,
            activeCanvasTool: 'text',
            guestTextStyle: nextStyle,
        })
    }

    const selectCanvasTool = (tool) => {
        const normalized = tool === 'text' && allowGuestText ? 'text' : 'photo'
        const nextActiveTextZoneIndex = normalized === 'photo'
            ? activeTextZoneIndex
            : (Number.isInteger(activeTextZoneIndex) ? activeTextZoneIndex : (textZones.length > 0 ? 0 : null))
        const nextStyle = Number.isInteger(nextActiveTextZoneIndex) && nextActiveTextZoneIndex < textZones.length
            ? getZoneStyle(textZones[nextActiveTextZoneIndex], guestTextStyle)
            : guestTextStyle

        setActiveCanvasTool(normalized)
        setActiveTextZoneIndex(nextActiveTextZoneIndex)
        setGuestTextStyle(nextStyle)
        persistSnapshot({
            activeCanvasTool: normalized,
            activeTextZoneIndex: nextActiveTextZoneIndex,
            guestTextStyle: nextStyle,
        })
    }

    const updateGuestTextStyle = (updates) => {
        const nextStyle = normalizeTextStyle({
            ...guestTextStyle,
            ...updates,
        })

        const hasActiveZone = Number.isInteger(activeTextZoneIndex)
            && activeTextZoneIndex >= 0
            && activeTextZoneIndex < textZones.length

        const nextZones = hasActiveZone
            ? textZones.map((zone, index) => (
                index === activeTextZoneIndex
                    ? {
                        ...zone,
                        style: nextStyle,
                    }
                    : zone
            ))
            : textZones

        if (hasActiveZone) {
            setTextZones(nextZones)
        }

        setGuestTextStyle(nextStyle)
        persistSnapshot({
            guestTextStyle: nextStyle,
            textZones: nextZones,
        })
    }

    const restoreFromSnapshot = (snapshot) => {
        const safeSnapshot = {
            ...DEFAULT_EDITOR_STATE,
            ...(snapshot || {}),
        }

        setZoneShape(safeSnapshot.zoneShape)
        setCommittedZone(safeSnapshot.committedZone || null)
        setBleedGuides(Boolean(safeSnapshot.bleedGuides))
        setBackgroundOpacity(clamp(Number(safeSnapshot.backgroundOpacity), 25, 100))
        setCornerRadius(clamp(Number(safeSnapshot.cornerRadius), 0, 52))
        setBorderStyle(safeSnapshot.borderStyle || DEFAULT_EDITOR_STATE.borderStyle)
        setSnapToGrid(Boolean(safeSnapshot.snapToGrid))
        setAllowGuestText(Boolean(safeSnapshot.allowGuestText))
        const normalizedSnapshotStyle = normalizeTextStyle(safeSnapshot.guestTextStyle || DEFAULT_GUEST_TEXT_STYLE)
        const snapshotTextZones = Array.isArray(safeSnapshot.textZones)
            ? safeSnapshot.textZones
                .slice(0, MAX_TEXT_ZONES)
                .map((zone) => ({
                    ...(zone || {}),
                    style: getZoneStyle(zone, normalizedSnapshotStyle),
                }))
            : []
        const hasSnapshotActiveIndex = Number.isInteger(safeSnapshot.activeTextZoneIndex)
            && safeSnapshot.activeTextZoneIndex >= 0
            && safeSnapshot.activeTextZoneIndex < snapshotTextZones.length
        const nextActiveIndex = hasSnapshotActiveIndex ? safeSnapshot.activeTextZoneIndex : null
        const nextGuestTextStyle = Number.isInteger(nextActiveIndex)
            ? getZoneStyle(snapshotTextZones[nextActiveIndex], normalizedSnapshotStyle)
            : normalizedSnapshotStyle

        setTextZones(snapshotTextZones)
        setActiveTextZoneIndex(nextActiveIndex)
        setActiveCanvasTool(safeSnapshot.activeCanvasTool || 'photo')
        setGuestTextStyle(nextGuestTextStyle)
        setZoom(clamp(Number(safeSnapshot.zoom) || 1, 0.5, 1.8))
        setActiveMenu(safeSnapshot.activeMenu || DEFAULT_EDITOR_STATE.activeMenu)
    }

    const hydrateDraft = ({ asset, editor }) => {
        if (!asset?.secureUrl) {
            return
        }

        setUploadedImage({
            src: asset.secureUrl,
            width: Number(asset.width) || 1080,
            height: Number(asset.height) || 1920,
            name: asset.originalFilename || 'EventDP',
            file: null,
        })

        restoreFromSnapshot(editor || {})
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
        hydrateDraft,
    }
}

export default useCreateEventDPState