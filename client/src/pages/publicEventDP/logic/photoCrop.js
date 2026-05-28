const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const getDefaultCropRect = (imageWidth, imageHeight, aspectRatio = 1, zoom = 1) => {
    const safeWidth = Math.max(1, Number(imageWidth) || 1)
    const safeHeight = Math.max(1, Number(imageHeight) || 1)
    const safeAspect = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1
    const safeZoom = Math.max(1, Number(zoom) || 1)

    let width = Math.min(safeWidth * 0.9, safeHeight * safeAspect * 0.9)
    let height = width / safeAspect

    if (height > safeHeight) {
        height = Math.min(safeHeight * 0.9, safeWidth / safeAspect)
        width = height * safeAspect
    }

    width = clamp(width / safeZoom, 1, safeWidth)
    height = clamp(width / safeAspect, 1, safeHeight)

    if (height > safeHeight) {
        height = safeHeight
        width = height * safeAspect
    }

    return {
        x: Math.max(0, Math.round((safeWidth - width) / 2)),
        y: Math.max(0, Math.round((safeHeight - height) / 2)),
        width: Math.round(width),
        height: Math.round(height),
        unit: 'px',
    }
}

export const clampCropRect = (cropRect, imageWidth, imageHeight) => {
    if (!cropRect) {
        return null
    }

    const safeWidth = Math.max(1, Number(imageWidth) || 1)
    const safeHeight = Math.max(1, Number(imageHeight) || 1)
    const width = clamp(Math.round(Number(cropRect.width) || 1), 1, safeWidth)
    const height = clamp(Math.round(Number(cropRect.height) || 1), 1, safeHeight)
    const x = clamp(Math.round(Number(cropRect.x) || 0), 0, Math.max(0, safeWidth - width))
    const y = clamp(Math.round(Number(cropRect.y) || 0), 0, Math.max(0, safeHeight - height))

    return {
        x,
        y,
        width,
        height,
        unit: 'px',
    }
}

export const deriveZoomFromCropRect = (cropRect, imageWidth, imageHeight, aspectRatio = 1) => {
    if (!cropRect) {
        return 1
    }

    const safeWidth = Math.max(1, Number(imageWidth) || 1)
    const safeHeight = Math.max(1, Number(imageHeight) || 1)
    const safeAspect = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1
    const baseRect = getDefaultCropRect(safeWidth, safeHeight, safeAspect, 1)
    const zoom = baseRect.width / Math.max(1, Number(cropRect.width) || 1)

    return clamp(Math.round(zoom * 100) / 100, 1, 3)
}

export const resizeCropRectForZoom = (cropRect, zoom, imageWidth, imageHeight, aspectRatio = 1) => {
    if (!cropRect) {
        return null
    }

    const safeWidth = Math.max(1, Number(imageWidth) || 1)
    const safeHeight = Math.max(1, Number(imageHeight) || 1)
    const safeAspect = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1
    const zoomFactor = clamp(Number(zoom) || 1, 1, 3)
    const baseRect = getDefaultCropRect(safeWidth, safeHeight, safeAspect, 1)
    const nextWidth = clamp(Math.round(baseRect.width / zoomFactor), 1, safeWidth)
    const nextHeight = clamp(Math.round(nextWidth / safeAspect), 1, safeHeight)
    const centerX = Number(cropRect.x || 0) + (Number(cropRect.width || 0) / 2)
    const centerY = Number(cropRect.y || 0) + (Number(cropRect.height || 0) / 2)

    return clampCropRect({
        x: centerX - (nextWidth / 2),
        y: centerY - (nextHeight / 2),
        width: nextWidth,
        height: nextHeight,
    }, safeWidth, safeHeight)
}

