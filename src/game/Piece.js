import React from 'react'
import styled from 'styled-components/macro'
import _ from 'lodash'

import images from './images/index.js'

const Piece = ({ className, name, color, rotated = false }) => {
  const imageKey = _.camelCase(`${name}-${color}-${rotated ? "rotated" : ""}`)
  const image = images[imageKey]
  return (
    <img className={className} src={image} alt={`${color} ${name}`} />
  )
}

const styledPiece = styled(Piece)`
  font-size: 8vw;
  text-align: center;
  width: 100%;
  height: 100%;
`
export default styledPiece