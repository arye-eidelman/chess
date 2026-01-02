import React, { useState } from 'react'

const GameJoin = ({ onJoin, onCancel }) => {
  const [gameCode, setGameCode] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    if (!gameCode || gameCode.length !== 6) {
      setError('Please enter a valid 6-character game code')
      return
    }
    setError('')
    onJoin(gameCode.toUpperCase())
  }

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
              setError('')
            }}
            placeholder='ABCDEF'
            className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-lg text-center uppercase'
            maxLength={6}
            autoFocus
          />
          {error && <p className='text-red-600 text-sm mt-2'>{error}</p>}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={handleJoin}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
          >
            Join Game
          </button>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameJoin

