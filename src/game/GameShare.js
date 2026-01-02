import React, { useState } from 'react'

const GameShare = ({ gameCode, shareableLink, onClose }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Share Game</h2>
        
        <div className='mb-4'>
          <label className='block text-sm font-semibold mb-2'>Game Code:</label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={gameCode}
              readOnly
              className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-lg text-center'
            />
            <button
              onClick={() => copyToClipboard(gameCode)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-semibold mb-2'>Shareable Link:</label>
          <div className='flex gap-2'>
            <input
              type='text'
              value={shareableLink}
              readOnly
              className='flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-sm'
            />
            <button
              onClick={() => copyToClipboard(shareableLink)}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <p className='text-sm text-gray-600 text-center mb-4'>
          Share the game code or link with your friend to start playing!
        </p>

        <button
          onClick={onClose}
          className='w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors'
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default GameShare

