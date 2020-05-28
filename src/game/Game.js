import React from 'react'

import Board from './Board.js'
import Square from './Square.js'
import Piece from './Piece.js'
const Game = ({ squares, pieces, selectSquare, selectedSquare, pieceAtPosition, isSamePosition }) => (
  <Board>
    {squares.map((square, i) =>
      <Square
        {...square}
        selected={selectedSquare && isSamePosition(selectedSquare, square)}
        key={i}
        onClick={() => selectSquare(square)}
      >
        {pieceAtPosition(square) ? <Piece {...pieceAtPosition(square)} /> : null}
      </Square>
    )}
  </Board>
)

export default Game