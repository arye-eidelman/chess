import React from 'react'
import styled from 'styled-components/macro'
import _ from 'lodash'
import { useDrag } from 'react-dnd'

import images from './images/index.js'

const imageSource = ({ type, color, rotated = false }) => {
  return images[_.camelCase(`${type}-${color}-${rotated ? "rotated" : ""}`)]
}

const Image = styled.img`
  width: 100%;
  height: 100%;
`

const Piece = (props) => {
  const { type, color, pickUp, putDown } = props
  const [{ isDragging }, drag] = useDrag({
    item: { type: "knight" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    begin: pickUp,
    end: (_item, monitor) => monitor.didDrop() || putDown(),
  })

  return (
    <Image
      src={imageSource(props)}
      alt={`${color} ${type}`}

      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        borderWidth: "3px",
        borderColor: isDragging ? "red" : "green",
        cursor: 'move',
      }}
    />
  )
}

export default Piece