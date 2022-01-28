import React from 'react'
import _ from 'lodash'

import images from './images/index.js'

const Piece = React.forwardRef((props, ref) => {
  const {type, color, rotated} = props
  return (
    <img
      className='w-full h-full'
      src={images[_.camelCase(`${type}-${color}-${rotated ? "rotated" : ""}`)]}
      alt={`${color} ${type}`}

      ref={ref}
    />
  )
})

export default Piece