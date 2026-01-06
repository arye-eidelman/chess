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


  return (
    <div className='w-full max-w-full mx-auto p-1 md:p-4 layered items-stretch justify-items-center'>
      <section className='aspect-square rounded-lg overflow-hidden grid grid-rows-[repeat(8,_1fr)]
      grid-cols-[repeat(8,_1fr)] border-4 border-neutral-200 w-full md:max-w-initial shadow-lg
      max-w-[min(calc(100vh-10rem),calc(100vw-0.5rem),1000px)]
      md:max-h-[min(calc(100vh-8rem),calc(100vw-20rem))]'>
        {boardPerspective === 'w' ? BoardSquares : BoardSquares.reverse()}
      </section>
      {promotionHold ? <PromotionPicker pick={selectPromotion} cancel={cancelPromotion} color={colorKeys[gameState.turn]} /> : null}
    </div>
  )
}

export default GamePlay