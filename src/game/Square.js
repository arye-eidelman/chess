import styled from 'styled-components/macro'

const Square = styled.div`
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${({ isSelected, isUnderDrag, isBlack }) =>
    isSelected ? "lightgreen"
      : isUnderDrag ? "pink"
        : isBlack ? "#bbb"
          : "white"
  };

`

export default Square