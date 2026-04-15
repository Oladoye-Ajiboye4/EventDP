import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { z } from 'zod'
import { useSearchParams } from 'react-router'
import TopNav from './components/TopNav'
import StudioSidebar from './components/StudioSidebar'
import CanvasToolbar from './components/CanvasToolbar'
import CanvasStage from './components/CanvasStage'
import SettingsPanel from './components/SettingsPanel'
import useCreateEventDPState from './logic/useCreateEventDPState'
import { LEFT_NAV_ITEMS } from './constants'
import {
    autosaveDraft,
    createDraft,
    getDraft,
    publishDraft,
    requestUploadSignature,
    uploadToCloudinary,
} from './logic/draftSync'

const titleSchema = z
    .string()
    .trim()
    .min(1, 'Project title is required')
    .max(80, 'Project title must be at most 80 characters')

const publishExpirySchema = z
    .string()
    .min(1, 'Select when the link should expire')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid expiry date')

const ACTIVE_DRAFT_STORAGE_KEY = 'eventdp.activeDraftId'

const serializeEditorSnapshot = (editor = {}) => JSON.stringify({
    zoneShape: editor.zoneShape || 'square',
    committedZone: editor.committedZone || null,
    textZones: Array.isArray(editor.textZones) ? editor.textZones : [],
    activeTextZoneIndex: Number.isInteger(editor.activeTextZoneIndex) ? editor.activeTextZoneIndex : null,
    bleedGuides: typeof editor.bleedGuides === 'boolean' ? editor.bleedGuides : true,
    backgroundOpacity: Number.isFinite(editor.backgroundOpacity) ? editor.backgroundOpacity : 85,
    cornerRadius: Number.isFinite(editor.cornerRadius) ? editor.cornerRadius : 16,
    borderStyle: editor.borderStyle || '',
    snapToGrid: Boolean(editor.snapToGrid),
    allowGuestText: Boolean(editor.allowGuestText),
    activeCanvasTool: editor.activeCanvasTool || 'photo',
    guestTextStyle: editor.guestTextStyle || {},
    zoom: Number.isFinite(editor.zoom) ? editor.zoom : 1,
    activeMenu: editor.activeMenu || 'template',
})

