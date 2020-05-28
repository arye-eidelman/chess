import React from 'react'
import styled from 'styled-components/macro'
import _ from 'lodash'

import images from './images/index.js'

const imageSource = ({ name, color, rotated = false }) => {
  return images[_.camelCase(`${name}-${color}-${rotated ? "rotated" : ""}`)]
}

const Image = styled.img`
  width: 100%;
  height: 100%;
`

const Piece = (props) => {
  return <Image src={imageSource(props)} alt={`${props.color} ${props.name}`} />
}

export default Piece