import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import { fitTextLayoutInZone, getTextMeasurementContext, lengthToPx } from '../../create_EventDP/logic/textLayout'
import { resolveZoneActual, actualToGuestDisplay } from '../../create_EventDP/logic/zoneCoordinates'
import { getCroppedImageRenderStyle } from '../logic/photoCrop'

const ZoneDisplayOverlay = ({
    rect,
    kind,
    isSelected,
    isHovered,
    index,
    textStyle,
    zoneShape,
    onClick,
    onMouseEnter,
    onMouseLeave,
}) => {
    if (!rect || rect.width < 2 || rect.height < 2) return null

    const borderColor = kind === 'text'
        ? (isSelected || isHovered ? 'rgba(70,85,119,0.95)' : 'rgba(70,85,119,0.6)')
        : (isSelected || isHovered ? 'rgba(90,120,99,0.95)' : 'rgba(90,120,99,0.6)')

    const fillColor = kind === 'text'
        ? (isSelected || isHovered ? 'rgba(70,85,119,0.25)' : 'rgba(70,85,119,0.08)')
        : (isSelected || isHovered ? 'rgba(90,120,99,0.25)' : 'rgba(90,120,99,0.08)')

    const style = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `2px dashed ${borderColor}`,
        backgroundColor: fillColor,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        zIndex: isSelected ? 50 : 30,
    }

    if (zoneShape === 'circle') {
        style.borderRadius = '50%'
    } else {
        style.borderRadius = '6px'
    }

    const isTinyZone = rect.width < 120 || rect.height < 100
    const baseFontSizePx = lengthToPx(textStyle?.fontSize || 16, textStyle?.fontSizeUnit || 'px')
    const baseLetterSpacingPx = lengthToPx(textStyle?.letterSpacing || 0, textStyle?.letterSpacingUnit || 'px')
    const resolvedLineHeight = textStyle?.lineHeightUnit === 'unitless'
        ? Number.parseFloat(textStyle?.lineHeight || 1.25) || 1.25
        : `${Math.max(1, lengthToPx(textStyle?.lineHeight || 0, textStyle?.lineHeightUnit || 'px'))}px`

    return (
        <div
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            role='button'
            tabIndex={0}
            aria-pressed={isSelected}
        >
            {kind === 'photo' && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none px-2'>
                    <div
                        className={`absolute inset-0 bg-linear-to-br from-dark-slate/40 via-dark-slate/35 to-dark-slate/45 ${zoneShape === 'circle' ? 'rounded-full' : ''}`}
                    />
                    <div
                        className={`relative inline-flex items-center gap-2 rounded-full border border-white/70 bg-dark-slate/60 text-white backdrop-blur-sm transition-all ${isTinyZone ? 'h-7 w-7 justify-center' : 'px-3 py-1.5'} ${isSelected || isHovered ? 'ring-2 ring-forest-green' : ''}`}
                    >
                        <Icon icon='mdi:image-plus-outline' width='14' height='14' />
                        {!isTinyZone && (
                            <span className='text-[10px] font-semibold tracking-wide uppercase'>
                                Upload Photo
                            </span>
                        )}
                    </div>
                </div>
            )}

            {kind === 'text' && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none p-2'>
                    <div className='absolute inset-0 bg-linear-to-b from-[#2d3857]/50 to-[#2d3857]/40' />
                    <div
                        className='relative w-full text-center px-2 text-white/85 wrap-break-word'
                        style={{
                            fontFamily: textStyle?.fontFamily || 'system-ui',
                            fontWeight: textStyle?.fontWeight || 500,
                            fontStyle: textStyle?.fontStyle || 'normal',
                            textDecoration: textStyle?.textDecoration || 'none',
                            textTransform: textStyle?.textTransform || 'none',
                            fontSize: `${Math.max(11, Math.min(baseFontSizePx, rect.height * 0.34))}px`,
                            lineHeight: resolvedLineHeight,
                            letterSpacing: `${baseLetterSpacingPx}px`,
                            textAlign: textStyle?.textAlign || 'center',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                        }}
                    >
                        {textStyle?.text || 'Custom text here'}
                    </div>
                </div>
            )}

            {(isSelected || isHovered) && (
                <div
                    className={`absolute top-2 left-2 rounded-md text-white text-[9px] px-2 py-0.5 font-bold tracking-wide pointer-events-none ${kind === 'text' ? 'bg-[#2d3857]/85' : 'bg-dark-slate/85'}`}
                >
                    {kind === 'photo' ? 'PHOTO ZONE' : `TEXT ZONE ${index + 1}`}
                </div>
            )}
        </div>
    )
}

/**
 * Displays the canvas frame with background image and host-defined zones
 * for guests to interact with. Read-only display of structure.
 * 
 * Uses exact pixel-perfect scaling matching the host's canvas,
 * ensuring zones appear at the precise location they were placed.
 */