export const getSourceRectForPlacement = ({
    imageWidth,
    imageHeight,
    zoneWidth,
    zoneHeight,
    cropRect,
    cropEnabled = false,
    zoom = 1,
}) => {
    const safeImageWidth = Math.max(1, Number(imageWidth) || 1)
    const safeImageHeight = Math.max(1, Number(imageHeight) || 1)
    const safeZoneWidth = Math.max(1, Number(zoneWidth) || 1)
    const safeZoneHeight = Math.max(1, Number(zoneHeight) || 1)
    const zoneAspect = safeZoneWidth / safeZoneHeight
    const zoomFactor = clamp(Number(zoom) || 1, 1, 3)

    const baseRect = cropEnabled && cropRect
        ? clampCropRect(cropRect, safeImageWidth, safeImageHeight)
        : {
            x: 0,
            y: 0,
            width: safeImageWidth,
            height: safeImageHeight,
            unit: 'px',
        }

    const baseWidth = Math.max(1, Number(baseRect?.width) || safeImageWidth)
    const baseHeight = Math.max(1, Number(baseRect?.height) || safeImageHeight)
    const baseX = Number(baseRect?.x) || 0
    const baseY = Number(baseRect?.y) || 0
    const baseAspect = baseWidth / baseHeight

    let coverWidth = baseWidth
    let coverHeight = baseHeight
    let coverX = baseX
    let coverY = baseY

    if (baseAspect > zoneAspect) {
        coverWidth = baseHeight * zoneAspect
        coverX = baseX + ((baseWidth - coverWidth) / 2)
    } else if (baseAspect < zoneAspect) {
        coverHeight = baseWidth / zoneAspect
        coverY = baseY + ((baseHeight - coverHeight) / 2)
    }

    const zoomedWidth = coverWidth / zoomFactor
    const zoomedHeight = coverHeight / zoomFactor
    const centerX = coverX + (coverWidth / 2)
    const centerY = coverY + (coverHeight / 2)

    return clampCropRect({
        x: centerX - (zoomedWidth / 2),
        y: centerY - (zoomedHeight / 2),
        width: zoomedWidth,
        height: zoomedHeight,
        unit: 'px',
    }, safeImageWidth, safeImageHeight)
}

export const getCroppedImageRenderStyle = ({
    imageWidth,
    imageHeight,
    cropRect,
    cropEnabled = false,
    zoom = 1,
    targetWidth,
    targetHeight,
}) => {
    if (!targetWidth || !targetHeight) {
        return null
    }

    const safeImageWidth = Math.max(1, Number(imageWidth) || 1)
    const safeImageHeight = Math.max(1, Number(imageHeight) || 1)
    const sourceRect = getSourceRectForPlacement({
        imageWidth: safeImageWidth,
        imageHeight: safeImageHeight,
        zoneWidth: targetWidth,
        zoneHeight: targetHeight,
        cropRect,
        cropEnabled,
        zoom,
    })

    if (!sourceRect) {
        return null
    }

    const scaleX = Number(targetWidth) / Math.max(1, Number(sourceRect.width) || 1)
    const scaleY = Number(targetHeight) / Math.max(1, Number(sourceRect.height) || 1)

    return {
        width: `${Math.round(safeImageWidth * scaleX)}px`,
        height: `${Math.round(safeImageHeight * scaleY)}px`,
        left: `${Math.round(-(Number(sourceRect.x) || 0) * scaleX)}px`,
        top: `${Math.round(-(Number(sourceRect.y) || 0) * scaleY)}px`,
    }
}

export const drawCroppedImageIntoZone = (ctx, image, zone, adjustments = {}, zoneShape = 'square') => {
    const x = Number(zone?.x || 0)
    const y = Number(zone?.y || 0)
    const width = Number(zone?.width || 0)
    const height = Number(zone?.height || 0)

    if (width <= 2 || height <= 2) {
        return
    }

    const sourceRect = getSourceRectForPlacement({
        imageWidth: image.width,
        imageHeight: image.height,
        zoneWidth: width,
        zoneHeight: height,
        cropRect: adjustments?.cropRect,
        cropEnabled: Boolean(adjustments?.cropMode),
        zoom: Number(adjustments?.zoom || 1),
    })

    ctx.save()
    ctx.beginPath()

    if (zoneShape === 'circle') {
        ctx.ellipse(x + (width / 2), y + (height / 2), width / 2, height / 2, 0, 0, Math.PI * 2)
    } else {
        const radius = Math.min(16, width / 8, height / 8)
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
    }

    ctx.clip()
    ctx.drawImage(
        image,
        sourceRect.x,
        sourceRect.y,
        sourceRect.width,
        sourceRect.height,
        x,
        y,
        width,
        height,
    )
    ctx.restore()
}