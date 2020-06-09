import styled from 'styled-components/macro'

const Layered = styled.div`
  display: grid;
  ${({ align: { vertical } }) => vertical && `align-items: ${vertical}`};
  ${({ align: { horizontal } }) => horizontal && `justify-items: ${horizontal}`};

  & > * {
    grid-column-start: 1;
    grid-row-start: 1;
  }
`

export default Layered;