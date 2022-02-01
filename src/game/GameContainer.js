import React, { useState, useEffect, useCallback } from 'react'
import _ from 'lodash'
import ResponsiveDndProvider from './ResponsiveDndProvider.js'
import Chess from 'chess.js'

import ChessAPI from './ChessAPI.js'
import Game from './Game.js'
import { pieceKeys } from './constants.js'

const GameContainer = () => {
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [promotionHold, setPromotionHold] = useState(null)

  const [gameID, setGameID] = useState(null)
  const [fen, setFen] = useState(null)
  const [chess, setChess] = useState(new Chess())
  const updateFen = useCallback(() => setFen(ChessAPI.fen(gameID)), [gameID])

  useEffect(() => {
    setChess(new Chess())
    if (gameID) {
      updateFen()
    } else {
      setGameID(ChessAPI.create())
    }
  }, [gameID, updateFen])

  useEffect(() => {
    setChess(fen ? new Chess(fen) : new Chess())
  }, [fen])

  const xyToPosition = ({ x, y }) => chess.SQUARES[y * 8 + x]

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
      ChessAPI.move(gameID, moveObject) && updateFen()
    }
  }

  const selectPromotion = (piece) => {
    const promotionMove = { ...promotionHold, promotion: _.invert(pieceKeys)[piece] }
    ChessAPI.move(gameID, promotionMove) && updateFen()
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