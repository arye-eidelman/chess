import React, { useState } from 'react'
import _ from 'lodash'
import ResponsiveDndProvider from './ResponsiveDndProvider.js'
import Chess from 'chess.js'

import Game from './Game.js'
import { pieceKeys } from './constants.js'

const chess = new Chess()
window.chess = chess

const xyToPosition = ({ x, y }) => chess.SQUARES[y * 8 + x]

const GameContainer = () => {
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [promotionHold, setPromotionHold] = useState(null)

  const canPickUp = position => chess.moves({ square: position }).length > 0 && !promotionHold

  const pickUpPiece = (position) => {
    if (canPickUp(position)) {
      setSelectedSquare(position)
    }
  }

  const legalMoves = chess.moves({ square: selectedSquare || "or it'll return []", verbose: true })

  const canPutDown = (position) => {
    if (promotionHold) { return false }
    return position === selectedSquare || legalMoves.some(move => move.to === position)
  }

  const putDownPiece = (position) => {
    if (canPutDown(position)) {
      move({ from: selectedSquare, to: position })
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

  const move = (moveObject) => {
    if (legalMoves.some(move => move.to === moveObject.to && move.flags.includes("p"))) {
      setPromotionHold(moveObject)
    } else {
      chess.move(moveObject)
    }
  }

  const selectPromotion = (piece) => {
    chess.move({ ...promotionHold, promotion: _.invert(pieceKeys)[piece] })
    setPromotionHold(null)
  }

  const cancelPromotion = () => setPromotionHold(null)

  return (
    <ResponsiveDndProvider>
      <Game
        chess={chess}
        xyToPosition={xyToPosition}
        canPickUp={canPickUp}
        canPutDown={canPutDown}
        putDownPiece={putDownPiece}
        pickUpPiece={pickUpPiece}
        selectedSquare={selectedSquare}
        selectSquare={selectSquare}
        promotionHold={promotionHold}
        selectPromotion={selectPromotion}
        cancelPromotion={cancelPromotion}
      />
    </ResponsiveDndProvider>
  )
}

export default GameContainer