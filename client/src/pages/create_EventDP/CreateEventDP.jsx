import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import TopNav from './components/TopNav'
import StudioSidebar from './components/StudioSidebar'
import CanvasToolbar from './components/CanvasToolbar'
import CanvasStage from './components/CanvasStage'
import SettingsPanel from './components/SettingsPanel'
import MobileControlsPanel from './components/MobileControlsPanel'
import useCreateEventDPState from './logic/useCreateEventDPState'
import { LEFT_NAV_ITEMS } from './constants'
import {
    autosaveDraft,
    createDraft,
    requestUploadSignature,
    uploadToCloudinary,
} from './logic/draftSync'

const CreateEventDP = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [draftMeta, setDraftMeta] = useState({ draftId: null, revision: 0, uploadAsset: null })

    const uploadKeyRef = useRef('')
    const autosaveTimerRef = useRef(null)
    const latestDraftMetaRef = useRef(draftMeta)
    const lastSavedSnapshotRef = useRef('')
    const saveInFlightRef = useRef(false)
    const [lastSavedTime, setLastSavedTime] = useState(null)

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
        setOpacity,
        cornerRadius,
        setRadius,
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
        displayedCanvasSize,
        draftSnapshot,
    } = useCreateEventDPState()

    useEffect(() => {
        latestDraftMetaRef.current = draftMeta
    }, [draftMeta])

    useEffect(() => {
        if (!uploadedImage) {
            uploadKeyRef.current = ''
            setDraftMeta({ draftId: null, revision: 0, uploadAsset: null })
            lastSavedSnapshotRef.current = ''
        }
    }, [uploadedImage])

    useEffect(() => {
        const serializedSnapshot = JSON.stringify(draftSnapshot)

        const bootstrapDraft = async () => {
            if (!uploadedImage?.file || saveInFlightRef.current) {
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
                })

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
    }, [uploadedImage, draftSnapshot])

    useEffect(() => {
        const serializedSnapshot = JSON.stringify(draftSnapshot)

        if (!draftMeta.draftId || saveInFlightRef.current) {
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
                })

                setDraftMeta((prev) => ({
                    ...prev,
                    revision: saveResponse.revision,
                }))
                lastSavedSnapshotRef.current = serializedSnapshot
                setLastSavedTime(new Date())
            } catch (error) {
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
    }, [draftMeta.draftId, draftSnapshot])

    useEffect(() => {
        if (!lastSavedTime) {
            return
        }

        const hideTimer = setTimeout(() => {
            setLastSavedTime(null)
        }, 2000)

        return () => clearTimeout(hideTimer)
    }, [lastSavedTime])

    return (
        <main className='h-screen bg-pale-sage flex flex-col overflow-hidden'>
            <TopNav showGenerateLink={Boolean(uploadedImage)} />

            {/* Autosave Status Indicator */}
            <div className='fixed top-20 right-6 z-30 flex items-center gap-1.5 text-xs font-medium'>
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
                <StudioSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

                <button
                    type='button'
                    onClick={() => setMobileSidebarOpen(true)}
                    className='lg:hidden absolute top-4 left-4 z-40 h-10 w-10 rounded-xl bg-white border border-dusty-green/30 shadow-md flex items-center justify-center'
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

                        <div className='lg:hidden fixed left-0 top-0 h-full w-[84%] max-w-[320px] bg-dark-slate text-white z-50 p-5 animate-slide-in-left'>
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

                <section className='flex-1 relative overflow-hidden items-center justify-center flex'>
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
                    />
                )}

                <MobileControlsPanel
                    zoneShape={zoneShape}
                    zoneShapes={zoneShapes}
                    onSelectZoneShape={selectZoneShape}
                    committedZone={committedZone}
                    onClearZone={clearCommittedZone}
                    backgroundOpacity={backgroundOpacity}
                    onOpacityChange={setOpacity}
                    cornerRadius={cornerRadius}
                    onRadiusChange={setRadius}
                    snapToGrid={snapToGrid}
                    onToggleSnap={toggleSnapToGrid}
                />
            </div>
        </main>
    )
}

export default CreateEventDP