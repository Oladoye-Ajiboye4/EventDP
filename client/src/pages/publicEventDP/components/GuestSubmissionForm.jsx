import React, { useState, useRef } from 'react'
import { Icon } from '@iconify/react'

/**
 * Form component for guests to submit their content (images or text)
 * Handles file uploads for photo zones and text input for text zones
 */
const GuestSubmissionForm = ({
    eventDP,
    selectedZoneIndex,
    onPhotoSubmit,
    onTextSubmit,
    onClose,
    isLoading,
}) => {
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [textInput, setTextInput] = useState('')
    const [formError, setFormError] = useState(null)
    const fileInputRef = useRef(null)

    const isPhotoZone = selectedZoneIndex === 'photo'
    const isTextZone = typeof selectedZoneIndex === 'string' && selectedZoneIndex.startsWith('text-')

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

        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
            setPhotoPreview(event.target?.result)
        }
        reader.readAsDataURL(file)
    }

    const handlePhotoSubmit = () => {
        if (!photoFile) {
            setFormError('Please select a photo')
            return
        }

        onPhotoSubmit?.(photoFile, () => {
            setPhotoFile(null)
            setPhotoPreview(null)
            setFormError(null)
        })
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
        <div className='absolute inset-0 flex items-end justify-center p-4 pointer-events-none'>
            {/* Submission Panel */}
            <div className='bg-white rounded-t-2xl shadow-2xl border border-dusty-green/20 w-full max-w-md pointer-events-auto overflow-hidden animate-slide-up'>
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
                <div className='p-4 space-y-3'>
                    {/* Photo Zone Form */}
                    {isPhotoZone && (
                        <>
                            {photoPreview ? (
                                <div className='relative rounded-lg overflow-hidden bg-gray-100 aspect-square'>
                                    <img
                                        src={photoPreview}
                                        alt='Preview'
                                        className='w-full h-full object-cover'
                                    />
                                    <button
                                        onClick={() => {
                                            setPhotoFile(null)
                                            setPhotoPreview(null)
                                            if (fileInputRef.current) fileInputRef.current.value = ''
                                        }}
                                        className='absolute top-2 right-2 h-8 w-8 rounded-full bg-dark-slate/80 text-white flex items-center justify-center hover:bg-dark-slate transition-colors'
                                        aria-label='Remove'
                                    >
                                        <Icon icon='mdi:close' width='16' height='16' />
                                    </button>
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
                            className='w-full h-24 p-3 rounded-lg border border-dusty-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none resize-none text-sm text-dark-slate placeholder:text-dark-slate/40'
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
                <div className='flex gap-2 p-4 border-t border-dusty-green/10 bg-pale-sage/30'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2 rounded-lg border border-dusty-green/20 text-dark-slate font-medium text-sm hover:bg-white/50 transition-colors'
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isPhotoZone ? handlePhotoSubmit : handleTextSubmit}
                        disabled={isLoading || (isPhotoZone ? !photoFile : !textInput.trim())}
                        className='flex-1 px-4 py-2 rounded-lg bg-forest-green text-white font-medium text-sm hover:bg-forest-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2'
                    >
                        {isLoading && <Icon icon='mdi:loading' width='16' height='16' className='animate-spin' />}
                        {isLoading ? 'Uploading...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GuestSubmissionForm
