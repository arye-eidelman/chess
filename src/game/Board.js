import styled from 'styled-components/macro'

const Board = styled.section`
  box-sizing: border-box;
  display: grid;
  grid-template: repeat(8, 1fr) / repeat(8, 1fr);
  height: min(90vw, 90vh);
  width:  min(90vw, 90vh);
  margin: 0 auto;
  padding: min(3vw, 3vh);
`

export default Board