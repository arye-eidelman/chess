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
    <div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in'>
        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
            <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
            </svg>
          </div>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>Join Game</h2>
          <p className='text-gray-600 text-sm'>Enter the 6-character game code</p>
        </div>
        
        <div className='mb-6'>
          <label className='block text-sm font-semibold mb-3 text-gray-700'>Game Code</label>
          <div className='relative'>
            <input
              type='text'
              value={gameCode}
              onChange={(e) => {
                setGameCode(e.target.value.toUpperCase().slice(0, 6))
                setLocalError('')
                onInputChange?.()
              }}
              placeholder='ABCDEF'
              className={`
                w-full px-6 py-4 border-2 rounded-xl font-mono text-2xl text-center uppercase
                tracking-widest transition-all duration-200
                ${error && !isJoining
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }
                disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
              `}
              maxLength={6}
              autoFocus
              disabled={isJoining}
            />
            {gameCode.length > 0 && gameCode.length < 6 && !isJoining && (
              <div className='absolute bottom-2 left-0 right-0 flex justify-center gap-1'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i < gameCode.length ? 'bg-blue-500 w-8' : 'bg-gray-300 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {isJoining && (
            <div className='flex items-center justify-center gap-3 mt-4 p-4 bg-blue-50 rounded-xl'>
              <svg className='animate-spin h-6 w-6 text-blue-600' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              <span className='text-blue-700 font-semibold'>Joining game...</span>
            </div>
          )}
          {error && !isJoining && (
            <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
              <svg className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          )}
        </div>

        <div className='flex gap-3'>
          <button
            onClick={handleJoin}
            disabled={isJoining || gameCode.length !== 6}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none'
          >
            Join Game
          </button>
          <button
            onClick={onCancel}
            disabled={isJoining}
            className='px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameJoin

