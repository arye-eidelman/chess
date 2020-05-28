import React from 'react'

import Board from './Board.js'
import BoardSquare from './BoardSquare.js'
import Piece from './Piece.js'

const Game = ({ squares, pickUpPiece, putDownPiece, selectedSquare, pieceAtPosition, isSamePosition, justXY }) => (
  <Board>
    {squares.map((square, i) => {
      const position = justXY(square)
      const putDown = () => putDownPiece(position)
      const pickUp = () => pickUpPiece(position)
      return (
        <BoardSquare
          isBlack={square.isBlack}
          isSelected={selectedSquare && isSamePosition(selectedSquare, position)}
          key={i}
          putDown={putDown}
          pickUp={pickUp}
          onClick={() => selectedSquare ? putDown() : pickUp()}
        >
          {pieceAtPosition(position) ? (
            <Piece
              {...pieceAtPosition(position)}
              putDown={putDown}
              pickUp={pickUp}
            />
          ) : null}
        </BoardSquare>
      )
    }
    )}
  </Board>
)

export default Game