const CreateEventDP = () => {
    const [searchParams] = useSearchParams()
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
    const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false)
    const [draftMeta, setDraftMeta] = useState({ draftId: null, revision: 0, uploadAsset: null })
    const [publishState, setPublishState] = useState('draft')
    const [showPublishConfirm, setShowPublishConfirm] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareLink, setShareLink] = useState('')
    const [projectTitle, setProjectTitle] = useState('Untitled Project')
    const [titleError, setTitleError] = useState('')
    const [linkExpiresAt, setLinkExpiresAt] = useState('')
    const [publishError, setPublishError] = useState('')
    const [isLoadingDraft, setIsLoadingDraft] = useState(false)

    const uploadKeyRef = useRef('')
    const autosaveTimerRef = useRef(null)
    const latestDraftMetaRef = useRef(draftMeta)
    const lastSavedSnapshotRef = useRef('')
    const saveInFlightRef = useRef(false)
    const isHydratingDraftRef = useRef(false)
    const [lastSavedTime, setLastSavedTime] = useState(null)
    const isEditorLocked = publishState === 'published' || publishState === 'publishing'
    const requestedDraftId = searchParams.get('draft') || searchParams.get('draftId') || ''

    const normalizeTitle = useCallback((value) => value.trim().replace(/\s+/g, ' '), [])

    const getValidTitle = useCallback(() => {
        const parsed = titleSchema.safeParse(projectTitle)
        if (!parsed.success) {
            const fallback = 'Untitled Project'
            setTitleError(parsed.error.issues?.[0]?.message || 'Invalid project title')
            return fallback
        }

        setTitleError('')
        return normalizeTitle(parsed.data)
    }, [normalizeTitle, projectTitle])

    const getValidPublishExpiry = () => {
        const parsed = publishExpirySchema.safeParse(linkExpiresAt)
        if (!parsed.success) {
            setPublishError(parsed.error.issues?.[0]?.message || 'Set a valid expiry date')
            return null
        }

        const selectedDate = new Date(parsed.data)
        const now = new Date()
        if (selectedDate <= now) {
            setPublishError('Expiry date must be in the future')
            return null
        }

        const maxAllowed = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))
        if (selectedDate > maxAllowed) {
            setPublishError('Expiry date cannot exceed 365 days')
            return null
        }

        setPublishError('')
        return selectedDate.toISOString()
    }

    const {
        activeMenu,
        setActiveMenu,
        zoneShape,
        zoneShapes,
        selectZoneShape,
        committedZone,
        handleZoneCommit,
        clearCommittedZone,
        textZones,
        activeTextZoneIndex,
        selectedTextZone,
        handleTextZoneCommit,
        clearTextZone,
        addTextZone,
        selectTextZone,
        maxTextZones,
        canvasDimensions,
        backgroundOpacity,
        cornerRadius,
        setRadius,
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
        displayedCanvasSize,
        draftSnapshot,
        hydrateDraft,
    } = useCreateEventDPState()

    const showMobileToolSwitch = Boolean(uploadedImage) && allowGuestText && !mobileSidebarOpen && !mobileSettingsOpen

    useEffect(() => {
        latestDraftMetaRef.current = draftMeta
    }, [draftMeta])

    useEffect(() => {
        if (draftMeta.draftId) {
            localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, draftMeta.draftId)
        }
    }, [draftMeta.draftId])

    useEffect(() => {
        const token = localStorage.getItem('token')
        const fallbackDraftId = localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY) || ''

        // Determine if this is a page reload or fresh navigation
        // If there's a query param (?draft=xxx), always load that draft
        // If there's no query param and we have a fallback, check if we should load it
        const navigationEntry = typeof performance !== 'undefined'
            ? performance.getEntriesByType?.('navigation')?.[0]
            : null
        const legacyNavigationType = typeof performance !== 'undefined' ? performance?.navigation?.type : null
        const isPageReload = navigationEntry?.type === 'reload' || legacyNavigationType === 1

        // Decide which draft to load
        let draftIdToLoad = ''

        if (requestedDraftId) {
            // Explicit query param always takes priority
            draftIdToLoad = requestedDraftId
        } else if (isPageReload && fallbackDraftId) {
            // Only load recent draft if this is a page reload (not navigation)
            draftIdToLoad = fallbackDraftId
        } else if (!isPageReload) {
            // Fresh navigation without query param = create new draft
            // Clear the active draft ID so we start fresh
            localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY)
        }

        if (!token || !draftIdToLoad) {
            return
        }

        let cancelled = false

        const restoreDraft = async () => {
            setIsLoadingDraft(true)
            isHydratingDraftRef.current = true

            try {
                const response = await getDraft({ token, draftId: draftIdToLoad })
                const draft = response?.draft
                if (!draft) {
                    throw new Error('Draft payload missing')
                }

                if (cancelled) {
                    return
                }

                hydrateDraft({ asset: draft.asset, editor: draft.editor })

                setProjectTitle(draft.title || 'Untitled Project')
                setDraftMeta({
                    draftId: draft._id,
                    revision: draft.revision || 1,
                    uploadAsset: draft.asset || null,
                })
                setPublishState(draft.status === 'published' ? 'published' : 'draft')
                setShareLink(draft.publish?.publicUrl || '')
                setLinkExpiresAt(
                    draft.publish?.expiresAt
                        ? new Date(new Date(draft.publish.expiresAt).getTime() - (new Date(draft.publish.expiresAt).getTimezoneOffset() * 60000))
                            .toISOString()
                            .slice(0, 16)
                        : '',
                )
                setTitleError('')
                setPublishError('')
                setShowShareModal(false)
                setShowPublishConfirm(false)

                lastSavedSnapshotRef.current = serializeEditorSnapshot(draft.editor)
            } catch (error) {
                console.error('Failed to restore draft:', error)
                if (!requestedDraftId) {
                    localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY)
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingDraft(false)
                    setTimeout(() => {
                        isHydratingDraftRef.current = false
                    }, 0)
                }
            }
        }

        restoreDraft()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestedDraftId])

    useEffect(() => {
        if (!uploadedImage) {
            uploadKeyRef.current = ''
            setDraftMeta({ draftId: null, revision: 0, uploadAsset: null })
            lastSavedSnapshotRef.current = ''
            setPublishState('draft')
            setShowPublishConfirm(false)
            setShowShareModal(false)
            setShareLink('')
            setProjectTitle('Untitled Project')
            setTitleError('')
            setLinkExpiresAt('')
            setPublishError('')
        }
    }, [uploadedImage])

    useEffect(() => {
        const serializedSnapshot = JSON.stringify(draftSnapshot)

        const bootstrapDraft = async () => {
            if (!uploadedImage?.file || saveInFlightRef.current || isHydratingDraftRef.current || isLoadingDraft) {
                return
            }

            const fileKey = `${uploadedImage.file.name}-${uploadedImage.file.size}-${uploadedImage.file.lastModified}`
            if (uploadKeyRef.current === fileKey) {
                return
            }

            uploadKeyRef.current = fileKey

            const token = localStorage.getItem('token')
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const userEmail = user?.email

            if (!token || !userEmail) {
                console.warn('Missing auth token or user email for draft bootstrap.')
                return
            }

            saveInFlightRef.current = true

            try {
                const signatureData = await requestUploadSignature({
                    token,
                    userEmail,
                    fileName: uploadedImage.file.name,
                })

                const uploadAsset = await uploadToCloudinary({
                    signatureData,
                    file: uploadedImage.file,
                })

                const draftResponse = await createDraft({
                    token,
                    asset: uploadAsset,
                    editor: draftSnapshot,
                    title: getValidTitle(),
                })

                if (draftResponse?.draft?.title) {
                    setProjectTitle(draftResponse.draft.title)
                }

                setDraftMeta({
                    draftId: draftResponse.draft._id,
                    revision: draftResponse.draft.revision,
                    uploadAsset,
                })
                lastSavedSnapshotRef.current = serializedSnapshot
            } catch (error) {
                console.error('Error creating draft:', error)
                uploadKeyRef.current = ''
            } finally {
                saveInFlightRef.current = false
            }
        }

        bootstrapDraft()
    }, [uploadedImage, draftSnapshot, isLoadingDraft, getValidTitle])

    useEffect(() => {
        const serializedSnapshot = JSON.stringify(draftSnapshot)

        if (!draftMeta.draftId || saveInFlightRef.current || isEditorLocked || isHydratingDraftRef.current || isLoadingDraft) {
            return
        }

        if (serializedSnapshot === lastSavedSnapshotRef.current) {
            return
        }

        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current)
        }

        autosaveTimerRef.current = setTimeout(async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                return
            }

            try {
                saveInFlightRef.current = true

                const saveResponse = await autosaveDraft({
                    token,
                    draftId: latestDraftMetaRef.current.draftId,
                    editor: draftSnapshot,
                    baseRevision: latestDraftMetaRef.current.revision,
                    title: getValidTitle(),
                })

                setDraftMeta((prev) => ({
                    ...prev,
                    revision: saveResponse.revision,
                }))
                lastSavedSnapshotRef.current = serializedSnapshot
                setLastSavedTime(new Date())
            } catch (error) {
                if (error?.response?.status === 409 && Number.isInteger(error?.response?.data?.revision)) {
                    setDraftMeta((prev) => ({
                        ...prev,
                        revision: error.response.data.revision,
                    }))
                }
                console.error('Error autosaving draft:', error)
            } finally {
                saveInFlightRef.current = false
            }
        }, 2000)

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current)
            }
        }
    }, [draftMeta.draftId, draftSnapshot, isEditorLocked, isLoadingDraft, getValidTitle])

    useEffect(() => {
        if (!lastSavedTime) {
            return
        }

        const hideTimer = setTimeout(() => {
            setLastSavedTime(null)
        }, 2000)

        return () => clearTimeout(hideTimer)
    }, [lastSavedTime])

    const openShareIntent = (platform) => {
        if (!shareLink) {
            return
        }

        const encodedUrl = encodeURIComponent(shareLink)
        const encodedText = encodeURIComponent('Check out our EventDP link')
        const endpoints = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out our EventDP: ${shareLink}`)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        }

        const targetUrl = endpoints[platform]
        if (targetUrl) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer')
        }
    }

    const copyShareLink = async () => {
        if (!shareLink) {
            return
        }

        try {
            await navigator.clipboard.writeText(shareLink)
            setLastSavedTime(new Date())
        } catch (error) {
            console.error('Failed to copy share link:', error)
        }
    }

    const handleGenerateLinkClick = () => {
        if (!draftMeta.draftId || !uploadedImage || isEditorLocked) {
            return
        }
        if (!linkExpiresAt) {
            const defaultExpiry = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
            const localISO = new Date(defaultExpiry.getTime() - (defaultExpiry.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
            setLinkExpiresAt(localISO)
        }
        setPublishError('')
        setShowPublishConfirm(true)
    }

    const handlePublish = async () => {
        if (!draftMeta.draftId || !uploadedImage) {
            return
        }

        const validExpiryISO = getValidPublishExpiry()
        if (!validExpiryISO) {
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            return
        }

        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current)
            autosaveTimerRef.current = null
        }

        try {
            setPublishState('publishing')
            setShowPublishConfirm(false)
            saveInFlightRef.current = true

            const serializedSnapshot = JSON.stringify(draftSnapshot)
            if (serializedSnapshot !== lastSavedSnapshotRef.current) {
                const saveResponse = await autosaveDraft({
                    token,
                    draftId: latestDraftMetaRef.current.draftId,
                    editor: draftSnapshot,
                    baseRevision: latestDraftMetaRef.current.revision,
                    title: getValidTitle(),
                })

                setDraftMeta((prev) => ({
                    ...prev,
                    revision: saveResponse.revision,
                }))

                latestDraftMetaRef.current = {
                    ...latestDraftMetaRef.current,
                    revision: saveResponse.revision,
                }
                lastSavedSnapshotRef.current = serializedSnapshot
            }

            const publishResponse = await publishDraft({
                token,
                draftId: latestDraftMetaRef.current.draftId,
                editor: draftSnapshot,
                baseRevision: latestDraftMetaRef.current.revision,
                title: getValidTitle(),
                expiresAt: validExpiryISO,
            })

            const nextRevision = publishResponse.revision
            setDraftMeta((prev) => ({
                ...prev,
                revision: nextRevision,
            }))

            setShareLink(publishResponse.publish?.publicUrl || '')
            setPublishState('published')
            setPreviewMode(true)
            setShowShareModal(true)
        } catch (error) {
            console.error('Error publishing EventDP:', error)
            setPublishState('draft')
            setPublishError(error?.response?.data?.message || 'Failed to publish EventDP')
        } finally {
            saveInFlightRef.current = false
        }
    }

    if (isLoadingDraft && !uploadedImage) {
        return (
            <main className='min-h-[100dvh] h-[100dvh] bg-pale-sage flex items-center justify-center'>
                <div className='text-center space-y-3'>
                    <div className='h-12 w-12 rounded-full border-4 border-dusty-green/35 border-t-forest-green animate-spin mx-auto' />
                    <p className='text-sm font-semibold text-dark-slate'>Restoring your draft...</p>
                </div>
            </main>
        )
    }

    return (
        <main className='min-h-[100dvh] h-[100dvh] bg-pale-sage flex flex-col overflow-hidden'>
            <TopNav
                showGenerateLink={Boolean(uploadedImage)}
                onGenerateLink={handleGenerateLinkClick}
                isGenerating={publishState === 'publishing'}
                isPublished={publishState === 'published'}
                projectTitle={projectTitle}
                onProjectTitleChange={setProjectTitle}
                titleError={titleError}
                isTitleLocked={isEditorLocked}
            />

            <div className='md:hidden px-3 py-2 border-b border-dusty-green/20 bg-white'>
                <input
                    type='text'
                    value={projectTitle}
                    onChange={(event) => setProjectTitle(event.target.value)}
                    maxLength={80}
                    placeholder='Project title'
                    disabled={isEditorLocked}
                    className='h-10 w-full rounded-xl border border-dusty-green/35 px-3 text-sm text-dark-slate outline-none focus:border-forest-green disabled:opacity-70 disabled:cursor-not-allowed'
                />
                {titleError ? <p className='text-[11px] text-red-600 mt-1'>{titleError}</p> : null}
            </div>

            {/* Autosave Status Indicator */}
            <div className='fixed top-[7rem] right-2.5 md:top-20 md:right-6 z-30 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium'>
                {saveInFlightRef.current && (
                    <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-green/90 text-white animate-pulse'>
                        <div className='w-1.5 h-1.5 rounded-full bg-white animate-pulse' />
                        <span>Syncing...</span>
                    </div>
                )}
                {lastSavedTime && !saveInFlightRef.current && (
                    <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-green/85 text-white animate-fade-in'>
                        <Icon icon='mdi:check-circle' width='14' height='14' />
                        <span>Saved</span>
                    </div>
                )}
            </div>

            <div className='flex flex-1 overflow-hidden relative'>
                {desktopSidebarOpen && (
                    <StudioSidebar
                        activeMenu={activeMenu}
                        onMenuChange={setActiveMenu}
                        onCollapse={() => setDesktopSidebarOpen(false)}
                    />
                )}

                {!desktopSidebarOpen && (
                    <button
                        type='button'
                        onClick={() => setDesktopSidebarOpen(true)}
                        className='hidden lg:flex absolute top-4 left-4 z-40 h-11 px-3 rounded-xl bg-dark-slate text-white border border-white/15 shadow-lg items-center gap-2'
                        aria-label='Show design studio sidebar'
                    >
                        <Icon icon='mdi:menu-open' width='20' height='20' />
                        <span className='text-xs font-semibold uppercase tracking-wide'>Design Studio</span>
                    </button>
                )}

                <button
                    type='button'
                    onClick={() => {
                        setMobileSettingsOpen(false)
                        setMobileSidebarOpen(true)
                    }}
                    className='lg:hidden absolute top-3 left-3 z-40 h-10 w-10 rounded-xl bg-white border border-dusty-green/30 shadow-md flex items-center justify-center'
                    aria-label='Open tools'
                >
                    <Icon icon='mdi:menu' width='21' height='21' />
                </button>

                {mobileSidebarOpen && (
                    <>
                        <div
                            className='lg:hidden fixed inset-0 bg-dark-slate/45 z-40'
                            onClick={() => setMobileSidebarOpen(false)}
                        ></div>

                        <div className='lg:hidden fixed left-0 top-0 h-full w-[84%] max-w-[320px] bg-dark-slate text-white z-50 p-5 animate-slide-in-left overflow-y-auto'>
                            <div className='flex items-center justify-between mb-5'>
                                <h2 className='font-bold text-xl'>Design Studio</h2>
                                <button
                                    type='button'
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className='h-9 w-9 rounded-lg border border-white/20'
                                >
                                    <Icon icon='mdi:close' width='19' height='19' className='mx-auto' />
                                </button>
                            </div>
                            <div className='space-y-2'>
                                {LEFT_NAV_ITEMS.map((item) => {
                                    const isActive = activeMenu === item.id
                                    return (
                                        <button
                                            key={item.id}
                                            type='button'
                                            onClick={() => {
                                                setActiveMenu(item.id)
                                                setMobileSidebarOpen(false)
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? 'bg-forest-green text-white'
                                                : 'text-white/80 hover:bg-white/10'}`}
                                        >
                                            <Icon icon={item.icon} width='19' height='19' />
                                            <span>{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                <section className={`flex-1 relative overflow-hidden items-center justify-center flex ${showMobileToolSwitch ? 'pb-28' : 'pb-24'} xl:pb-0`}>
                    <CanvasToolbar
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        zoom={zoom}
                        onZoomIn={() => setZoomLevel(zoom + 0.1)}
                        onZoomOut={() => setZoomLevel(zoom - 0.1)}
                        previewMode={previewMode}
                        onTogglePreview={() => setPreviewMode((prev) => !prev)}
                        disabled={isEditorLocked}
                    />

                    <CanvasStage
                        uploadedImage={uploadedImage}
                        onUpload={handleImageUpload}
                        onRemove={removeUploadedImage}
                        backgroundOpacity={backgroundOpacity}
                        cornerRadius={cornerRadius}
                        displayedCanvasSize={displayedCanvasSize}
                        canvasDimensions={canvasDimensions}
                        previewMode={previewMode}
                        zoneShape={zoneShape}
                        committedZone={committedZone}
                        onZoneCommit={handleZoneCommit}
                        onClearZone={clearCommittedZone}
                        textZones={textZones}
                        activeTextZoneIndex={activeTextZoneIndex}
                        selectedTextZone={selectedTextZone}
                        onTextZoneCommit={handleTextZoneCommit}
                        onClearTextZone={clearTextZone}
                        allowGuestText={allowGuestText}
                        activeCanvasTool={activeCanvasTool}
                        guestTextStyle={guestTextStyle}
                        showMobileToolSwitch={showMobileToolSwitch}
                        disabled={isEditorLocked}
                    />
                </section>

                {uploadedImage && (
                    <SettingsPanel
                        zoneShapes={zoneShapes}
                        zoneShape={zoneShape}
                        onSelectZoneShape={selectZoneShape}
                        committedZone={committedZone}
                        onClearZone={clearCommittedZone}
                        canvasDimensions={canvasDimensions}
                        cornerRadius={cornerRadius}
                        onRadiusChange={setRadius}
                        allowGuestText={allowGuestText}
                        onToggleGuestText={toggleGuestText}
                        activeCanvasTool={activeCanvasTool}
                        onSelectCanvasTool={selectCanvasTool}
                        textZones={textZones}
                        activeTextZoneIndex={activeTextZoneIndex}
                        onSelectTextZone={selectTextZone}
                        onAddTextZone={addTextZone}
                        maxTextZones={maxTextZones}
                        onClearTextZone={clearTextZone}
                        guestTextStyle={guestTextStyle}
                        onGuestTextStyleChange={updateGuestTextStyle}
                        disabled={isEditorLocked}
                    />
                )}

                {uploadedImage && (
                    <>
                        {showMobileToolSwitch && (
                            <div className='xl:hidden fixed left-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex items-center rounded-full bg-white/95 backdrop-blur border border-dusty-green/30 shadow-lg p-1'>
                                <button
                                    type='button'
                                    onClick={() => selectCanvasTool('photo')}
                                    disabled={isEditorLocked}
                                    className={`h-10 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${activeCanvasTool === 'photo'
                                        ? 'bg-forest-green text-white'
                                        : 'text-dark-slate hover:bg-pale-sage'}`}
                                    aria-label='Switch to photo zone tool'
                                >
                                    <Icon icon='mdi:image-area' width='15' height='15' />
                                    Photo
                                </button>
                                <button
                                    type='button'
                                    onClick={() => selectCanvasTool('text')}
                                    disabled={isEditorLocked}
                                    className={`h-10 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${activeCanvasTool === 'text'
                                        ? 'bg-[#2d3857] text-white'
                                        : 'text-dark-slate hover:bg-pale-sage'}`}
                                    aria-label='Switch to text zone tool'
                                >
                                    <Icon icon='mdi:format-text-rotation-none' width='15' height='15' />
                                    Text
                                </button>
                            </div>
                        )}

                        {!mobileSidebarOpen && (
                            <button
                                type='button'
                                onClick={() => {
                                    setMobileSidebarOpen(false)
                                    setMobileSettingsOpen(true)
                                }}
                                className={`xl:hidden fixed right-3 ${showMobileToolSwitch ? 'bottom-[calc(3.85rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(0.75rem+env(safe-area-inset-bottom))]'} z-40 h-11 px-3.5 rounded-full bg-dark-slate text-white shadow-lg flex items-center gap-1.5`}
                                aria-label='Open full design settings'
                            >
                                <Icon icon='mdi:tune-vertical-variant' width='18' height='18' />
                                <span className='text-[10px] font-semibold uppercase tracking-wide'>Settings</span>
                            </button>
                        )}

                        {mobileSettingsOpen && (
                            <>
                                <div
                                    className='xl:hidden fixed inset-0 z-40 bg-dark-slate/45'
                                    onClick={() => setMobileSettingsOpen(false)}
                                />
                                <div className='xl:hidden fixed right-0 top-0 h-full w-full max-w-[430px] z-50'>
                                    <SettingsPanel
                                        zoneShapes={zoneShapes}
                                        zoneShape={zoneShape}
                                        onSelectZoneShape={selectZoneShape}
                                        committedZone={committedZone}
                                        onClearZone={clearCommittedZone}
                                        canvasDimensions={canvasDimensions}
                                        cornerRadius={cornerRadius}
                                        onRadiusChange={setRadius}
                                        allowGuestText={allowGuestText}
                                        onToggleGuestText={toggleGuestText}
                                        activeCanvasTool={activeCanvasTool}
                                        onSelectCanvasTool={selectCanvasTool}
                                        textZones={textZones}
                                        activeTextZoneIndex={activeTextZoneIndex}
                                        onSelectTextZone={selectTextZone}
                                        onAddTextZone={addTextZone}
                                        maxTextZones={maxTextZones}
                                        onClearTextZone={clearTextZone}
                                        guestTextStyle={guestTextStyle}
                                        onGuestTextStyleChange={updateGuestTextStyle}
                                        disabled={isEditorLocked}
                                        className='w-full h-full bg-white border-l border-dusty-green/25 flex flex-col overflow-y-auto overscroll-contain animate-slide-in-right pb-[calc(5.5rem+env(safe-area-inset-bottom))]'
                                        onClose={() => setMobileSettingsOpen(false)}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {showPublishConfirm && (
                <div className='fixed inset-0 z-50 bg-dark-slate/55 flex items-center justify-center p-3 sm:p-4'>
                    <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl p-4 sm:p-6 space-y-4'>
                        <h3 className='text-lg font-bold text-dark-slate'>Publish and Generate Link?</h3>
                        <p className='text-sm text-dark-slate/70'>
                            This will lock canvas editing and settings for this EventDP. You can still share the generated link anytime.
                        </p>
                        <div>
                            <label className='block text-sm font-semibold text-dark-slate mb-1'>Link expires at</label>
                            <input
                                type='datetime-local'
                                value={linkExpiresAt}
                                onChange={(event) => setLinkExpiresAt(event.target.value)}
                                className='w-full h-10 rounded-xl border border-dusty-green/35 px-3 text-sm text-dark-slate outline-none focus:border-forest-green'
                                min={new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                            />
                            <p className='text-[11px] text-dark-slate/60 mt-1'>Maximum expiry window is 365 days.</p>
                        </div>
                        {publishError ? <p className='text-sm text-red-600'>{publishError}</p> : null}
                        <div className='flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2'>
                            <button
                                type='button'
                                onClick={() => setShowPublishConfirm(false)}
                                className='h-10 px-4 rounded-xl border border-dusty-green/35 text-dark-slate font-semibold w-full sm:w-auto'
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                onClick={handlePublish}
                                className='h-10 px-4 rounded-xl bg-forest-green text-white font-semibold w-full sm:w-auto'
                            >
                                Publish & Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShareModal && (
                <div className='fixed inset-0 z-50 bg-dark-slate/55 flex items-center justify-center p-3 sm:p-4'>
                    <div className='w-full max-w-xl rounded-2xl bg-white shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5'>
                        <div className='flex items-start justify-between gap-4'>
                            <div>
                                <h3 className='text-lg font-bold text-dark-slate'>Your EventDP Link Is Ready</h3>
                                <p className='text-sm text-dark-slate/70 mt-1'>
                                    Editor is now locked. Share this public link on social platforms.
                                </p>
                            </div>
                            <button
                                type='button'
                                onClick={() => setShowShareModal(false)}
                                className='h-9 w-9 rounded-lg border border-dusty-green/35 text-dark-slate/75'
                                aria-label='Close share modal'
                            >
                                <Icon icon='mdi:close' width='18' height='18' className='mx-auto' />
                            </button>
                        </div>

                        <div className='rounded-xl border border-dusty-green/35 bg-pale-sage/50 p-3 flex items-center gap-2'>
                            <input
                                value={shareLink}
                                readOnly
                                className='flex-1 bg-transparent text-xs sm:text-sm text-dark-slate outline-none'
                            />
                            <button
                                type='button'
                                onClick={copyShareLink}
                                className='h-9 px-3 rounded-lg bg-dark-slate text-white text-xs font-semibold'
                            >
                                Copy Link
                            </button>
                        </div>

                        <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
                            {[
                                { id: 'whatsapp', label: 'WhatsApp', icon: 'mdi:whatsapp' },
                                { id: 'facebook', label: 'Facebook', icon: 'mdi:facebook' },
                                { id: 'x', label: 'X', icon: 'mdi:twitter' },
                                { id: 'linkedin', label: 'LinkedIn', icon: 'mdi:linkedin' },
                                { id: 'telegram', label: 'Telegram', icon: 'mdi:telegram' },
                            ].map((social) => (
                                <button
                                    key={social.id}
                                    type='button'
                                    onClick={() => openShareIntent(social.id)}
                                    className='h-11 rounded-xl border border-dusty-green/35 bg-white text-dark-slate text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-pale-sage transition-colors'
                                >
                                    <Icon icon={social.icon} width='16' height='16' />
                                    {social.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default CreateEventDP