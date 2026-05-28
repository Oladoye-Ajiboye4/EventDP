import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { Icon } from '@iconify/react'
import {
    getPublicEventDP,
    recordPublicDownload,
    requestPublicFinalUploadSignature,
    savePublicFinalImage,
    uploadToCloudinary,
} from '../create_EventDP/logic/draftSync'
import { ensureGoogleFontLoaded } from '../create_EventDP/logic/fontLoader'
import { fitTextLayoutInZone } from '../create_EventDP/logic/textLayout'
import { resolveZoneActual } from '../create_EventDP/logic/zoneCoordinates'
import { drawCroppedImageIntoZone } from './logic/photoCrop'
import GuestCanvasDisplay from './components/GuestCanvasDisplay'
import GuestSubmissionForm from './components/GuestSubmissionForm'

const GUEST_PHOTO_EDITOR_SIZE = 280

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
})

const loadImageElement = async (src) => {
    if (!src) {
        throw new Error('Missing image source')
    }

    if (src.startsWith('data:')) {
        return await new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = src
        })
    }

    const response = await fetch(src)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    try {
        const image = await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = objectUrl
        })
        return image
    } finally {
        URL.revokeObjectURL(objectUrl)
    }
}

const drawImageIntoZone = (ctx, image, zone, zoneShape, adjustments = null) => {
    const x = Number(zone?.x || 0)
    const y = Number(zone?.y || 0)
    const width = Number(zone?.width || 0)
    const height = Number(zone?.height || 0)

    if (width <= 2 || height <= 2) {
        return
    }

    const zoom = Math.max(0.1, Number(adjustments?.zoom || 1))
    const offsetX = Number(adjustments?.offsetX || 0)
    const offsetY = Number(adjustments?.offsetY || 0)
    const rotationInRadians = (Number(adjustments?.rotation || 0) * Math.PI) / 180
    const scale = Math.max(width / image.width, height / image.height) * zoom
    const drawWidth = image.width * scale
    const drawHeight = image.height * scale
    const scaledOffsetX = offsetX * (width / GUEST_PHOTO_EDITOR_SIZE)
    const scaledOffsetY = offsetY * (height / GUEST_PHOTO_EDITOR_SIZE)
    const centerX = x + (width / 2) + scaledOffsetX
    const centerY = y + (height / 2) + scaledOffsetY

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationInRadians)

    ctx.beginPath()
    if (zoneShape === 'circle') {
        ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2)
    } else {
        const radius = Math.min(16, width / 8, height / 8)
        ctx.moveTo((-width / 2) + radius, -height / 2)
        ctx.lineTo((width / 2) - radius, -height / 2)
        ctx.quadraticCurveTo(width / 2, -height / 2, width / 2, (-height / 2) + radius)
        ctx.lineTo(width / 2, (height / 2) - radius)
        ctx.quadraticCurveTo(width / 2, height / 2, (width / 2) - radius, height / 2)
        ctx.lineTo((-width / 2) + radius, height / 2)
        ctx.quadraticCurveTo(-width / 2, height / 2, -width / 2, (height / 2) - radius)
        ctx.lineTo(-width / 2, (-height / 2) + radius)
        ctx.quadraticCurveTo(-width / 2, -height / 2, (-width / 2) + radius, -height / 2)
        ctx.closePath()
    }
    ctx.clip()

    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
    ctx.restore()
}

