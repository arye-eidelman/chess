import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import Game from './Game.js'
import initialSetup from './initialSetup.js'

// const positionToString = (p) => `<${p.x}:${p.y}>`
// const pieceToString = (p) => `<${p.x}:${p.y} ${p.color} ${p.name}>`
const isSamePosition = (a, b) => a.x === b.x && a.y === b.y
const justXY = ({ x, y }) => ({ x, y })

const squares = Array(64).fill(null)
  .map((_square, i) => ({ x: i % 8, y: Math.floor(i / 8) }))
  .map(({ x, y }) => ({ x: x, y: y, isBlack: (x % 2) ^ (y % 2), }))


const GameContainer = () => {
  const [pieces, setPieces] = useState(initialSetup)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [gameOver, setGameOver] = useState(false)

  const pieceAtPosition = ({ x, y }) => {
    return pieces.find(position => position.x === x && position.y === y)
  }

  const pickUpPiece = (position) => {
    if (pieceAtPosition(position)) {
      setSelectedSquare(position)
    }
  }

  const putDownPiece = (position) => {
    if (selectedSquare) {
      movePiece(selectedSquare, position)
      setSelectedSquare(null)
    }
  }


  const movePiece = (from, to) => {
    if (isSamePosition(from, to)) return

    setPieces(pieces => {
      return pieces
        .filter(piece => !isSamePosition(piece, to))
        .map(piece => {
          if (isSamePosition(piece, from)) {
            return { ...piece, ...justXY(to) }
          } else {
            return piece
          }
        })
    })
  }
  useEffect(() => {
    if (pieces.filter(piece => piece.name === "king").length < 2) {
      setGameOver(true)
    }
  }, [pieces])

  return (
    <DndProvider backend={HTML5Backend}>
      <Game
        squares={squares}
        selectedSquare={selectedSquare}
        pieceAtPosition={pieceAtPosition}
        isSamePosition={isSamePosition}
        gameOver={gameOver}
        justXY={justXY}
        pickUpPiece={pickUpPiece}
        putDownPiece={putDownPiece}
      />
    </DndProvider>
  )
}

export default GameContainer