const GuestCanvasDisplay = ({
    eventDP,
    cornerRadius,
    selectedZoneIndex,
    onPhotoZoneClick,
    onTextZoneClick,
    hoveredZone,
    onZoneHover,
    guestPhotoSrc,
    guestPhotoMeta,
    guestPhotoAdjustments,
    guestTextByZone,
    previewMode,
}) => {
    const containerRef = useRef(null)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
    const hasAssetImage = Boolean(eventDP?.asset?.secureUrl)
    const measurementCtx = getTextMeasurementContext()

    const { committedZone, textZones, zoneShape, guestTextStyle, allowGuestText } = eventDP.editor || {}
    const imageDimensions = {
        width: Number(eventDP.asset?.width) || 1080,
        height: Number(eventDP.asset?.height) || 1920,
    }
    const canvasDimensions = `${imageDimensions.width} × ${imageDimensions.height}px`

    useEffect(() => {
        const calculateCanvasSize = () => {
            if (!containerRef.current) return

            const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect()
            const safeWidth = Math.max(120, containerWidth - 24)
            const safeHeight = Math.max(180, containerHeight - 24)
            const isCompactViewport = containerWidth < 768
            const scale = isCompactViewport
                ? safeWidth / imageDimensions.width
                : Math.min(
                    safeWidth / imageDimensions.width,
                    safeHeight / imageDimensions.height,
                )

            const displayWidth = imageDimensions.width * scale
            const displayHeight = imageDimensions.height * scale

            setCanvasSize({
                width: Math.round(displayWidth),
                height: Math.round(displayHeight),
            })
        }

        calculateCanvasSize()

        const resizeObserver = typeof ResizeObserver !== 'undefined' && containerRef.current
            ? new ResizeObserver(() => calculateCanvasSize())
            : null

        if (resizeObserver && containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        window.addEventListener('resize', calculateCanvasSize)

        return () => {
            window.removeEventListener('resize', calculateCanvasSize)
            resizeObserver?.disconnect()
        }
    }, [imageDimensions.width, imageDimensions.height])

    // Convert actual image coordinates to display coordinates based on current canvas size
    const getDisplayCoords = (actualCoords) => {
        if (!actualCoords || canvasSize.width === 0) return null

        return actualToGuestDisplay(actualCoords, imageDimensions, canvasSize)
    }

    if (!hasAssetImage) {
        return (
            <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                    <Icon icon='mdi:image-off-outline' width='48' height='48' className='mx-auto text-dark-slate/40' />
                    <p className='text-sm text-dark-slate/60 mt-2'>No image available</p>
                </div>
            </div>
        )
    }

    // Resolve photo zone using priority: normalised > actual > display
    const photoZoneActual = committedZone ? resolveZoneActual(committedZone, imageDimensions) : null
    const photoZoneDisplay = photoZoneActual ? getDisplayCoords(photoZoneActual) : null

    // Resolve text zones using priority: normalised > actual > display
    const textZonesDisplay = allowGuestText && textZones
        ? textZones.map((zone) => {
            const zoneActual = resolveZoneActual(zone, imageDimensions)
            return zoneActual ? getDisplayCoords(zoneActual) : null
        })
        : []

    const hasGuestPhoto = Boolean(guestPhotoSrc && photoZoneDisplay)
    const croppedPhotoStyle = hasGuestPhoto && guestPhotoMeta
        ? getCroppedImageRenderStyle({
            imageWidth: guestPhotoMeta.width,
            imageHeight: guestPhotoMeta.height,
            cropRect: guestPhotoAdjustments?.cropRect,
            cropEnabled: Boolean(guestPhotoAdjustments?.cropMode),
            zoom: Number(guestPhotoAdjustments?.zoom || 1),
            targetWidth: photoZoneDisplay.width,
            targetHeight: photoZoneDisplay.height,
        })
        : null

    return (
        <div className='w-full h-full flex flex-col'>
            {/* Canvas Container */}
            <div
                ref={containerRef}
                className='flex-1 relative overflow-auto flex items-start justify-center p-2 sm:p-4 lg:p-8 bg-[radial-gradient(rgba(144,171,139,0.2)_0.8px,transparent_0.8px)] bg-size-[20px_20px] lg:items-center'
            >
                {/* Canvas Frame - Using exact pixel dimensions */}
                {canvasSize.width > 0 && (
                    <div
                        className='relative bg-white shadow-2xl ring-1 ring-black/5 rounded-lg overflow-hidden shrink-0'
                        style={{
                            width: canvasSize.width,
                            height: canvasSize.height,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Background Image */}
                        <img
                            src={eventDP.asset?.secureUrl}
                            alt='Canvas background'
                            draggable={false}
                            className='w-full h-full object-cover'
                        />

                        {/* Guest photo render */}
                        {hasGuestPhoto && (
                            <div
                                className='absolute overflow-hidden'
                                style={{
                                    left: photoZoneDisplay.x,
                                    top: photoZoneDisplay.y,
                                    width: photoZoneDisplay.width,
                                    height: photoZoneDisplay.height,
                                    borderRadius: zoneShape === 'circle'
                                        ? '999px'
                                        : `${Number.isFinite(Number(cornerRadius)) ? Number(cornerRadius) : 0}px`,
                                    zIndex: 10,
                                }}
                            >
                                {croppedPhotoStyle ? (
                                    <img
                                        src={guestPhotoSrc}
                                        alt='Guest submission'
                                        className='absolute max-w-none block'
                                        style={{
                                            ...croppedPhotoStyle,
                                            objectFit: 'fill',
                                        }}
                                        draggable={false}
                                    />
                                ) : (
                                    <img
                                        src={guestPhotoSrc}
                                        alt='Guest submission'
                                        className='w-full h-full object-cover'
                                        draggable={false}
                                    />
                                )}
                            </div>
                        )}

                        {/* Guest text render */}
                        {allowGuestText && textZonesDisplay && textZonesDisplay.map((displayCoords, idx) => {
                            if (!displayCoords) {
                                return null
                            }

                            const submittedText = guestTextByZone?.[String(idx)] || ''
                            if (!submittedText) {
                                return null
                            }

                            const zoneStyle = textZones?.[idx]?.style || guestTextStyle || {}
                            const canvasScale = canvasSize.width / imageDimensions.width
                            const layout = fitTextLayoutInZone({
                                ctx: measurementCtx,
                                text: submittedText,
                                width: displayCoords.width / canvasScale,
                                height: displayCoords.height / canvasScale,
                                textStyle: zoneStyle,
                            })

                            if (!layout) {
                                return null
                            }

                            const renderFontSizePx = layout.fontSizePx * canvasScale
                            const renderLineHeightPx = layout.lineHeightPx * canvasScale
                            const renderLetterSpacingPx = layout.letterSpacingPx * canvasScale

                            return (
                                <div
                                    key={`submitted-text-${idx}`}
                                    className='absolute p-2 overflow-hidden'
                                    style={{
                                        left: displayCoords.x,
                                        top: displayCoords.y,
                                        width: displayCoords.width,
                                        height: displayCoords.height,
                                        zIndex: 12,
                                    }}
                                >
                                    <div
                                        className='w-full h-full wrap-break-word'
                                        style={{
                                            color: layout.color,
                                            fontFamily: layout.fontFamily,
                                            fontWeight: layout.fontWeight,
                                            fontStyle: layout.fontStyle,
                                            textDecoration: layout.textDecoration,
                                            textTransform: layout.textTransform,
                                            fontSize: `${renderFontSizePx}px`,
                                            lineHeight: `${renderLineHeightPx}px`,
                                            letterSpacing: `${renderLetterSpacingPx}px`,
                                            textAlign: layout.textAlign,
                                            textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: layout.textAlign === 'left' ? 'flex-start' : (layout.textAlign === 'right' ? 'flex-end' : 'center'),
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {layout.lines.join('\n')}
                                    </div>
                                </div>
                            )
                        })}

                        {/* Photo Zone Overlay */}
                        {!previewMode && photoZoneDisplay && (
                            <ZoneDisplayOverlay
                                rect={photoZoneDisplay}
                                kind='photo'
                                zoneShape={zoneShape}
                                isSelected={selectedZoneIndex === 'photo'}
                                isHovered={hoveredZone === 'photo'}
                                onClick={() => onPhotoZoneClick?.()}
                                onMouseEnter={() => onZoneHover?.('photo')}
                                onMouseLeave={() => onZoneHover?.(null)}
                            />
                        )}

                        {/* Text Zones Overlays */}
                        {!previewMode && allowGuestText && textZonesDisplay && textZonesDisplay.map((displayCoords, idx) => (
                            displayCoords && (
                                <ZoneDisplayOverlay
                                    key={`text-zone-${idx}`}
                                    rect={displayCoords}
                                    kind='text'
                                    zoneShape={zoneShape}
                                    index={idx}
                                    isSelected={selectedZoneIndex === `text-${idx}`}
                                    isHovered={hoveredZone === `text-${idx}`}
                                    textStyle={textZones?.[idx]?.style || guestTextStyle}
                                    onClick={() => onTextZoneClick?.(idx)}
                                    onMouseEnter={() => onZoneHover?.(`text-${idx}`)}
                                    onMouseLeave={() => onZoneHover?.(null)}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Canvas Info Footer */}
            <div className='border-t border-dusty-green/20 bg-white/50 backdrop-blur-sm px-4 sm:px-6 py-2 text-center text-[11px] font-medium text-dark-slate/65 tracking-wide'>
                Canvas {canvasDimensions}
                {eventDP.publish?.expiresAt && (
                    <>
                        {' '} • Expires {new Date(eventDP.publish.expiresAt).toLocaleDateString()}
                    </>
                )}
            </div>
        </div>
    )
}

export default GuestCanvasDisplay
