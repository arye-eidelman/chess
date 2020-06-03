import React from 'react'
import { useDrop } from 'react-dnd'

import Square from './Square.js'

const BoardSquare = (props) => {
  const [{ isOver }, drop] = useDrop({
    accept: "chessPiece",
    drop: () => props.putDown(),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  })

  return (
    <Square
      {...props}
      ref={drop}
      isUnderDrag={isOver}
    />
  )
}

export default BoardSquare