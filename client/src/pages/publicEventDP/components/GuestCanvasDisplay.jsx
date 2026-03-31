import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'

/**
 * Displays the canvas frame with background image and host-defined zones
 * for guests to interact with. Read-only display of structure.
 * 
 * Uses exact pixel-perfect scaling matching the host's canvas,
 * ensuring zones appear at the precise location they were placed.
 */
const GuestCanvasDisplay = ({
    eventDP,
    selectedZoneIndex,
    onPhotoZoneClick,
    onTextZoneClick,
    hoveredZone,
    onZoneHover,
}) => {
    const containerRef = useRef(null)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

    if (!eventDP?.asset?.secureUrl) {
        return (
            <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                    <Icon icon='mdi:image-off-outline' width='48' height='48' className='mx-auto text-dark-slate/40' />
                    <p className='text-sm text-dark-slate/60 mt-2'>No image available</p>
                </div>
            </div>
        )
    }

    const { committedZone, textZones, zoneShape, guestTextStyle, allowGuestText } = eventDP.editor || {}
    const imageDimensions = { width: eventDP.asset?.width, height: eventDP.asset?.height }
    const canvasDimensions = `${imageDimensions.width} × ${imageDimensions.height}px`

    // Calculate exact canvas size based on viewport, maintaining aspect ratio
    useEffect(() => {
        const calculateCanvasSize = () => {
            if (!containerRef.current) return

            const { width: vwWidth, height: vwHeight } = containerRef.current.getBoundingClientRect()
            const imageRatio = imageDimensions.width / imageDimensions.height

            let displayWidth = vwWidth
            let displayHeight = vwWidth / imageRatio

            if (displayHeight > vwHeight) {
                displayHeight = vwHeight
                displayWidth = vwHeight * imageRatio
            }

            setCanvasSize({
                width: Math.round(displayWidth),
                height: Math.round(displayHeight),
            })
        }

        calculateCanvasSize()
        window.addEventListener('resize', calculateCanvasSize)
        return () => window.removeEventListener('resize', calculateCanvasSize)
    }, [imageDimensions.width, imageDimensions.height])

    // Convert actual image coordinates to display coordinates based on current canvas size
    const getDisplayCoords = (actualCoords) => {
        if (!actualCoords || canvasSize.width === 0) return null

        const scaleX = canvasSize.width / imageDimensions.width
        const scaleY = canvasSize.height / imageDimensions.height

        return {
            x: Math.round(actualCoords.x * scaleX),
            y: Math.round(actualCoords.y * scaleY),
            width: Math.round(actualCoords.width * scaleX),
            height: Math.round(actualCoords.height * scaleY),
        }
    }

    // Zone overlay component for display
    const ZoneDisplayOverlay = ({
        rect,
        kind,
        isSelected,
        isHovered,
        index,
        textStyle,
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
                            className={`absolute inset-0 bg-linear-to-br from-dark-slate/40 via-dark-slate/35 to-dark-slate/45 ${zoneShape === 'circle' ? 'rounded-full' : ''
                                }`}
                        />
                        <div
                            className={`relative inline-flex items-center gap-2 rounded-full border border-white/70 bg-dark-slate/60 text-white backdrop-blur-sm transition-all ${isTinyZone ? 'h-7 w-7 justify-center' : 'px-3 py-1.5'
                                } ${isSelected || isHovered ? 'ring-2 ring-forest-green' : ''}`}
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
                                fontSize: `${Math.max(
                                    11,
                                    Math.min(
                                        (textStyle?.fontSize || 16) * 0.5,
                                        rect.height * 0.3
                                    )
                                )}px`,
                                lineHeight: textStyle?.lineHeight || 1.4,
                                letterSpacing: `${Math.max(-1, Math.min(textStyle?.letterSpacing || 0, 3))}px`,
                                textAlign: textStyle?.textAlign || 'center',
                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                            }}
                        >
                            {textStyle?.text || 'Custom text here'}
                        </div>
                    </div>
                )}

                {/* Zone label badge */}
                {(isSelected || isHovered) && (
                    <div
                        className={`absolute top-2 left-2 rounded-md text-white text-[9px] px-2 py-0.5 font-bold tracking-wide pointer-events-none ${kind === 'text' ? 'bg-[#2d3857]/85' : 'bg-dark-slate/85'
                            }`}
                    >
                        {kind === 'photo' ? 'PHOTO ZONE' : `TEXT ZONE ${index + 1}`}
                    </div>
                )}
            </div>
        )
    }

    // Calculate display coordinates for photo zone
    const photoZoneDisplay = committedZone?.actual ? getDisplayCoords(committedZone.actual) : null

    // Calculate display coordinates for text zones
    const textZonesDisplay = allowGuestText && textZones
        ? textZones.map((zone) => zone?.actual ? getDisplayCoords(zone.actual) : null)
        : []

    return (
        <div className='w-full h-full flex flex-col'>
            {/* Canvas Container */}
            <div
                ref={containerRef}
                className='flex-1 relative overflow-auto flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(rgba(144,171,139,0.2)_0.8px,transparent_0.8px)] bg-size-[20px_20px]'
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

                        {/* Photo Zone Overlay */}
                        {photoZoneDisplay && (
                            <ZoneDisplayOverlay
                                rect={photoZoneDisplay}
                                kind='photo'
                                isSelected={selectedZoneIndex === 'photo'}
                                isHovered={hoveredZone === 'photo'}
                                onClick={() => onPhotoZoneClick?.()}
                                onMouseEnter={() => onZoneHover?.('photo')}
                                onMouseLeave={() => onZoneHover?.(null)}
                            />
                        )}

                        {/* Text Zones Overlays */}
                        {allowGuestText && textZonesDisplay && textZonesDisplay.map((displayCoords, idx) => (
                            displayCoords && (
                                <ZoneDisplayOverlay
                                    key={`text-zone-${idx}`}
                                    rect={displayCoords}
                                    kind='text'
                                    index={idx}
                                    isSelected={selectedZoneIndex === `text-${idx}`}
                                    isHovered={hoveredZone === `text-${idx}`}
                                    textStyle={guestTextStyle}
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
