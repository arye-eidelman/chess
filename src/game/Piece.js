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
      style={{
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
      }}
      ref={ref}
    />
  )
})

export default Piece