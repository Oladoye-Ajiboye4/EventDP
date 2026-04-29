import React from 'react'
import { Icon } from '@iconify/react'
import { Link } from 'react-router'

const TopNav = ({
    showGenerateLink,
    onGenerateLink,
    isGenerating,
    isPublished,
    projectTitle,
    onProjectTitleChange,
    titleError,
    isTitleLocked,
    onDeleteClick,
    hasDraft,
}) => {
    return (
        <nav className='min-h-16 px-2.5 sm:px-6 py-2 flex items-center justify-between bg-white border-b border-dusty-green/25 z-40 animate-fade-in gap-1.5 sm:gap-3'>
            <div className='flex items-center gap-2.5 sm:gap-6 min-w-0'>
                <h1 className='font-extrabold text-base sm:text-xl tracking-tight text-forest-green'>EventDP</h1>
                <Link
                    to='/dashboard'
                    className='hidden sm:inline-flex items-center text-sm font-medium text-dark-slate/75 hover:text-forest-green transition-colors'
                >
                    Back to Dashboard
                </Link>
            </div>

            <div className='hidden md:flex flex-col min-w-70 max-w-105 w-full'>
                <input
                    type='text'
                    value={projectTitle}
                    onChange={(event) => onProjectTitleChange(event.target.value)}
                    maxLength={80}
                    placeholder='Project title (e.g. Tech Summit 2026)'
                    disabled={isTitleLocked}
                    className='h-10 rounded-xl border border-dusty-green/35 px-3 text-sm text-dark-slate outline-none focus:border-forest-green disabled:opacity-70 disabled:cursor-not-allowed'
                />
                {titleError ? <span className='text-[11px] text-red-600 mt-1'>{titleError}</span> : null}
            </div>

            <div className='flex items-center gap-1.5 sm:gap-3'>
                {showGenerateLink && (
                    <button
                        type='button'
                        onClick={onGenerateLink}
                        disabled={isGenerating || isPublished}
                        className='px-2.5 sm:px-4 py-2 rounded-xl bg-forest-green text-white font-semibold text-[11px] sm:text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-forest-green/20 disabled:opacity-55 disabled:hover:translate-y-0 disabled:cursor-not-allowed whitespace-nowrap'
                    >
                        {isGenerating ? 'Generating...' : (isPublished ? 'Published' : 'Generate')}
                    </button>
                )}
                {hasDraft && (
                    <button
                        type='button'
                        onClick={onDeleteClick}
                        className='h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center'
                        title='Delete project'
                        aria-label='Delete project'
                    >
                        <Icon icon='mdi:trash-can-outline' width='18' height='18' />
                    </button>
                )}
                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-forest-green/25 bg-white overflow-hidden flex items-center justify-center shrink-0'>
                    <Icon icon='mdi:account' width='19' height='19' className='text-forest-green sm:w-[21px] sm:h-[21px]' />
                </div>
            </div>
        </nav>
    )
}

export default TopNav