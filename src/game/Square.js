import React from 'react'
import styled from 'styled-components/macro'

const Square = ({ className, children }) => {
  return (
    <div className={className}>
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
  background-color: ${({ color }) => color || "white"};
  border: 0.51px solid black;
`

export default StyledSquare