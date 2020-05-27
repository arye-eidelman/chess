import React, { useState } from 'react'
import Board from './Board.js'
import initialSetup from './initialSetup.js'

const Game = () => {
  const [pieces, setPieces] = useState(initialSetup)

  const movePiece = ({ from, to }) => {

    //  something is off if any of these debuggers are hit
    if (typeof from !== "number") { debugger }
    if (typeof to !== "number") { debugger }
    if (to > 63 || to < 0) { debugger }

    setPieces(pieces => {
      console.log(`Attempting to move from: ${from} to: ${to}`)
      const { [from]: moved, ...remaining } = pieces
      return {
        ...remaining,
        [to]: moved
      }
    })
  }


  return (
    <Board pieces={pieces} movePiece={movePiece} />
  )
}

export default Game