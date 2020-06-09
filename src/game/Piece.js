import React from 'react'
import styled from 'styled-components/macro'
import _ from 'lodash'

import images from './images/index.js'

const Image = styled.img`
  width: 100%;
  height: 100%;
`

const Piece = React.forwardRef((props, ref) => {
  const {type, color, rotated} = props
  return (
    <Image
      src={images[_.camelCase(`${type}-${color}-${rotated ? "rotated" : ""}`)]}
      alt={`${color} ${type}`}

      ref={ref}
    />
  )
})

export default Piece