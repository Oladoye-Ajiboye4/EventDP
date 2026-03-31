import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Icon } from '@iconify/react'
import { getPublicEventDP } from '../create_EventDP/logic/draftSync'
import GuestCanvasDisplay from './components/GuestCanvasDisplay'
import GuestSubmissionForm from './components/GuestSubmissionForm'

const PublicEventDP = () => {
    const { slug, projectSlug, accessKey } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [eventDP, setEventDP] = useState(null)
    const [selectedZoneIndex, setSelectedZoneIndex] = useState(null)
    const [hoveredZone, setHoveredZone] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
        const fetchEventDP = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getPublicEventDP({ slug, projectSlug, accessKey })
                setEventDP(response.eventDP || null)
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

    const handlePhotoSubmit = async (file, onSuccess) => {
        try {
            setSubmitting(true)
            // TODO: Implement actual photo upload to specific zone
            console.log('Photo submitted:', file)
            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1500))
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

    const handleTextSubmit = async (zoneIndex, text, onSuccess) => {
        try {
            setSubmitting(true)
            // TODO: Implement actual text submission to specific zone
            console.log('Text submitted to zone', zoneIndex, ':', text)
            // Simulate submission delay
            await new Promise((resolve) => setTimeout(resolve, 1000))
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

    return (
        <main className='min-h-screen bg-pale-sage flex flex-col'>
            {/* Header */}
            <header className='border-b border-dusty-green/20 bg-white/70 backdrop-blur-sm shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
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
            <div className='flex-1 flex flex-col lg:flex-row overflow-hidden'>
                {/* Canvas Section (70%) */}
                <div className='flex-1 flex flex-col overflow-hidden'>
                    {eventDP.asset?.secureUrl ? (
                        <GuestCanvasDisplay
                            eventDP={eventDP}
                            selectedZoneIndex={selectedZoneIndex}
                            onPhotoZoneClick={() => setSelectedZoneIndex('photo')}
                            onTextZoneClick={(idx) => setSelectedZoneIndex(`text-${idx}`)}
                            hoveredZone={hoveredZone}
                            onZoneHover={setHoveredZone}
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
                <div className='w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-dusty-green/20 bg-white/60 backdrop-blur-sm overflow-y-auto'>
                    <div className='p-6 space-y-6'>
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
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${selectedZoneIndex === 'photo'
                                                    ? 'border-forest-green bg-forest-green/10 text-forest-green'
                                                    : 'border-dusty-green/30 hover:border-forest-green/50 text-dark-slate hover:bg-pale-sage/30'
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
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${selectedZoneIndex === `text-${idx}`
                                                    ? 'border-[#465577] bg-[#465577]/10 text-[#465577]'
                                                    : 'border-dusty-green/30 hover:border-[#465577]/50 text-dark-slate hover:bg-pale-sage/30'
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
                    eventDP={eventDP}
                    selectedZoneIndex={selectedZoneIndex}
                    onPhotoSubmit={handlePhotoSubmit}
                    onTextSubmit={handleTextSubmit}
                    onClose={() => setSelectedZoneIndex(null)}
                    isLoading={submitting}
                />
            )}
        </main>
    )
}

export default PublicEventDP
