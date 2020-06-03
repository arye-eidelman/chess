import React from 'react'

import Board from './Board.js'
import BoardSquare from './BoardSquare.js'
import Piece from './Piece.js'

import { pieceKeys, colorKeys } from './constants.js'

const Game = ({ chess, xyToPosition, pickUpPiece, putDownPiece, selectSquare, selectedSquare, legalMoves, canPutDown, canPickUp }) => (
  <Board>
    {chess.board().map((row, y) => {
      return row.map((piece, x) => {
        const position = xyToPosition({ x, y })
        const putDown = () => putDownPiece(position)
        const pickUp = () => pickUpPiece(position)
        const select = () => selectSquare(position)

        return (
          <BoardSquare
            isDark={chess.square_color(position) === "dark"}
            isSelected={selectedSquare && selectedSquare === position}
            canPutDown={canPutDown(position)}
            key={position}
            putDown={putDown}
            pickUp={pickUp}
            onClick={select}
          >
            {piece ? (
              <Piece
                type={pieceKeys[piece.type]}
                color={colorKeys[piece.color]}
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
)

export default Game