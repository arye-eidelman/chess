import React from 'react'

import Board from './Board.js'
import BoardSquare from './BoardSquare.js'
import MovablePiece from './MovablePiece.js'
import PromotionPicker from './PromotionPicker.js'
import Layered from '../utils/Layered.js'

import { pieceKeys, colorKeys } from './constants.js'

const Game = ({
  chess, xyToPosition,
  canPickUp, pickUpPiece,
  canPutDown, putDownPiece,
  selectedSquare, selectSquare,
  promotionHold, selectPromotion, cancelPromotion
}) => (
    <Layered align={{ vertical: "center", horizontal: "center" }}>
      <Board>
        {chess.board().map((row, y) => {
          return row.map((piece, x) => {
            const position = xyToPosition({ x, y })
            const putDown = () => putDownPiece(position)
            const pickUp = () => pickUpPiece(position)
            const select = () => selectSquare(position)

            let renderPiece = piece
            if (promotionHold?.from === position) {
              renderPiece = null
            } else if (promotionHold && promotionHold.to === position) {
              renderPiece = chess.get(promotionHold.from)
            }

            return (
              <BoardSquare
                isDark={chess.square_color(position) === "dark"}
                isFocused={(selectedSquare && selectedSquare === position) || (promotionHold && promotionHold.to === position)}
                canPutDown={canPutDown(position)}
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
        })}
      </Board>

      {promotionHold ? <PromotionPicker pick={selectPromotion} cancel={cancelPromotion} color={colorKeys[chess.turn()]} /> : null}
    </Layered>
  )

export default Game