import React from 'react'
// import _ from 'lodash'

import BoardSquare from './BoardSquare.js'
import MovablePiece from './MovablePiece.js'
import PromotionPicker from './PromotionPicker.js'

import { pieceKeys, colorKeys } from './constants.js'

const GamePlay = ({
  gameState,
  xyToPosition, positionToXY,
  canPickUp, pickUpPiece,
  canPutDown, putDownPiece,
  selectedSquare, selectSquare,
  promotionHold, selectPromotion, cancelPromotion,
  boardPerspective, playingAsColor,
  isAITurn, isThinking,
  isOnlineGame, isMyTurn, opponentConnected
}) => {
  const BoardSquares = gameState.board
    .map((row, y) => {
      return row.map((piece, x) => {
        const position = xyToPosition({ x, y })
        const putDown = () => putDownPiece(position)
        const pickUp = () => pickUpPiece(position)
        const select = () => selectSquare(position)

        let renderPiece = piece
        if (promotionHold?.from === position) {
          renderPiece = null
        } else if (promotionHold && promotionHold.to === position) {
          const fromPosition = positionToXY(promotionHold.from)
          renderPiece = gameState.board[fromPosition.y][fromPosition.x]
        }

        const isLastMove = gameState.lastMove && 
          (gameState.lastMove.from === position || gameState.lastMove.to === position)

        return (
          <BoardSquare
            isDark={(x + y) % 2 === 1}
            isFocused={(selectedSquare && selectedSquare === position) || (promotionHold && promotionHold.to === position)}
            canPutDown={canPutDown(position)}
            isLastMove={isLastMove}
            key={position}
            putDown={putDown}
            pickUp={pickUp}
            onClick={select}
          >
            {renderPiece ? (
              <MovablePiece
                type={pieceKeys[renderPiece.type]}
                color={colorKeys[renderPiece.color]}
                canPickUp={canPickUp(position)}
                x={x}
                y={y}
                putDown={putDown}
                pickUp={pickUp}
              />
            ) : null}
          </BoardSquare>
        )
      })
    }).flat() // flattening the array allows for rotating instead of flipping the board
  const getTurnIndicator = () => {
    if (isOnlineGame) {
      if (!opponentConnected) {
        return (
          <div className='mt-4 text-center'>
            <div className='text-lg font-semibold text-yellow-600'>Waiting for opponent to join...</div>
          </div>
        )
      }
      const turnColor = gameState.turn === 'w' ? 'White' : 'Black'
      const isYourTurn = isMyTurn
      return (
        <div className='mt-4 text-center'>
          <div className={`text-lg font-semibold ${isYourTurn ? 'text-green-600' : 'text-gray-600'}`}>
            {isYourTurn ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='h-3 w-3 rounded-full bg-green-600 animate-pulse'></span>
                Your turn ({turnColor})
              </span>
            ) : (
              <span>Opponent's turn ({turnColor})</span>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className='max-w-[calc(100vh_-_20px)] mx-auto p-4 layered items-center justify-items-center'>
      <section className='aspect-square grid grid-rows-[repeat(8,_1fr)] grid-cols-[repeat(8,_1fr)] border-4 border-neutral-200'>
        {boardPerspective === 'w' ? BoardSquares : BoardSquares.reverse()}
      </section>

      {promotionHold ? <PromotionPicker pick={selectPromotion} cancel={cancelPromotion} color={colorKeys[gameState.turn]} /> : null}
      
      {isThinking ? (
        <div className='mt-4 flex items-center justify-center gap-2 text-lg font-semibold text-neutral-700'>
          <div className='flex gap-1'>
            <div className='h-2 w-2 rounded-full bg-neutral-400 thinking-dot'></div>
            <div className='h-2 w-2 rounded-full bg-neutral-400 thinking-dot'></div>
            <div className='h-2 w-2 rounded-full bg-neutral-400 thinking-dot'></div>
          </div>
          <span>AI is thinking...</span>
        </div>
      ) : null}

      {getTurnIndicator()}
    </div>
  )
}

export default GamePlay