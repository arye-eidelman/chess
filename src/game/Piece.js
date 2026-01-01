import { forwardRef } from 'react'
import camelCase from 'lodash/camelCase'

import images from './images/index.js'

const Piece = forwardRef((props, ref) => {
  const { type, color, rotated } = props
  return (
    <img
      className='w-full h-full'
      src={images[camelCase(`${type}-${color}-${rotated ? "rotated" : ""}`)]}
      alt={`${color} ${type}`}

      ref={ref}
    />
  )
})

export default Piece