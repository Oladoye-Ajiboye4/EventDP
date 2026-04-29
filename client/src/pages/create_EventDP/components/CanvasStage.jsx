import React, { useRef } from 'react'
import { Icon } from '@iconify/react'
import useZoneSelector from '../logic/useZoneSelector'

const lengthToPx = (value, unit = 'px') => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) {
        return 0
    }

    return unit === 'pt' ? parsed * (96 / 72) : parsed
}

const resolveLineHeightCss = (style, scale = 1) => {
    const unit = style?.lineHeightUnit || 'unitless'
    const value = Number.parseFloat(style?.lineHeight)

    if (!Number.isFinite(value)) {
        return 1.25
    }

    if (unit === 'unitless') {
        return value
    }

    const pxValue = lengthToPx(value, unit)
    return `${Math.max(1, pxValue * scale)}px`
}

const HANDLE_CONFIG = [
    { key: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
    { key: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
    { key: 'e', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
    { key: 'w', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
    { key: 'ne', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
    { key: 'nw', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
    { key: 'se', className: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
    { key: 'sw', className: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
]

// Renders selection zone and resize handles.
const ZoneOverlay = ({
    rect,
    kind,
    shape,
    cornerRadius,
    isInteracting,
    showHandles,
    previewMode,
    interactive,
    textStyle,
}) => {
    if (!rect || rect.width < 2 || rect.height < 2) return null

    const borderColor = kind === 'text'
        ? (isInteracting ? 'rgba(70,85,119,0.9)' : '#465577')
        : (isInteracting ? 'rgba(90,120,99,0.8)' : '#5A7863')
    const fillColor = kind === 'text'
        ? (isInteracting ? 'rgba(70,85,119,0.20)' : 'rgba(70,85,119,0.13)')
        : (isInteracting ? 'rgba(90,120,99,0.17)' : 'rgba(90,120,99,0.13)')

    const style = {
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: `2px dashed ${borderColor}`,
        backgroundColor: fillColor,
        pointerEvents: interactive ? 'auto' : 'none',
        transition: isInteracting ? 'none' : 'all 0.2s ease',
        cursor: interactive ? 'move' : 'default',
        overflow: 'hidden',
    }

    if (shape === 'circle') {
        style.borderRadius = '50%'
    } else {
        style.borderRadius = `${cornerRadius}px`
    }

    const isTinyZone = rect.width < 120 || rect.height < 100
    const canShowUploadCue = previewMode && !isInteracting
    const canShowTextCue = kind === 'text' && canShowUploadCue
    const canShowPhotoCue = kind === 'photo' && canShowUploadCue
    const safeTextStyle = textStyle || {}
    const baseFontSizePx = lengthToPx(safeTextStyle.fontSize || 24, safeTextStyle.fontSizeUnit || 'px')
    const baseLetterSpacingPx = lengthToPx(safeTextStyle.letterSpacing || 0, safeTextStyle.letterSpacingUnit || 'px')

    return (
        <div style={style}>
            {canShowPhotoCue && (
                <div
                    className='absolute inset-0 flex items-center justify-center pointer-events-none px-2'
                    aria-hidden='true'
                >
                    <div
                        className={`absolute inset-0 bg-linear-to-br from-dark-slate/70 via-dark-slate/62 to-dark-slate/76 ${shape === 'circle' ? 'rounded-full' : ''}`}
                    />
                    <div
                        className={`relative inline-flex items-center gap-2 rounded-full border border-white/70 bg-dark-slate/72 text-white backdrop-blur-sm shadow-lg ${isTinyZone ? 'h-7 w-7 justify-center' : 'px-3 py-1.5'}`}
                    >
                        <Icon icon='mdi:image-plus-outline' width='14' height='14' />
                        {!isTinyZone && <span className='text-[10px] font-semibold tracking-wide uppercase'>Guest Upload Area</span>}
                    </div>
                </div>
            )}

            {canShowTextCue && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none p-2' aria-hidden='true'>
                    <div className='absolute inset-0 bg-linear-to-b from-[#2d3857]/78 to-[#2d3857]/66' />
                    <div
                        className='relative w-full text-center px-2 text-white/95'
                        style={{
                            fontFamily: safeTextStyle.fontFamily || 'Poppins',
                            fontWeight: safeTextStyle.fontWeight || 700,
                            fontStyle: safeTextStyle.fontStyle || 'normal',
                            textDecoration: safeTextStyle.textDecoration || 'none',
                            textTransform: safeTextStyle.textTransform || 'none',
                            fontSize: `${Math.max(12, Math.min(baseFontSizePx * 0.52, rect.height * 0.35))}px`,
                            lineHeight: resolveLineHeightCss(safeTextStyle, 0.52),
                            letterSpacing: `${Math.max(-2, Math.min(baseLetterSpacingPx * 0.52, 6))}px`,
                            textAlign: safeTextStyle.textAlign || 'center',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                        }}
                    >
                        {safeTextStyle.text || 'Guest custom text'}
                    </div>
                </div>
            )}

            {kind === 'text' && !previewMode && (
                <>
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none p-2'>
                        <div
                            className='w-full text-center wrap-break-word'
                            style={{
                                fontFamily: safeTextStyle.fontFamily || 'Poppins',
                                fontWeight: safeTextStyle.fontWeight || 700,
                                fontStyle: safeTextStyle.fontStyle || 'normal',
                                textDecoration: safeTextStyle.textDecoration || 'none',
                                textTransform: safeTextStyle.textTransform || 'none',
                                fontSize: `${Math.max(11, Math.min(baseFontSizePx * 0.48, rect.height * 0.32))}px`,
                                lineHeight: resolveLineHeightCss(safeTextStyle, 0.48),
                                letterSpacing: `${baseLetterSpacingPx * 0.48}px`,
                                textAlign: safeTextStyle.textAlign || 'center',
                                color: safeTextStyle.color || '#FFFFFF',
                                opacity: 0.9,
                                textShadow: '0 1px 5px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            {safeTextStyle.text || 'Add your custom message'}
                        </div>
                    </div>
                    <div className='absolute top-2 left-2 rounded-full bg-[#2d3857]/85 text-white text-[10px] px-2 py-0.5 font-semibold tracking-wide pointer-events-none'>
                        Text Zone
                    </div>
                </>
            )}

            {showHandles && HANDLE_CONFIG.map((handle) => (
                <span
                    key={handle.key}
                    data-resize-handle={handle.key}
                    className={`absolute h-3 w-3 rounded-full bg-white border shadow ${kind === 'text' ? 'border-[#465577]' : 'border-forest-green'} ${handle.className}`}
                />
            ))}
        </div>
    )
}

const CanvasStage = ({
    uploadedImage,
    onUpload,
    onRemove,
    backgroundOpacity,
    cornerRadius,
    displayedCanvasSize,
    canvasDimensions,
    previewMode,
    // zone
    zoneShape,
    committedZone,
    onZoneCommit,
    onClearZone,
    textZones,
    activeTextZoneIndex,
    selectedTextZone,
    onTextZoneCommit,
    onClearTextZone,
    allowGuestText,
    activeCanvasTool,
    guestTextStyle,
    showMobileToolSwitch = false,
    disabled,
}) => {
    const fileInputRef = useRef(null)

    const isTextTool = activeCanvasTool === 'text' && allowGuestText

    const { canvasRef, isInteracting, activeRect, pointerHandlers } = useZoneSelector({
        zoneShape: isTextTool ? 'square' : zoneShape,
        committedZone: isTextTool ? selectedTextZone : committedZone,
        onZoneCommit: isTextTool ? onTextZoneCommit : onZoneCommit,
        canvasDimensions,
        displayedCanvasSize,
    })

    const handleFilePick = (event) => {
        const [file] = event.target.files || []
        onUpload(file)
        event.target.value = ''
    }

    const canDraw = !!uploadedImage && !previewMode && !disabled && (activeCanvasTool === 'photo' || allowGuestText)
    const photoRect = isTextTool ? committedZone?.display || null : activeRect

    const renderedTextZones = allowGuestText
        ? textZones.map((zone, index) => {
            if (!zone?.display) {
                return { key: `text-zone-${index}`, rect: null, selected: false, style: guestTextStyle }
            }

            const isSelected = index === activeTextZoneIndex
            const rect = (isTextTool && isSelected && activeRect) ? activeRect : zone.display
            return {
                key: `text-zone-${index}`,
                rect,
                selected: isSelected,
                style: zone?.style || guestTextStyle,
            }
        })
        : []

    return (
        <div className='flex-1 relative overflow-hidden'>
            {/* Dotted workspace background */}
            <div className='absolute inset-0 bg-[radial-gradient(rgba(144,171,139,0.35)_0.8px,transparent_0.8px)] bg-size-[20px_20px]' />

            <div className='relative h-full w-full flex items-center justify-center p-3 pt-16 sm:p-10 lg:p-16'>
                {/* Canvas frame */}
                <div
                    className='bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transition-all duration-500 animate-scale-in select-none'
                    style={{
                        width: `${displayedCanvasSize.width}px`,
                        height: `${displayedCanvasSize.height}px`,
                        borderRadius: '14px',
                        cursor: canDraw ? 'crosshair' : 'default',
                        position: 'relative',
                        touchAction: 'none',
                    }}
                    ref={canvasRef}
                    {...(canDraw ? pointerHandlers : {})}
                >
                    {/* Background image or upload prompt */}
                    {uploadedImage ? (
                        <>
                            <img
                                src={uploadedImage.src}
                                alt={uploadedImage.name}
                                draggable={false}
                                className='h-full w-full object-cover pointer-events-none'
                                style={{ opacity: backgroundOpacity / 100 }}
                            />
                            {!previewMode && (
                                <div className={`absolute inset-0 pointer-events-none mix-blend-multiply transition-colors ${isInteracting ? 'bg-black/65' : 'bg-black/25'}`} />
                            )}
                        </>
                    ) : (
                        <button
                            type='button'
                            onClick={() => fileInputRef.current?.click()}
                            className='h-full w-full flex flex-col items-center justify-center text-forest-green/50 hover:text-forest-green hover:bg-pale-sage/40 transition-colors'
                        >
                            <Icon icon='mdi:upload-outline' width='66' height='66' />
                            <span className='mt-3 text-sm font-semibold'>Upload your image</span>
                        </button>
                    )}

                    {photoRect && (
                        <ZoneOverlay
                            rect={photoRect}
                            kind='photo'
                            shape={zoneShape}
                            cornerRadius={cornerRadius}
                            isInteracting={!isTextTool && isInteracting}
                            showHandles={!previewMode && !isTextTool && !!committedZone}
                            previewMode={previewMode}
                            interactive={!previewMode && !isTextTool}
                            textStyle={guestTextStyle}
                        />
                    )}

                    {renderedTextZones.map((zone) => (
                        zone.rect && (
                            <ZoneOverlay
                                key={zone.key}
                                rect={zone.rect}
                                kind='text'
                                shape='square'
                                cornerRadius={10}
                                isInteracting={isTextTool && zone.selected && isInteracting}
                                showHandles={!previewMode && isTextTool && zone.selected}
                                previewMode={previewMode}
                                interactive={!previewMode && isTextTool && zone.selected}
                                textStyle={zone.style}
                            />
                        )
                    ))}

                    {/* Remove image button */}
                    {uploadedImage && !previewMode && !disabled && (
                        <button
                            data-zone-control='true'
                            type='button'
                            onClick={onRemove}
                            className='absolute top-2.5 right-2.5 sm:top-3 sm:right-3 h-10 w-10 sm:h-9 sm:w-9 rounded-full bg-dark-slate/80 text-white flex items-center justify-center hover:bg-dark-slate transition-colors'
                            aria-label='Remove image'
                        >
                            <Icon icon='mdi:close' width='18' height='18' className='sm:w-[18px] sm:h-[18px]' />
                        </button>
                    )}

                    {/* Clear zone button */}
                    {!previewMode && !disabled && isTextTool && Number.isInteger(activeTextZoneIndex) && (
                        <button
                            data-zone-control='true'
                            type='button'
                            onClick={() => onClearTextZone(activeTextZoneIndex)}
                            className='absolute top-2.5 left-2.5 sm:top-3 sm:left-3 h-9 sm:h-7 px-3 sm:px-2 rounded-full bg-[#2d3857]/85 text-white text-[10px] sm:text-[10px] font-semibold flex items-center gap-1 hover:bg-[#2d3857] transition-colors'
                            aria-label='Clear text zone'
                        >
                            <Icon icon='mdi:format-textbox-remove-outline' width='13' height='13' />
                            Clear text zone
                        </button>
                    )}

                    {!previewMode && !disabled && !isTextTool && committedZone && (
                        <button
                            data-zone-control='true'
                            type='button'
                            onClick={onClearZone}
                            className='absolute top-2.5 left-2.5 sm:top-3 sm:left-3 h-9 sm:h-7 px-3 sm:px-2 rounded-full bg-dark-slate/75 text-white text-[10px] sm:text-[10px] font-semibold flex items-center gap-1 hover:bg-dark-slate transition-colors'
                            aria-label='Clear zone'
                        >
                            <Icon icon='mdi:selection-remove' width='13' height='13' />
                            Clear photo zone
                        </button>
                    )}

                    {/* Canvas info badge */}
                    {!previewMode && (
                        <div className='absolute left-2.5 bottom-2.5 sm:left-3 sm:bottom-3 rounded-md bg-dark-slate/70 text-white text-[9px] sm:text-[10px] px-2 py-1 tracking-wide pointer-events-none max-w-[calc(100%-0.9rem)]'>
                            {canvasDimensions.width} × {canvasDimensions.height}px
                            {disabled && ' • published and locked'}
                            {!isTextTool && canDraw && !committedZone && ' • drag to place photo zone'}
                            {!isTextTool && canDraw && committedZone && ' • drag to move, handles to resize'}
                            {isTextTool && canDraw && !selectedTextZone && ' • drag to place text zone'}
                            {isTextTool && canDraw && selectedTextZone && ' • drag to move text, handles to resize'}
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFilePick}
                />
            </div>

            {/* Draw-mode hint ribbon */}
            {canDraw && !isTextTool && !committedZone && (
                <div className={`absolute ${showMobileToolSwitch ? 'bottom-24' : 'bottom-20'} xl:bottom-4 left-1/2 -translate-x-1/2 bg-dark-slate/80 text-white text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full pointer-events-none animate-fade-in-up max-w-[calc(100%-1.2rem)] text-center leading-tight`}>
                    Drag on the image to mark where guests upload their photo
                </div>
            )}

            {canDraw && isTextTool && !selectedTextZone && (
                <div className={`absolute ${showMobileToolSwitch ? 'bottom-24' : 'bottom-20'} xl:bottom-4 left-1/2 -translate-x-1/2 bg-[#2d3857]/88 text-white text-[11px] sm:text-xs font-medium px-4 py-2 rounded-full pointer-events-none animate-fade-in-up max-w-[calc(100%-1.2rem)] text-center leading-tight`}>
                    Drag on the image to place the guest custom text area
                </div>
            )}
        </div>
    )
}

export default CanvasStage