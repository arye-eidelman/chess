import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Chess from 'chess.js'

import Game from './Game.js'

const chess = new Chess()

const xyToPosition = ({ x, y }) => chess.SQUARES[y * 8 + x]

const GameContainer = () => {
  const [selectedSquare, setSelectedSquare] = useState(null)

  const canPickUp = position => chess.moves({ square: position }).length > 0

  const pickUpPiece = (position) => {
    if (canPickUp(position)) {
      setSelectedSquare(position)
    }
  }

  const canPutDown = (position) => {
    return chess.moves({ square: selectedSquare }).map(p => p.slice(-2)).includes(position)
  }

  const putDownPiece = (position) => {
    if (canPutDown(position)) {
      chess.move({ from: selectedSquare, to: position })
      setSelectedSquare(null)
    }
  }

  const selectSquare = (position) => {
    if (selectedSquare && canPutDown(position)) {
      putDownPiece(position)
    } else {
      pickUpPiece(position)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Game
        chess={chess}
        xyToPosition={xyToPosition}
        selectedSquare={selectedSquare}
        selectSquare={selectSquare}
        pickUpPiece={pickUpPiece}
        putDownPiece={putDownPiece}
      />
    </DndProvider>
  )
}

export default GameContainer