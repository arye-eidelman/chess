import React from 'react'
import { useDrag } from 'react-dnd'
import Piece from './Piece.js'

const MovablePiece = (props) => {
  const { pickUp, putDown } = props
  const [{ isDragging }, drag] = useDrag({
    item: { type: "chessPiece" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    begin: pickUp,
    end: (_item, monitor) => monitor.didDrop() || putDown(),
    canDrag: props.canPickUp,
  })

  return (
    <Piece
      ref={drag}
      style={{
        opacity: isDragging ? 0.3 : 1,
        cursor: 'move',
      }}
      {...props}
    />
  )
}

export default MovablePiece