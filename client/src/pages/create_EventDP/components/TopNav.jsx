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
}) => {
    return (
        <nav className='min-h-16 px-4 sm:px-6 py-2 flex items-center justify-between bg-white border-b border-dusty-green/25 z-40 animate-fade-in gap-3'>
            <div className='flex items-center gap-6'>
                <h1 className='font-extrabold text-xl tracking-tight text-forest-green'>EventDP</h1>
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

            <div className='flex items-center gap-3'>
                {showGenerateLink && (
                    <button
                        type='button'
                        onClick={onGenerateLink}
                        disabled={isGenerating || isPublished}
                        className='px-4 py-2 rounded-xl bg-forest-green text-white font-semibold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-forest-green/20 disabled:opacity-55 disabled:hover:translate-y-0 disabled:cursor-not-allowed'
                    >
                        {isGenerating ? 'Generating...' : (isPublished ? 'Published' : 'Generate Link')}
                    </button>
                )}
                <div className='w-10 h-10 rounded-full border-2 border-forest-green/25 bg-white overflow-hidden flex items-center justify-center'>
                    <Icon icon='mdi:account' width='21' height='21' className='text-forest-green' />
                </div>
            </div>
        </nav>
    )
}

export default TopNav