import React, { useState, useEffect } from 'react'

const GameShare = ({ gameCode, shareableLink, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(null)
  const [copiedLink, setCopiedLink] = useState(null)

  const copyCodeToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    })
  }
  const copyLinkToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    })
  }

  // Reset copied state after 2 seconds
  useEffect(() => {
    let timeoutId = null
    if (copiedCode) {
      timeoutId = setTimeout(() => {
        setCopiedCode(false)
      }, 2000)
    }
    return () => clearTimeout(timeoutId)
  }, [copiedCode, copiedLink])

  useEffect(() => {
    let timeoutId = null
    if (copiedLink) {
      timeoutId = setTimeout(() => {
        setCopiedLink(false)
      }, 2000)
    }
    return () => clearTimeout(timeoutId)
  }, [copiedLink])

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in'>
        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
            <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.688l1.281-1.281m0 0l5.25-5.25m-5.25 5.25l-5.25 5.25M3.75 21.75h16.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 4.5v15.25a2.25 2.25 0 002.25 2.25z' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>Share Game</h2>
          <p className='text-gray-600 text-sm'>Share with your friend to start playing</p>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14' />
            </svg>
            Game Code
          </label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={gameCode}
              readOnly
              className='flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-mono text-xl text-center bg-gray-50 font-bold tracking-widest'
            />
            <button
              onClick={() => copyCodeToClipboard(gameCode)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${copiedCode
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {copiedCode ? (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' />
            </svg>
            Shareable Link
          </label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={shareableLink}
              readOnly
              className='flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm bg-gray-50'
            />
            <button
              onClick={() => copyLinkToClipboard(shareableLink)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${copiedLink
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              {copiedLink ? (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6'>
          <p className='text-sm text-blue-800 text-center flex items-center justify-center gap-2'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            Share the game code or link with your friend to start playing!
          </p>
        </div>

        <button
          onClick={onClose}
          className='w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors'
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default GameShare

