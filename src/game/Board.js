import React from 'react'
import styled from 'styled-components/macro'

import Piece from './Piece.js'
import Square from './Square.js'
import initialSetup from './initialSetup.js'

function isBlackSquare(i) {
  return (i % 2) ^ (i / 8 % 2)
}
const Board = ({ className, pieces = initialSetup}) => {
  const squares = Array(64).fill(null)

  return (
    <section className={className}>
      {squares.map((square, i) => 
        <Square color={isBlackSquare(i) ? "#bbb" : "white"} key={i}>
          {pieces[i]
            ? <Piece {...pieces[i]} rotated={false} />
            : null}
        </Square>
      )}
    </section>
  )
}
const styledBoard = styled(Board)`
  box-sizing: border-box;
  display: grid;
  grid-template: repeat(8, 1fr) / repeat(8, 1fr);
  height: min(90vw, 90vh);
  width:  min(90vw, 90vh);
  margin: 0 auto;
  padding: min(5vw, 5vh);
`

export default styledBoard