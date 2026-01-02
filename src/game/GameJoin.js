import React, { useState, useEffect } from 'react'

const GameJoin = ({ onJoin, onCancel, joinError, onInputChange, isJoining }) => {
  const [gameCode, setGameCode] = useState('')
  const [localError, setLocalError] = useState('')

  // Auto-join when 6 characters are entered
  useEffect(() => {
    if (gameCode.length === 6 && !isJoining && !joinError) {
      onJoin(gameCode.toUpperCase())
    }
  }, [gameCode, isJoining, joinError, onJoin])

  const handleJoin = () => {
    if (!gameCode || gameCode.length !== 6) {
      setLocalError('Please enter a valid 6-character game code')
      return
    }
    setLocalError('')
    onJoin(gameCode.toUpperCase())
  }

  const error = joinError || localError

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4'>
        <h2 className='text-2xl font-bold mb-4 text-center'>Join Game</h2>
        
        <div className='mb-4'>
          <label className='block text-sm font-semibold mb-2'>Enter Game Code:</label>
          <input
            type='text'
            value={gameCode}
            onChange={(e) => {
              setGameCode(e.target.value.toUpperCase().slice(0, 6))
              setLocalError('')
              onInputChange?.()
            }}
            placeholder='ABCDEF'
            className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-lg text-center uppercase disabled:bg-gray-100 disabled:cursor-not-allowed'
            maxLength={6}
            autoFocus
            disabled={isJoining}
          />
          {isJoining && (
            <div className='flex items-center justify-center gap-2 mt-2 text-blue-600'>
              <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              <span className='text-sm font-semibold'>Joining game...</span>
            </div>
          )}
          {error && !isJoining && <p className='text-red-600 text-sm mt-2'>{error}</p>}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            Join Game
          </button>
          <button
            onClick={onCancel}
            disabled={isJoining}
            className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameJoin

