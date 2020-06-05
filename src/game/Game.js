import React from 'react'

import Board from './Board.js'
import BoardSquare from './BoardSquare.js'
import Piece from './Piece.js'
import PromotionPicker from './PromotionPicker.js'

import { pieceKeys, colorKeys } from './constants.js'

const Game = ({
  chess, xyToPosition,
  canPickUp, pickUpPiece,
  canPutDown, putDownPiece,
  selectedSquare, selectSquare,
  promotionHold, selectPromotion
}) => (
    <div>
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
                  <Piece
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

      {promotionHold ? <PromotionPicker pick={selectPromotion} /> : null}
    </div>
  )

export default Game