const drawTextIntoZone = (ctx, text, zone, textStyle) => {
    const x = Number(zone?.x || 0)
    const y = Number(zone?.y || 0)
    const width = Number(zone?.width || 0)
    const height = Number(zone?.height || 0)
    if (width <= 6 || height <= 6 || !text) {
        return
    }
    const layout = fitTextLayoutInZone({
        ctx,
        text,
        width,
        height,
        textStyle,
    })

    if (!layout) {
        return
    }

    const fontSize = layout.fontSizePx
    const linePx = layout.lineHeightPx
    const letterSpacing = layout.letterSpacingPx
    const align = layout.textAlign
    const horizontalPadding = 6
    const verticalPadding = 8

    ctx.save()
    ctx.fillStyle = layout.color
    ctx.textAlign = align
    ctx.textBaseline = 'middle'
    ctx.font = `${layout.fontStyle} ${layout.fontWeight} ${fontSize}px ${layout.fontFamily}`
    ctx.shadowColor = 'rgba(0,0,0,0.34)'
    ctx.shadowBlur = 8

    const maxLines = Math.max(1, Math.floor((height - (verticalPadding * 2)) / linePx))
    const limitedLines = layout.lines.slice(0, maxLines)
    const totalHeight = limitedLines.length * linePx
    const startY = y + ((height - totalHeight) / 2) + (linePx / 2)

    const anchorX = align === 'left'
        ? x + horizontalPadding
        : (align === 'right' ? x + width - horizontalPadding : x + (width / 2))

    limitedLines.forEach((line, index) => {
        const textY = startY + (index * linePx)
        const lineWidth = ctx.measureText(line).width + (letterSpacing * Math.max(0, line.length - 1))

        const getLineStartX = () => {
            if (align === 'left') {
                return anchorX
            }
            if (align === 'right') {
                return anchorX - lineWidth
            }
            return anchorX - (lineWidth / 2)
        }

        const drawTextDecoration = () => {
            if (layout.textDecoration === 'none' || !line) {
                return
            }

            const startX = getLineStartX()
            const endX = startX + lineWidth
            const yOffset = layout.textDecoration === 'underline' ? fontSize * 0.44 : -fontSize * 0.1

            ctx.beginPath()
            ctx.lineWidth = Math.max(1, fontSize * 0.06)
            ctx.strokeStyle = layout.color
            ctx.moveTo(startX, textY + yOffset)
            ctx.lineTo(endX, textY + yOffset)
            ctx.stroke()
        }

        if (!letterSpacing) {
            ctx.fillText(line, anchorX, textY)
            drawTextDecoration()
            return
        }

        if (align === 'center') {
            let cursor = anchorX - (lineWidth / 2)
            for (const char of line) {
                ctx.fillText(char, cursor, textY)
                cursor += ctx.measureText(char).width + letterSpacing
            }
            drawTextDecoration()
            return
        }

        if (align === 'right') {
            const reversed = [...line].reverse()
            let cursor = anchorX
            reversed.forEach((char) => {
                const widthChar = ctx.measureText(char).width
                cursor -= widthChar
                ctx.fillText(char, cursor, textY)
                cursor -= letterSpacing
            })
            drawTextDecoration()
            return
        }

        let cursor = anchorX
        for (const char of line) {
            ctx.fillText(char, cursor, textY)
            cursor += ctx.measureText(char).width + letterSpacing
        }
        drawTextDecoration()
    })

    ctx.restore()
}

const buildFinalCompositeBlob = async ({
    eventDP,
    guestPhotoSrc,
    guestPhotoMeta,
    guestPhotoAdjustments,
    guestTextByZone,
    format = 'png',
}) => {
    if (typeof document !== 'undefined' && document.fonts) {
        const fontLoadTimeout = new Promise((_, reject) => (
            setTimeout(() => reject(new Error('Font loading timeout')), 10000)
        ))
        await Promise.race([document.fonts.ready, fontLoadTimeout])
    }

    const baseImage = await loadImageElement(eventDP.asset.secureUrl)
    const guestImage = guestPhotoSrc ? await loadImageElement(guestPhotoSrc) : null
    const baseWidth = Number(eventDP.asset?.width) || 1080
    const baseHeight = Number(eventDP.asset?.height) || 1920

    const isPortrait = baseHeight >= baseWidth
    const targetWidth = isPortrait ? 1080 : 1920
    const targetHeight = isPortrait ? 1920 : 1080

    const scaleFactor = Math.max(
        1,
        targetWidth / Math.max(1, baseWidth),
        targetHeight / Math.max(1, baseHeight),
    )

    const width = Math.round(baseWidth * scaleFactor)
    const height = Math.round(baseHeight * scaleFactor)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { alpha: false })

    if (!ctx) {
        throw new Error('Unable to prepare canvas context')
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(baseImage, 0, 0, width, height)

    const imageDimensions = { width: baseWidth, height: baseHeight }
    const photoZone = resolveZoneActual(eventDP.editor?.committedZone, imageDimensions)
    if (guestImage && photoZone) {
        const scaledZone = {
            x: Number(photoZone.x) * scaleFactor,
            y: Number(photoZone.y) * scaleFactor,
            width: Number(photoZone.width) * scaleFactor,
            height: Number(photoZone.height) * scaleFactor,
        }

        const hasLegacyTransform = Boolean(
            Number(guestPhotoAdjustments?.offsetX)
            || Number(guestPhotoAdjustments?.offsetY)
            || Number(guestPhotoAdjustments?.rotation),
        )

        if (hasLegacyTransform) {
            drawImageIntoZone(ctx, guestImage, scaledZone, eventDP.editor?.zoneShape || 'square', guestPhotoAdjustments)
        } else {
            drawCroppedImageIntoZone(
                ctx,
                guestImage,
                scaledZone,
                {
                    cropRect: guestPhotoAdjustments?.cropRect
                        ? {
                            x: Number(guestPhotoAdjustments.cropRect.x) || 0,
                            y: Number(guestPhotoAdjustments.cropRect.y) || 0,
                            width: Number(guestPhotoAdjustments.cropRect.width) || (guestPhotoMeta?.width || guestImage.width),
                            height: Number(guestPhotoAdjustments.cropRect.height) || (guestPhotoMeta?.height || guestImage.height),
                        }
                        : null,
                    zoom: Number(guestPhotoAdjustments?.zoom || 1),
                    cropMode: Boolean(guestPhotoAdjustments?.cropMode),
                },
                eventDP.editor?.zoneShape || 'square',
            )
        }
    }

    const textZones = Array.isArray(eventDP.editor?.textZones) ? eventDP.editor.textZones : []
    textZones.forEach((zone, index) => {
        const submittedText = guestTextByZone[String(index)]
        if (!submittedText || !String(submittedText).trim()) {
            return
        }

        const zoneActual = resolveZoneActual(zone, imageDimensions)
        if (!zoneActual) {
            return
        }

        const zoneStyle = zone?.style || eventDP.editor?.guestTextStyle || {}
        const scaledZone = {
            x: Number(zoneActual.x) * scaleFactor,
            y: Number(zoneActual.y) * scaleFactor,
            width: Number(zoneActual.width) * scaleFactor,
            height: Number(zoneActual.height) * scaleFactor,
        }

        drawTextIntoZone(ctx, submittedText, scaledZone, zoneStyle)
    })

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const extension = format === 'jpg' ? 'jpg' : 'png'
    const quality = format === 'jpg' ? 0.95 : 1.0

    const blob = await new Promise((resolve, reject) => {
        try {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject(new Error('Canvas to blob conversion failed'))
                }
            }, mimeType, quality)
        } catch (blobErr) {
            reject(blobErr)
        }
    })

    return {
        blob,
        width,
        height,
        mimeType,
        extension,
    }
}

const downloadBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fileName

    try {
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
    } finally {
        URL.revokeObjectURL(objectUrl)
    }
}

const downloadImageFromUrl = async ({ src, fileName, format = 'png' }) => {
    const image = await loadImageElement(src)
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
        throw new Error('Unable to prepare download canvas')
    }

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, image.width, image.height)

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
    const quality = format === 'jpg' ? 0.95 : 1

    const blob = await new Promise((resolve, reject) => {
        try {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject(new Error('Failed to prepare image download'))
                }
            }, mimeType, quality)
        } catch (blobErr) {
            reject(blobErr)
        }
    })

    downloadBlob(blob, fileName)
}

const PublicEventDP = () => {
    const { slug, projectSlug, accessKey } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [eventDP, setEventDP] = useState(null)
    const [selectedZoneIndex, setSelectedZoneIndex] = useState(null)
    const [hoveredZone, setHoveredZone] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [guestPhotoSrc, setGuestPhotoSrc] = useState('')
    const [guestPhotoMeta, setGuestPhotoMeta] = useState(null)
    const [guestPhotoAdjustments, setGuestPhotoAdjustments] = useState(null)
    const [guestTextByZone, setGuestTextByZone] = useState({})
    const [guestViewMode, setGuestViewMode] = useState('edit')
    const [finalImage, setFinalImage] = useState(null)
    const [isFinalizing, setIsFinalizing] = useState(false)
    const [finalizeError, setFinalizeError] = useState('')
    const [downloadError, setDownloadError] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadCount, setDownloadCount] = useState(0)

    const imageDimensions = useMemo(() => ({
        width: Number(eventDP?.asset?.width) || 1080,
        height: Number(eventDP?.asset?.height) || 1920,
    }), [eventDP?.asset?.height, eventDP?.asset?.width])

    const photoZoneActual = useMemo(() => {
        if (!eventDP?.editor?.committedZone) {
            return null
        }

        return resolveZoneActual(eventDP.editor.committedZone, imageDimensions)
    }, [eventDP?.editor?.committedZone, imageDimensions])

    const photoZoneAspectRatio = useMemo(() => {
        if (!photoZoneActual?.width || !photoZoneActual?.height) {
            return 1
        }

        return photoZoneActual.width / photoZoneActual.height
    }, [photoZoneActual])

    const guestDraftStorageKey = useMemo(() => {
        if (eventDP?._id) {
            return `eventdp.public.guestDraft.${eventDP._id}`
        }

        const routeKey = accessKey || slug || projectSlug || 'fallback'
        return `eventdp.public.guestDraft.${routeKey}`
    }, [eventDP?._id, accessKey, projectSlug, slug])

    useEffect(() => {
        const fetchEventDP = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getPublicEventDP({ slug, projectSlug, accessKey })
                setEventDP(response.eventDP || null)
                setDownloadCount(Number(response.eventDP?.metrics?.downloadCount || 0))
                setFinalImage(response.eventDP?.publish?.finalImage || null)
            } catch (error) {
                console.error('Failed to load public EventDP:', error)
                const status = error.response?.status
                if (status === 410) {
                    setError('expired')
                } else if (status === 404) {
                    setError('notfound')
                } else {
                    setError('generic')
                }
                setEventDP(null)
            } finally {
                setLoading(false)
            }
        }

        fetchEventDP()
    }, [slug, projectSlug, accessKey])

    useEffect(() => {
        if (!eventDP) {
            return
        }

        try {
            const raw = localStorage.getItem(guestDraftStorageKey)
            if (!raw) {
                return
            }

            const parsed = JSON.parse(raw)
            setGuestPhotoSrc(typeof parsed.photoSrc === 'string' ? parsed.photoSrc : '')
            setGuestPhotoMeta(parsed.photoMeta && typeof parsed.photoMeta === 'object' ? parsed.photoMeta : null)
            setGuestPhotoAdjustments(parsed.photoAdjustments && typeof parsed.photoAdjustments === 'object' ? parsed.photoAdjustments : null)
            setGuestTextByZone(parsed.textByZone && typeof parsed.textByZone === 'object' ? parsed.textByZone : {})
            setGuestViewMode(parsed.viewMode === 'preview' ? 'preview' : 'edit')
            setFinalImage(parsed.finalImage && typeof parsed.finalImage === 'object' ? parsed.finalImage : null)
        } catch (err) {
            console.warn('Failed to restore guest draft from local storage', err)
        }
    }, [eventDP, guestDraftStorageKey])

    useEffect(() => {
        if (!eventDP) {
            return
        }

        try {
            localStorage.setItem(guestDraftStorageKey, JSON.stringify({
                photoSrc: guestPhotoSrc,
                photoMeta: guestPhotoMeta,
                photoAdjustments: guestPhotoAdjustments,
                textByZone: guestTextByZone,
                viewMode: guestViewMode,
                finalImage,
                savedAt: new Date().toISOString(),
            }))
        } catch (err) {
            console.warn('Failed to persist guest draft locally', err)
        }
    }, [eventDP, guestDraftStorageKey, guestPhotoAdjustments, guestPhotoMeta, guestPhotoSrc, guestTextByZone, guestViewMode, finalImage])

    useEffect(() => {
        const editor = eventDP?.editor
        const styleCandidates = [editor?.guestTextStyle]

        if (Array.isArray(editor?.textZones)) {
            editor.textZones.forEach((zone) => {
                if (zone?.style) {
                    styleCandidates.push(zone.style)
                }
            })
        }

        const familyWeights = styleCandidates.reduce((acc, style) => {
            const family = String(style?.fontFamily || '').trim()
            if (!family) {
                return acc
            }

            const weight = Number(style?.fontWeight) || 700
            acc[family] = Array.from(new Set([...(acc[family] || []), weight]))
            return acc
        }, {})

        const entries = Object.entries(familyWeights)
        if (entries.length === 0) {
            return
        }

        entries.forEach(([family, weights]) => {
            ensureGoogleFontLoaded({
                family,
                weights,
            })
        })
    }, [eventDP])

    const handlePhotoSubmit = async (submission, onSuccess) => {
        try {
            setSubmitting(true)
            const file = submission?.file
            const imageDataUrl = submission?.photoSrc || (file ? await readFileAsDataUrl(file) : '')
            if (!imageDataUrl) {
                throw new Error('Missing guest photo file')
            }

            setGuestPhotoSrc(imageDataUrl)
            setGuestPhotoMeta(submission?.meta || null)
            setGuestPhotoAdjustments(submission?.adjustments || null)
            setFinalImage(null)
            setFinalizeError('')
            setDownloadError('')
            setSubmitSuccess(true)
            onSuccess?.()
            setTimeout(() => {
                setSelectedZoneIndex(null)
                setSubmitSuccess(false)
            }, 2000)
        } catch (err) {
            console.error('Photo submission failed:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handlePhotoDraftChange = useCallback(({ photoSrc, photoMeta, photoAdjustments }) => {
        setGuestPhotoSrc(typeof photoSrc === 'string' ? photoSrc : '')
        setGuestPhotoMeta(photoMeta && typeof photoMeta === 'object' ? photoMeta : null)
        setGuestPhotoAdjustments(photoAdjustments && typeof photoAdjustments === 'object' ? photoAdjustments : null)
        setFinalImage(null)
        setFinalizeError('')
        setDownloadError('')
    }, [])

    const handleTextSubmit = async (zoneIndex, text, onSuccess) => {
        try {
            setSubmitting(true)
            setGuestTextByZone((prev) => ({
                ...prev,
                [String(zoneIndex)]: text,
            }))
            setFinalImage(null)
            setFinalizeError('')
            setDownloadError('')
            setSubmitSuccess(true)
            onSuccess?.()
            setTimeout(() => {
                setSelectedZoneIndex(null)
                setSubmitSuccess(false)
            }, 2000)
        } catch (err) {
            console.error('Text submission failed:', err)
        } finally {
            setSubmitting(false)
        }
    }

    // Loading State
    if (loading) {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center'>
                <div className='text-center space-y-3'>
                    <div className='h-12 w-12 rounded-full border-4 border-dusty-green/35 border-t-forest-green animate-spin mx-auto' />
                    <p className='text-sm font-semibold text-dark-slate'>Loading EventDP...</p>
                </div>
            </main>
        )
    }

    // Error: Expired Link
    if (error === 'expired') {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center px-4'>
                <div className='max-w-md w-full rounded-2xl bg-white border border-dusty-green/30 p-6 text-center shadow-lg'>
                    <Icon icon='mdi:clock-alert-outline' width='40' height='40' className='mx-auto text-orange-500' />
                    <h1 className='text-xl font-bold text-dark-slate mt-4'>Link Expired</h1>
                    <p className='text-sm text-dark-slate/65 mt-2'>
                        This EventDP link has expired. Please contact the host for a new link.
                    </p>
                </div>
            </main>
        )
    }

    // Error: Not Found
    if (error === 'notfound' || !eventDP) {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center px-4'>
                <div className='max-w-md w-full rounded-2xl bg-white border border-dusty-green/30 p-6 text-center shadow-lg'>
                    <Icon icon='mdi:link-off' width='40' height='40' className='mx-auto text-dark-slate/65' />
                    <h1 className='text-xl font-bold text-dark-slate mt-4'>Link Not Available</h1>
                    <p className='text-sm text-dark-slate/65 mt-2'>
                        This EventDP link is invalid or no longer active.
                    </p>
                </div>
            </main>
        )
    }

    // Error: Generic
    if (error === 'generic') {
        return (
            <main className='min-h-screen bg-pale-sage flex items-center justify-center px-4'>
                <div className='max-w-md w-full rounded-2xl bg-white border border-dusty-green/30 p-6 text-center shadow-lg'>
                    <Icon icon='mdi:alert-circle-outline' width='40' height='40' className='mx-auto text-red-500' />
                    <h1 className='text-xl font-bold text-dark-slate mt-4'>Error Loading EventDP</h1>
                    <p className='text-sm text-dark-slate/65 mt-2'>
                        Something went wrong. Please try again later.
                    </p>
                </div>
            </main>
        )
    }

    const hasPhotoZone = !!eventDP.editor?.committedZone
    const hasTextZones = eventDP.editor?.allowGuestText && eventDP.editor?.textZones?.length > 0
    const canSubmit = hasPhotoZone || hasTextZones

    const hasGuestTextSubmission = Object.values(guestTextByZone).some((value) => Boolean(String(value || '').trim()))
    const canFinalize = Boolean(eventDP.asset?.secureUrl && (guestPhotoSrc || hasGuestTextSubmission))
    const activeTextIndex = selectedZoneIndex?.startsWith('text-')
        ? Number(selectedZoneIndex.split('-')[1])
        : null
    const activeTextValue = Number.isInteger(activeTextIndex)
        ? guestTextByZone[String(activeTextIndex)] || ''
        : ''

    const openShareIntent = (platform) => {
        const url = window.location.href
        const encodedUrl = encodeURIComponent(url)
        const encodedText = encodeURIComponent('Check out this EventDP design')

        const endpoints = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out this EventDP design: ${url}`)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        }

        const shareUrl = endpoints[platform]
        if (!shareUrl) {
            return
        }

        window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }

    const handleFinalize = async () => {
        if (!eventDP?.asset?.secureUrl) {
            setFinalizeError('Base image not available.')
            return
        }

        if (!guestPhotoSrc && !Object.values(guestTextByZone).some((value) => Boolean(String(value || '').trim()))) {
            setFinalizeError('Add a photo or text before finalizing.')
            return
        }

        setIsFinalizing(true)
        setFinalizeError('')
        setDownloadError('')

        try {
            const { blob, mimeType, extension } = await buildFinalCompositeBlob({
                eventDP,
                guestPhotoSrc,
                guestPhotoMeta,
                guestPhotoAdjustments,
                guestTextByZone,
                format: 'png',
            })

            const fileName = `${(eventDP.title || 'eventdp').replace(/\s+/g, '-').toLowerCase()}-final.${extension}`
            const outputFile = new File([blob], fileName, {
                type: mimeType,
                lastModified: Date.now(),
            })

            const signatureData = await requestPublicFinalUploadSignature({
                slug,
                projectSlug,
                accessKey,
            })

            const uploadedAsset = await uploadToCloudinary({
                signatureData,
                file: outputFile,
            })

            setFinalImage(uploadedAsset)

            try {
                const saveResponse = await savePublicFinalImage({
                    slug,
                    projectSlug,
                    accessKey,
                    finalImage: uploadedAsset,
                })

                const nextFinalImage = saveResponse?.publish?.finalImage || {
                    ...uploadedAsset,
                    uploadedAt: new Date().toISOString(),
                }

                setFinalImage(nextFinalImage)
            } catch (saveErr) {
                console.warn('Uploaded final image but could not sync metadata to backend:', saveErr)
                setFinalizeError('Completed image saved to Cloudinary, but backend sync failed.')
            }
            setGuestViewMode('preview')
        } catch (err) {
            console.error('Failed to finalize EventDP:', err)
            setFinalizeError(err?.response?.data?.message || err?.message || 'Could not save the completed image.')
        } finally {
            setIsFinalizing(false)
        }
    }

    const handleDownload = async (format = 'png') => {
        if (!finalImage?.secureUrl) {
            setDownloadError('Finalize the EventDP first.')
            return
        }

        setIsDownloading(true)
        setDownloadError('')

        try {
            const extension = format === 'jpg' ? 'jpg' : 'png'
            const safeTitle = (eventDP.title || 'eventdp').replace(/\s+/g, '-').toLowerCase()
            const fileName = `${safeTitle}-guest.${extension}`

            await downloadImageFromUrl({
                src: finalImage.secureUrl,
                fileName,
                format,
            })

            try {
                const metricResult = await recordPublicDownload({ slug, projectSlug, accessKey })
                if (Number.isFinite(metricResult?.downloadCount)) {
                    setDownloadCount(Number(metricResult.downloadCount))
                } else {
                    setDownloadCount((prev) => prev + 1)
                }
            } catch (metricErr) {
                console.warn('Failed to record download metric:', metricErr)
            }
        } catch (err) {
            console.error('Failed to download final EventDP:', err)
            setDownloadError(err?.message || 'Could not download the completed image.')
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <main className='relative min-h-screen bg-pale-sage flex flex-col lg:h-screen lg:overflow-hidden'>
            {/* Header */}
            <header className='shrink-0 border-b border-dusty-green/20 bg-white/70 backdrop-blur-sm shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5'>
                    <div className='space-y-2'>
                        <p className='text-[11px] uppercase tracking-[0.15em] font-bold text-forest-green'>
                            Shared EventDP
                        </p>
                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-dark-slate'>
                            {eventDP.title || eventDP.asset?.originalFilename || 'EventDP'}
                        </h1>
                        <div className='flex flex-wrap gap-4 mt-3 text-sm text-dark-slate/60'>
                            {eventDP.publish?.publishedAt && (
                                <div className='flex items-center gap-1'>
                                    <Icon icon='mdi:calendar' width='16' height='16' />
                                    Published {new Date(eventDP.publish.publishedAt).toLocaleDateString()}
                                </div>
                            )}
                            {eventDP.publish?.expiresAt && (
                                <div className='flex items-center gap-1'>
                                    <Icon
                                        icon='mdi:clock-outline'
                                        width='16'
                                        height='16'
                                        className={new Date(eventDP.publish.expiresAt) < new Date() ? 'text-red-500' : 'text-forest-green'}
                                    />
                                    Expires {new Date(eventDP.publish.expiresAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Canvas Area */}
            <div className='flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden'>
                {/* Canvas Section (70%) */}
                <div className='flex-none lg:flex-1 min-h-[62svh] lg:min-h-0 flex flex-col overflow-hidden'>
                    {eventDP.asset?.secureUrl ? (
                        <GuestCanvasDisplay
                            eventDP={eventDP}
                            cornerRadius={eventDP.editor?.cornerRadius}
                            selectedZoneIndex={selectedZoneIndex}
                            onPhotoZoneClick={() => guestViewMode === 'edit' && setSelectedZoneIndex('photo')}
                            onTextZoneClick={(idx) => guestViewMode === 'edit' && setSelectedZoneIndex(`text-${idx}`)}
                            hoveredZone={hoveredZone}
                            onZoneHover={setHoveredZone}
                            guestPhotoSrc={guestPhotoSrc}
                            guestPhotoMeta={guestPhotoMeta}
                            guestPhotoAdjustments={guestPhotoAdjustments}
                            guestTextByZone={guestTextByZone}
                            previewMode={guestViewMode === 'preview'}
                        />
                    ) : (
                        <div className='flex-1 flex items-center justify-center'>
                            <div className='text-center text-dark-slate/60'>
                                <Icon icon='mdi:image-off' width='48' height='48' className='mx-auto mb-2 opacity-50' />
                                <p className='text-sm'>No image available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar (30%) */}
                <div className='w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-dusty-green/20 bg-white/60 backdrop-blur-sm overflow-visible lg:overflow-y-auto'>
                    <div className='p-4 sm:p-6 space-y-5 sm:space-y-6'>
                        {/* Instructions */}
                        <div className='space-y-3'>
                            <h2 className='font-bold text-dark-slate text-sm uppercase tracking-wide'>
                                How to Participate
                            </h2>
                            <div className='space-y-2 text-sm text-dark-slate/70'>
                                {hasPhotoZone && (
                                    <div className='flex gap-2'>
                                        <Icon icon='mdi:numeric-1-circle' width='20' height='20' className='text-forest-green shrink-0 mt-0.5' />
                                        <p>Click the green zone to upload your photo</p>
                                    </div>
                                )}
                                {hasTextZones && (
                                    <div className='flex gap-2'>
                                        <Icon
                                            icon={hasPhotoZone ? 'mdi:numeric-2-circle' : 'mdi:numeric-1-circle'}
                                            width='20'
                                            height='20'
                                            className='text-forest-green shrink-0 mt-0.5'
                                        />
                                        <p>Add custom text in the blue zones</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Zone Status */}
                        {canSubmit && (
                            <div className='space-y-2'>
                                <h3 className='font-bold text-dark-slate text-sm uppercase tracking-wide'>
                                    Zones Available
                                </h3>
                                <div className='space-y-2'>
                                    {hasPhotoZone && (
                                        <button
                                            onClick={() => setSelectedZoneIndex('photo')}
                                            disabled={guestViewMode === 'preview'}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${selectedZoneIndex === 'photo'
                                                ? 'border-forest-green bg-forest-green/10 text-forest-green'
                                                : 'border-dusty-green/30 hover:border-forest-green/50 text-dark-slate hover:bg-pale-sage/30'} ${guestViewMode === 'preview' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <div className='flex items-center gap-2'>
                                                <Icon icon='mdi:image-plus-outline' width='18' height='18' />
                                                Photo Zone
                                            </div>
                                        </button>
                                    )}
                                    {hasTextZones && eventDP.editor?.textZones?.map((zone, idx) => (
                                        <button
                                            key={`text-zone-${idx}`}
                                            onClick={() => setSelectedZoneIndex(`text-${idx}`)}
                                            disabled={guestViewMode === 'preview'}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${selectedZoneIndex === `text-${idx}`
                                                ? 'border-[#465577] bg-[#465577]/10 text-[#465577]'
                                                : 'border-dusty-green/30 hover:border-[#465577]/50 text-dark-slate hover:bg-pale-sage/30'} ${guestViewMode === 'preview' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <div className='flex items-center gap-2'>
                                                <Icon icon='mdi:text-box-plus-outline' width='18' height='18' />
                                                Text Zone {idx + 1}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <h3 className='font-bold text-dark-slate text-sm uppercase tracking-wide'>
                                View Mode
                            </h3>
                            <div className='grid grid-cols-2 gap-2'>
                                <button
                                    type='button'
                                    onClick={() => setGuestViewMode('edit')}
                                    className={`h-10 rounded-lg border text-xs font-bold uppercase tracking-wide ${guestViewMode === 'edit'
                                        ? 'border-forest-green bg-forest-green/10 text-forest-green'
                                        : 'border-dusty-green/30 text-dark-slate/70 hover:bg-pale-sage/30'}`}
                                >
                                    Edit
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setGuestViewMode('preview')}
                                    className={`h-10 rounded-lg border text-xs font-bold uppercase tracking-wide ${guestViewMode === 'preview'
                                        ? 'border-dark-slate bg-dark-slate/10 text-dark-slate'
                                        : 'border-dusty-green/30 text-dark-slate/70 hover:bg-pale-sage/30'}`}
                                >
                                    Preview
                                </button>
                            </div>
                            <p className='text-[11px] text-dark-slate/60'>
                                Edit mode shows interactive zones. Preview mode shows final placement.
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <h3 className='font-bold text-dark-slate text-sm uppercase tracking-wide'>
                                Finalize & Download
                            </h3>

                            {!finalImage?.secureUrl ? (
                                <>
                                    <button
                                        type='button'
                                        onClick={handleFinalize}
                                        disabled={!canFinalize || isFinalizing}
                                        className='h-11 w-full rounded-lg bg-forest-green text-white text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                        {isFinalizing ? (
                                            <>
                                                <Icon icon='mdi:loading' width='16' height='16' className='animate-spin' />
                                                Saving...
                                            </>
                                        ) : (
                                            'Done'
                                        )}
                                    </button>
                                    <p className='text-[11px] text-dark-slate/60'>
                                        Finish editing to process the final image.
                                    </p>
                                    {finalizeError && (
                                        <p className='text-xs text-red-600'>{finalizeError}</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                        <button
                                            type='button'
                                            onClick={() => handleDownload('png')}
                                            disabled={isDownloading}
                                            className='h-10 rounded-lg bg-forest-green text-white text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            {isDownloading ? 'Preparing...' : 'Download PNG'}
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() => handleDownload('jpg')}
                                            disabled={isDownloading}
                                            className='h-10 rounded-lg border border-forest-green text-forest-green text-xs font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            Download JPG
                                        </button>
                                    </div>
                                    <p className='text-[11px] text-dark-slate/60'>
                                        Final image is processed and ready for download.
                                    </p>
                                    <p className='text-[11px] text-dark-slate/60'>
                                        Total downloads: {downloadCount}
                                    </p>
                                    {downloadError && (
                                        <p className='text-xs text-red-600'>{downloadError}</p>
                                    )}
                                    <div className='grid grid-cols-5 gap-1.5 sm:gap-2'>
                                        {[
                                            { id: 'whatsapp', icon: 'mdi:whatsapp' },
                                            { id: 'facebook', icon: 'mdi:facebook' },
                                            { id: 'x', icon: 'mdi:twitter' },
                                            { id: 'linkedin', icon: 'mdi:linkedin' },
                                            { id: 'telegram', icon: 'mdi:telegram' },
                                        ].map((social) => (
                                            <button
                                                key={social.id}
                                                type='button'
                                                onClick={() => openShareIntent(social.id)}
                                                className='h-9 rounded-lg border border-dusty-green/30 bg-white text-dark-slate hover:bg-pale-sage/30 flex items-center justify-center'
                                                aria-label={`Share on ${social.id}`}
                                            >
                                                <Icon icon={social.icon} width='16' height='16' />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* No Zones Available */}
                        {!canSubmit && (
                            <div className='p-4 rounded-lg bg-dark-slate/5 border border-dark-slate/10'>
                                <p className='text-sm text-dark-slate/60 text-center'>
                                    No submission zones available for this EventDP
                                </p>
                            </div>
                        )}

                        {/* Success Message */}
                        {submitSuccess && (
                            <div className='p-4 rounded-lg bg-green-50 border border-green-200 animate-fade-in'>
                                <div className='flex items-center gap-2'>
                                    <Icon icon='mdi:check-circle' width='20' height='20' className='text-green-600' />
                                    <p className='text-sm font-medium text-green-700'>Submission successful!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submission Form Overlay */}
            {canSubmit && selectedZoneIndex && (
                <GuestSubmissionForm
                    selectedZoneIndex={selectedZoneIndex}
                    onPhotoSubmit={handlePhotoSubmit}
                    onPhotoDraftChange={handlePhotoDraftChange}
                    onTextSubmit={handleTextSubmit}
                    onClose={() => setSelectedZoneIndex(null)}
                    isLoading={submitting}
                    initialText={activeTextValue}
                    initialPhotoSrc={guestPhotoSrc}
                    initialPhotoMeta={guestPhotoMeta}
                    initialPhotoAdjustments={guestPhotoAdjustments}
                    photoZoneAspectRatio={photoZoneAspectRatio}
                />
            )}
        </main>
    )
}

export default PublicEventDP
