import React from 'react'

const GameOverScreen = ({ gameState, playingAsColor, onNewGame, opponentType }) => {
  const getGameOverMessage = () => {
    if (gameState.checkmate) {
      // If it's the opponent's turn (they just got checkmated), player won
      // If it's player's turn (they just got checkmated), player lost
      const playerLost = gameState.turn === playingAsColor
      
      if (opponentType === 'ai') {
        return {
          title: playerLost ? 'You Lost!' : 'You Won!',
          message: playerLost ? 'Checkmate! The AI has defeated you.' : 'Checkmate! You defeated the AI!',
          color: playerLost ? 'text-red-600' : 'text-green-600'
        }
      } else {
        const winner = playerLost ? (playingAsColor === 'w' ? 'Black' : 'White') : (playingAsColor === 'w' ? 'White' : 'Black')
        return {
          title: `${winner} Wins!`,
          message: 'Checkmate!',
          color: 'text-blue-600'
        }
      }
    } else if (gameState.stalemate) {
      return {
        title: 'Stalemate!',
        message: 'The game ended in a draw due to stalemate.',
        color: 'text-yellow-600'
      }
    } else if (gameState.threefoldRepetition) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw due to threefold repetition.',
        color: 'text-yellow-600'
      }
    } else if (gameState.insufficient_material) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw due to insufficient material.',
        color: 'text-yellow-600'
      }
    } else if (gameState.draw) {
      return {
        title: 'Draw!',
        message: 'The game ended in a draw.',
        color: 'text-yellow-600'
      }
    } else {
      return {
        title: 'Game Over',
        message: 'The game has ended.',
        color: 'text-gray-600'
      }
    }
  }

  const result = getGameOverMessage()

  return (
    <div className='mt-6 lg:mt-0 bg-white rounded-lg shadow-xl p-6 max-w-md w-full lg:w-auto lg:min-w-[300px] border-2 border-gray-200'>
      <h2 className={`text-2xl font-bold mb-3 text-center ${result.color}`}>
        {result.title}
      </h2>
      <p className='text-base text-gray-700 text-center mb-5'>
        {result.message}
      </p>
      <div className='flex gap-4 justify-center'>
        <button
          onClick={onNewGame}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
        >
          New Game
        </button>
      </div>
    </div>
  )
}

export default GameOverScreen

