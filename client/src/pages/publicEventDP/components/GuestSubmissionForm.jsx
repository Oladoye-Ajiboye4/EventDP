import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import { Icon } from '@iconify/react'
import 'react-image-crop/dist/ReactCrop.css'
import {
    clampCropRect,
    getDefaultCropRect,
} from '../logic/photoCrop'

/**
 * Form component for guests to submit their content (images or text)
 * Handles file uploads for photo zones and text input for text zones
 */
const GuestSubmissionForm = ({
    selectedZoneIndex,
    onPhotoSubmit,
    onPhotoDraftChange,
    onTextSubmit,
    onClose,
    isLoading,
    initialText,
    initialPhotoMeta,
    initialPhotoSrc,
    initialPhotoAdjustments,
    photoZoneAspectRatio = 1,
}) => {
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [photoMeta, setPhotoMeta] = useState({ width: 0, height: 0 })
    const [previewRenderSize, setPreviewRenderSize] = useState({ width: 0, height: 0 })
    const [photoCropRect, setPhotoCropRect] = useState(null)
    const [photoCropMode, setPhotoCropMode] = useState(false)
    const [photoZoom, setPhotoZoom] = useState(1)
    const [processingPhoto, setProcessingPhoto] = useState(false)
    const [textInput, setTextInput] = useState('')
    const [formError, setFormError] = useState(null)
    const fileInputRef = useRef(null)
    const previewImageRef = useRef(null)

    const isPhotoZone = selectedZoneIndex === 'photo'
    const isTextZone = typeof selectedZoneIndex === 'string' && selectedZoneIndex.startsWith('text-')
    const effectivePreviewRenderSize = useMemo(() => ({
        width: previewRenderSize.width > 0
            ? Math.round(previewRenderSize.width * Math.max(1, photoZoom))
            : 0,
        height: previewRenderSize.height > 0
            ? Math.round(previewRenderSize.height * Math.max(1, photoZoom))
            : 0,
    }), [photoZoom, previewRenderSize.height, previewRenderSize.width])

    useEffect(() => {
        if (!isTextZone) {
            return
        }

        setTextInput(initialText || '')
        setFormError(null)
    }, [initialText, isTextZone, selectedZoneIndex])

    useEffect(() => {
        if (!isPhotoZone || photoPreview || !initialPhotoSrc) {
            return
        }

        const nextMeta = initialPhotoMeta && typeof initialPhotoMeta === 'object'
            ? initialPhotoMeta
            : { width: 0, height: 0 }

        setPhotoPreview(initialPhotoSrc)
        setPhotoMeta(nextMeta)
        setPhotoCropRect(initialPhotoAdjustments?.cropRect && nextMeta.width && nextMeta.height
            ? clampCropRect(initialPhotoAdjustments.cropRect, nextMeta.width, nextMeta.height)
            : null)
        setPhotoCropMode(Boolean(initialPhotoAdjustments?.cropMode))
        setPhotoZoom(Math.max(1, Number(initialPhotoAdjustments?.zoom || 1)))
    }, [initialPhotoAdjustments, initialPhotoMeta, initialPhotoSrc, isPhotoZone, photoPreview])

    useEffect(() => {
        if (!isPhotoZone || !photoPreview) {
            return
        }

        onPhotoDraftChange?.({
            photoSrc: photoPreview,
            photoMeta,
            photoAdjustments: {
                cropRect: photoCropMode ? photoCropRect : null,
                zoom: photoZoom,
                cropMode: photoCropMode,
            },
        })
    }, [isPhotoZone, onPhotoDraftChange, photoCropMode, photoCropRect, photoMeta, photoPreview, photoZoom])

    const loadImageElement = (src) => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = src
    })

    const emitPhotoDraftChange = (nextPhotoSrc, nextMeta, nextCropRect, nextZoom, nextCropMode) => {
        onPhotoDraftChange?.({
            photoSrc: nextPhotoSrc,
            photoMeta: nextMeta,
            photoAdjustments: nextPhotoSrc ? {
                cropRect: nextCropMode && nextCropRect
                    ? clampCropRect(nextCropRect, Number(nextMeta?.width) || 0, Number(nextMeta?.height) || 0)
                    : null,
                zoom: nextZoom,
                cropMode: nextCropMode,
            } : null,
        })
    }

    const resetPhotoEditor = () => {
        setPhotoZoom(1)
        setPreviewRenderSize({ width: 0, height: 0 })
        setPhotoCropRect(null)
        setPhotoCropMode(false)
    }

    const naturalCropToDisplayCrop = (cropRect, meta, renderSize) => {
        if (!cropRect || !meta?.width || !meta?.height || !renderSize?.width || !renderSize?.height) {
            return null
        }

        const scaleX = renderSize.width / meta.width
        const scaleY = renderSize.height / meta.height

        return {
            unit: 'px',
            x: Number(cropRect.x || 0) * scaleX,
            y: Number(cropRect.y || 0) * scaleY,
            width: Number(cropRect.width || 0) * scaleX,
            height: Number(cropRect.height || 0) * scaleY,
        }
    }

    const displayCropToNaturalCrop = (cropRect, meta, renderSize) => {
        if (!cropRect || !meta?.width || !meta?.height || !renderSize?.width || !renderSize?.height) {
            return null
        }

        const scaleX = meta.width / renderSize.width
        const scaleY = meta.height / renderSize.height

        return clampCropRect({
            x: Number(cropRect.x || 0) * scaleX,
            y: Number(cropRect.y || 0) * scaleY,
            width: Number(cropRect.width || 0) * scaleX,
            height: Number(cropRect.height || 0) * scaleY,
        }, meta.width, meta.height)
    }

    const displayCropRect = useMemo(() => (
        naturalCropToDisplayCrop(photoCropRect, photoMeta, effectivePreviewRenderSize)
    ), [effectivePreviewRenderSize, photoCropRect, photoMeta])

    const recalculatePreviewBaseSize = () => {
        const img = previewImageRef.current
        if (!img) {
            return
        }

        const rect = img.getBoundingClientRect()
        const zoom = Math.max(1, photoZoom)
        const nextBaseSize = {
            width: Math.max(1, Math.round(rect.width / zoom)),
            height: Math.max(1, Math.round(rect.height / zoom)),
        }

        setPreviewRenderSize((prev) => (
            prev.width === nextBaseSize.width && prev.height === nextBaseSize.height
                ? prev
                : nextBaseSize
        ))
    }

    const handlePreviewImageLoad = (event) => {
        const img = event.currentTarget
        const nextMeta = {
            width: Number(img.naturalWidth) || photoMeta.width,
            height: Number(img.naturalHeight) || photoMeta.height,
        }

        const rect = img.getBoundingClientRect()
        const zoom = Math.max(1, photoZoom)
        const nextRenderSize = {
            width: Math.max(1, Math.round(rect.width / zoom)),
            height: Math.max(1, Math.round(rect.height / zoom)),
        }

        setPhotoMeta(nextMeta)
        setPreviewRenderSize(nextRenderSize)

        if (!photoCropRect && nextMeta.width && nextMeta.height) {
            setPhotoCropRect(getDefaultCropRect(nextMeta.width, nextMeta.height, photoZoneAspectRatio, 1))
        }
    }

    useEffect(() => {
        recalculatePreviewBaseSize()
    }, [photoZoom])

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setFormError('Please select a valid image file')
            return
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setFormError('File size must be less than 10MB')
            return
        }

        setPhotoFile(file)
        setFormError(null)
        resetPhotoEditor()

        // Create preview
        const reader = new FileReader()
        reader.onload = async (event) => {
            const previewSrc = event.target?.result
            setPhotoPreview(previewSrc)

            try {
                const image = await loadImageElement(previewSrc)
                const nextMeta = { width: image.width, height: image.height }
                const nextCrop = getDefaultCropRect(image.width, image.height, photoZoneAspectRatio, 1)
                setPhotoMeta(nextMeta)
                setPhotoCropRect(nextCrop)
                setPhotoCropMode(false)
                setPhotoZoom(1)
                emitPhotoDraftChange(previewSrc, nextMeta, nextCrop, 1, false)
            } catch {
                setPhotoMeta({ width: 0, height: 0 })
            }
        }
        reader.readAsDataURL(file)
    }

    const handleCropChange = (crop) => {
        if (!photoMeta.width || !photoMeta.height || !crop || !effectivePreviewRenderSize.width || !effectivePreviewRenderSize.height) {
            return
        }

        const nextCrop = displayCropToNaturalCrop(crop, photoMeta, effectivePreviewRenderSize)
        if (!nextCrop) {
            return
        }

        setPhotoCropRect(nextCrop)
    }

    const handleZoomChange = (event) => {
        const nextZoom = Number(event.target.value)
        setPhotoZoom(nextZoom)
    }

    const handleCropModeToggle = () => {
        if (!photoPreview) {
            fileInputRef.current?.click()
            return
        }

        setPhotoCropMode((current) => {
            const nextMode = !current

            if (nextMode && !photoCropRect && photoMeta.width && photoMeta.height) {
                const fallbackCrop = getDefaultCropRect(photoMeta.width, photoMeta.height, photoZoneAspectRatio, 1)
                setPhotoCropRect(fallbackCrop)
            }

            return nextMode
        })
    }

    const handlePhotoSubmit = async () => {
        if (!photoFile && !photoPreview) {
            setFormError('Please select a photo')
            return
        }

        setProcessingPhoto(true)

        try {
            onPhotoSubmit?.({
                file: photoFile,
                photoSrc: photoPreview,
                adjustments: {
                    cropRect: photoCropMode ? photoCropRect : null,
                    zoom: photoZoom,
                    cropMode: photoCropMode,
                },
                meta: photoMeta,
            }, () => {
                setPhotoFile(null)
                setPhotoPreview(null)
                setPhotoMeta({ width: 0, height: 0 })
                setFormError(null)
                resetPhotoEditor()
            })
        } catch {
            setFormError('Could not prepare this image. Please try another photo.')
        } finally {
            setProcessingPhoto(false)
        }
    }

    const handleTextSubmit = () => {
        const trimmedText = textInput.trim()
        if (!trimmedText) {
            setFormError('Please enter some text')
            return
        }

        if (trimmedText.length > 500) {
            setFormError('Text must be 500 characters or less')
            return
        }

        const textZoneIndex = parseInt(selectedZoneIndex.split('-')[1])
        onTextSubmit?.(textZoneIndex, trimmedText, () => {
            setTextInput('')
            setFormError(null)
        })
    }

    if (!isPhotoZone && !isTextZone) {
        return (
            <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center text-dark-slate/60'>
                    <p className='text-sm'>Select a zone to submit content</p>
                </div>
            </div>
        )
    }

    return (
        <div className='fixed inset-0 flex items-end justify-center p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pointer-events-none z-100'>
            <style>{`
                /* Increase crop handle touch targets and visibility */
                .react-image-crop__resize-handle {
                    width: 20px !important;
                    height: 20px !important;
                    background: rgba(255,255,255,0.95) !important;
                    border: 2px solid rgba(31,41,55,0.9) !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.12) !important;
                    border-radius: 4px !important;
                    margin: -10px !important;
                    z-index: 30 !important;
                }
                .react-image-crop__resize-handle--e,
                .react-image-crop__resize-handle--w { cursor: ew-resize !important; }
                .react-image-crop__resize-handle--n,
                .react-image-crop__resize-handle--s { cursor: ns-resize !important; }
                .react-image-crop__crop-selection {
                    outline: 2px dashed rgba(34,197,94,0.85) !important;
                    outline-offset: -6px !important;
                }
                /* Larger touch targets on touch devices */
                @media (hover: none) {
                    .react-image-crop__resize-handle {
                        width: 30px !important;
                        height: 30px !important;
                        margin: -15px !important;
                        border-radius: 6px !important;
                    }
                }
            `}</style>
            {/* Submission Panel */}
            <div className='bg-white rounded-t-2xl shadow-2xl border border-dusty-green/20 w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] pointer-events-auto overflow-hidden flex flex-col animate-slide-up'>
                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b border-dusty-green/10'>
                    <div>
                        <h3 className='text-sm font-bold text-dark-slate'>
                            {isPhotoZone ? 'Upload Photo' : 'Add Text'}
                        </h3>
                        <p className='text-xs text-dark-slate/60 mt-0.5'>
                            {isPhotoZone ? 'Share your photo' : 'Write your message'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-dark-slate/50 hover:text-dark-slate transition-colors'
                        aria-label='Close'
                    >
                        <Icon icon='mdi:close' width='20' height='20' />
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                    {/* Photo Zone Form */}
                    {isPhotoZone && (
                        <>
                            {photoPreview ? (
                                <div className='space-y-3'>
                                    <div className='flex items-center justify-between gap-2'>
                                        <button
                                            type='button'
                                            onClick={handleCropModeToggle}
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${photoCropMode ? 'bg-forest-green text-white' : 'bg-pale-sage text-dark-slate border border-dusty-green/30'}`}
                                        >
                                            <Icon icon='mdi:crop-free' width='16' height='16' />
                                            {photoCropMode ? 'Crop enabled' : 'Crop photo'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPhotoFile(null)
                                                setPhotoPreview(null)
                                                setPhotoMeta({ width: 0, height: 0 })
                                                resetPhotoEditor()
                                                emitPhotoDraftChange('', null, null, 1, false)
                                                if (fileInputRef.current) fileInputRef.current.value = ''
                                            }}
                                            className='h-8 w-8 rounded-full bg-dark-slate/80 text-white flex items-center justify-center hover:bg-dark-slate transition-colors'
                                            aria-label='Remove'
                                        >
                                            <Icon icon='mdi:close' width='16' height='16' />
                                        </button>
                                    </div>

                                    <div className='rounded-2xl overflow-hidden bg-slate-950/5 border border-dusty-green/15 p-2'>
                                        {photoCropMode && photoCropRect ? (
                                            <div className='max-h-[58svh] overflow-auto touch-pan-x touch-pan-y'>
                                                <ReactCrop
                                                    crop={displayCropRect || undefined}
                                                    onChange={handleCropChange}
                                                    aspect={photoZoneAspectRatio}
                                                    minWidth={40}
                                                    minHeight={40}
                                                    keepSelection
                                                    className='mx-auto'
                                                >
                                                    <img
                                                        ref={previewImageRef}
                                                        src={photoPreview}
                                                        alt='Preview'
                                                        className='block select-none'
                                                        style={{
                                                            width: effectivePreviewRenderSize.width > 0 ? `${effectivePreviewRenderSize.width}px` : 'auto',
                                                            height: effectivePreviewRenderSize.height > 0 ? `${effectivePreviewRenderSize.height}px` : 'auto',
                                                            maxWidth: effectivePreviewRenderSize.width > 0 ? 'none' : '100%',
                                                            maxHeight: effectivePreviewRenderSize.height > 0 ? 'none' : '58svh',
                                                        }}
                                                        draggable={false}
                                                        onLoad={handlePreviewImageLoad}
                                                    />
                                                </ReactCrop>
                                            </div>
                                        ) : (
                                            <img
                                                ref={previewImageRef}
                                                src={photoPreview}
                                                alt='Preview'
                                                className='block max-w-full max-h-[58svh] mx-auto select-none'
                                                style={{
                                                    width: effectivePreviewRenderSize.width > 0 ? `${effectivePreviewRenderSize.width}px` : 'auto',
                                                    height: effectivePreviewRenderSize.height > 0 ? `${effectivePreviewRenderSize.height}px` : 'auto',
                                                    maxWidth: effectivePreviewRenderSize.width > 0 ? 'none' : '100%',
                                                    maxHeight: effectivePreviewRenderSize.height > 0 ? 'none' : '58svh',
                                                    objectFit: 'contain',
                                                }}
                                                draggable={false}
                                                onLoad={handlePreviewImageLoad}
                                            />
                                        )}
                                    </div>

                                    <div className='grid grid-cols-1 gap-2 text-[11px] text-dark-slate/70'>
                                        <label className='space-y-1'>
                                            <span className='flex items-center justify-between'>
                                                <span>Zoom</span>
                                                <span className='font-semibold text-dark-slate'>{Math.round(photoZoom * 100)}%</span>
                                            </span>
                                            <input
                                                type='range'
                                                min='1'
                                                max='3'
                                                step='0.01'
                                                value={photoZoom}
                                                onChange={handleZoomChange}
                                                className='w-full cursor-grab active:cursor-grabbing accent-forest-green'
                                            />
                                        </label>
                                    </div>

                                    <p className='text-[10px] text-dark-slate/55'>
                                        {photoCropMode
                                            ? 'Drag the crop edges or corners. The main flier updates as you edit.'
                                            : 'Turn on crop mode to adjust the frame.'}
                                        {photoMeta.width && photoMeta.height ? ` Source: ${photoMeta.width} x ${photoMeta.height}px.` : ''}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className='relative rounded-lg border-2 border-dashed border-dusty-green/30 hover:border-forest-green/50 bg-pale-sage/20 hover:bg-pale-sage/40 transition-all py-6 flex flex-col items-center justify-center gap-2 text-dark-slate/60 hover:text-forest-green'
                                >
                                    <Icon icon='mdi:cloud-upload-outline' width='28' height='28' />
                                    <div className='text-xs font-medium'>Click to upload</div>
                                    <div className='text-[10px]'>or drag and drop</div>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handleFileSelect}
                                disabled={isLoading}
                            />
                        </>
                    )}

                    {/* Text Zone Form */}
                    {isTextZone && (
                        <textarea
                            value={textInput}
                            onChange={(e) => {
                                setTextInput(e.target.value)
                                setFormError(null)
                            }}
                            placeholder='Write your message here...'
                            maxLength={500}
                            className='w-full h-28 sm:h-24 p-3 rounded-lg border border-dusty-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none resize-none text-sm text-dark-slate placeholder:text-dark-slate/40'
                            disabled={isLoading}
                        />
                    )}

                    {/* Character Count */}
                    {isTextZone && (
                        <div className='text-xs text-dark-slate/50 text-right'>
                            {textInput.length}/500
                        </div>
                    )}

                    {/* Error Message */}
                    {formError && (
                        <div className='flex gap-2 items-start p-2 rounded-lg bg-red-50 border border-red-200'>
                            <Icon icon='mdi:alert-circle-outline' width='16' height='16' className='text-red-600 mt-0.5 shrink-0' />
                            <p className='text-xs text-red-600'>{formError}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className='flex flex-col sm:flex-row gap-2 p-4 border-t border-dusty-green/10 bg-pale-sage/30'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 rounded-lg border border-dusty-green/20 text-dark-slate font-medium text-sm hover:bg-white/50 transition-colors'
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isPhotoZone ? handlePhotoSubmit : handleTextSubmit}
                        disabled={isLoading || processingPhoto || (isPhotoZone ? !photoPreview : !textInput.trim())}
                        className='flex-1 px-4 py-2 rounded-lg bg-forest-green text-white font-medium text-sm hover:bg-forest-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2'
                    >
                        {(isLoading || processingPhoto) && <Icon icon='mdi:loading' width='16' height='16' className='animate-spin' />}
                        {isLoading ? 'Uploading...' : (processingPhoto ? 'Preparing...' : 'Submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuestSubmissionForm
