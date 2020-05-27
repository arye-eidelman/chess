import React from 'react'
import styled from 'styled-components/macro'

const Square = ({ className, children, isBlack }) => {
  return (
    <div className={className} style={{
      backgroundColor: isBlack ? "#bbb" : "white"
    }}>
      {children}
    </div>
  )
}
const StyledSquare = styled(Square)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 0.51px solid black;
`

export default StyledSquare