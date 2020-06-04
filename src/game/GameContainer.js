import React, { useState } from 'react'
import ResponsiveDndProvider from './ResponsiveDndProvider.js'
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

  const legalMoves = chess.moves({ square: selectedSquare || "never-mind", verbose: true }).map(m => m.to)

  const canPutDown = (position) => legalMoves.includes(position) || position === selectedSquare

  const putDownPiece = (position) => {
    if (canPutDown(position)) {
      chess.move({ from: selectedSquare, to: position })
      setSelectedSquare(null)
    }
  }

  const selectSquare = (position) => {
    if (canPutDown(position)) {
      putDownPiece(position)
    } else {
      pickUpPiece(position)
    }
  }

  return (
    <ResponsiveDndProvider>
      <Game
        chess={chess}
        xyToPosition={xyToPosition}
        selectedSquare={selectedSquare}
        selectSquare={selectSquare}
        pickUpPiece={pickUpPiece}
        putDownPiece={putDownPiece}
        legalMoves={legalMoves}
        canPickUp={canPickUp}
        canPutDown={canPutDown}
      />
    </ResponsiveDndProvider>
  )
}

export default GameContainer